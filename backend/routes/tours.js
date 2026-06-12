const express = require("express");
const { body } = require("express-validator");
const pool = require("../db/connection");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { handleValidation } = require("../middleware/validate");

const router = express.Router();

const attachBookings = async (slots) => {
  if (!slots.length) return [];
  const ids = slots.map((slot) => slot.id);
  const placeholders = ids.map(() => "?").join(", ");
  const [bookings] = await pool.execute(
    `SELECT tb.*, l.parent_name, l.child_name, l.parent_phone, c.name AS booked_by_name
     FROM tour_bookings tb
     JOIN leads l ON l.id = tb.lead_id
     LEFT JOIN counsellors c ON c.id = tb.booked_by
     WHERE tb.slot_id IN (${placeholders})
     ORDER BY tb.created_at DESC`,
    ids
  );

  return slots.map((slot) => ({
    ...slot,
    available_count: Number(slot.capacity) - Number(slot.booked_count),
    bookings: bookings.filter((booking) => booking.slot_id === slot.id)
  }));
};

router.get("/slots", verifyToken, async (req, res) => {
  try {
    const includeFull = req.query.include_full === "true";
    const days = Number(req.query.days || 30);
    const [slots] = await pool.execute(
      `SELECT *
       FROM tour_slots
       WHERE slot_date >= CURDATE()
       AND slot_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
       ${includeFull ? "" : "AND booked_count < capacity"}
       ORDER BY slot_date ASC, slot_time ASC`,
      [days]
    );

    return res.json({ success: true, data: await attachBookings(slots) });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch tour slots" });
  }
});

router.post(
  "/slots",
  verifyToken,
  requireAdmin,
  [
    body("slot_date").isISO8601().withMessage("Valid slot_date is required"),
    body("slot_time").notEmpty().withMessage("slot_time is required"),
    body("capacity").optional().isInt({ min: 1 })
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { slot_date, slot_time, capacity = 5, notes } = req.body;
      const [result] = await pool.execute(
        "INSERT INTO tour_slots (slot_date, slot_time, capacity, notes) VALUES (?, ?, ?, ?)",
        [slot_date, slot_time, capacity, notes || null]
      );

      return res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Failed to create tour slot" });
    }
  }
);

router.post(
  "/book",
  verifyToken,
  [
    body("lead_id").isInt().withMessage("lead_id is required"),
    body("slot_id").isInt().withMessage("slot_id is required")
  ],
  handleValidation,
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const { lead_id, slot_id } = req.body;
      await connection.beginTransaction();

      const [slots] = await connection.execute(
        "SELECT * FROM tour_slots WHERE id = ? FOR UPDATE",
        [slot_id]
      );

      if (!slots.length) {
        await connection.rollback();
        return res.status(404).json({ success: false, error: "Tour slot not found" });
      }

      if (Number(slots[0].booked_count) >= Number(slots[0].capacity)) {
        await connection.rollback();
        return res.status(400).json({ success: false, error: "Tour slot is full" });
      }

      const [leads] = await connection.execute("SELECT id FROM leads WHERE id = ? LIMIT 1", [lead_id]);
      if (!leads.length) {
        await connection.rollback();
        return res.status(404).json({ success: false, error: "Lead not found" });
      }

      const [existing] = await connection.execute(
        "SELECT id FROM tour_bookings WHERE lead_id = ? AND status IN ('confirmed', 'visited') LIMIT 1",
        [lead_id]
      );

      if (existing.length) {
        await connection.rollback();
        return res.status(400).json({ success: false, error: "Lead already has an active tour booking" });
      }

      const [result] = await connection.execute(
        "INSERT INTO tour_bookings (lead_id, slot_id, booked_by) VALUES (?, ?, ?)",
        [lead_id, slot_id, req.user.id]
      );
      await connection.execute("UPDATE tour_slots SET booked_count = booked_count + 1 WHERE id = ?", [slot_id]);
      await connection.execute("UPDATE leads SET status = 'demo-scheduled' WHERE id = ?", [lead_id]);

      await connection.commit();
      return res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (error) {
      await connection.rollback();
      return res.status(500).json({ success: false, error: "Failed to book tour" });
    } finally {
      connection.release();
    }
  }
);

router.patch(
  "/book/:id",
  verifyToken,
  [body("status").isIn(["confirmed", "cancelled", "visited", "no-show"]).withMessage("Invalid booking status")],
  handleValidation,
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [bookings] = await connection.execute(
        "SELECT * FROM tour_bookings WHERE id = ? FOR UPDATE",
        [req.params.id]
      );

      if (!bookings.length) {
        await connection.rollback();
        return res.status(404).json({ success: false, error: "Tour booking not found" });
      }

      const booking = bookings[0];
      await connection.execute("UPDATE tour_bookings SET status = ? WHERE id = ?", [req.body.status, req.params.id]);

      if (booking.status !== "cancelled" && req.body.status === "cancelled") {
        await connection.execute(
          "UPDATE tour_slots SET booked_count = GREATEST(booked_count - 1, 0) WHERE id = ?",
          [booking.slot_id]
        );
      }

      if (req.body.status === "visited") {
        await connection.execute("UPDATE leads SET status = 'demo-visited' WHERE id = ?", [booking.lead_id]);
        await connection.execute(
          `INSERT INTO follow_ups
           (lead_id, counsellor_id, outcome, status_changed_to, notes, next_action)
           VALUES (?, ?, 'answered', 'demo-visited', ?, 'Post-demo follow-up')`,
          [booking.lead_id, req.user.id, "Demo visit marked as completed"]
        );
      }

      await connection.commit();
      return res.json({ success: true, data: { id: Number(req.params.id), status: req.body.status } });
    } catch (error) {
      await connection.rollback();
      return res.status(500).json({ success: false, error: "Failed to update tour booking" });
    } finally {
      connection.release();
    }
  }
);

module.exports = router;
