const express = require("express");
const { body } = require("express-validator");
const pool = require("../db/connection");
const { verifyToken } = require("../middleware/auth");
const { handleValidation } = require("../middleware/validate");

const router = express.Router();

const VALID_OUTCOMES = ["answered", "no-answer", "callback-requested", "interested", "not-interested", "admitted", "rescheduled"];
const VALID_STATUSES = ["new", "contacted", "demo-scheduled", "demo-visited", "follow-up", "admitted", "not-interested", "lost"];

router.post(
  "/leads/:id/followup",
  verifyToken,
  [
    body("outcome").isIn(VALID_OUTCOMES).withMessage("Invalid outcome"),
    body("status_changed_to").optional({ nullable: true }).isIn(VALID_STATUSES),
    body("duration_mins").optional({ nullable: true }).isInt({ min: 0 })
  ],
  handleValidation,
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const { outcome, status_changed_to, duration_mins, notes, next_action, next_follow_up_date } = req.body;
      await connection.beginTransaction();

      const [leadRows] = await connection.execute("SELECT id FROM leads WHERE id = ? LIMIT 1", [req.params.id]);
      if (!leadRows.length) {
        await connection.rollback();
        return res.status(404).json({ success: false, error: "Lead not found" });
      }

      const [result] = await connection.execute(
        `INSERT INTO follow_ups
         (lead_id, counsellor_id, duration_mins, outcome, status_changed_to, notes, next_action, next_follow_up_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.params.id,
          req.user.id,
          duration_mins || null,
          outcome,
          status_changed_to || null,
          notes || null,
          next_action || null,
          next_follow_up_date || null
        ]
      );

      const updateParts = ["next_follow_up_date = ?"];
      const updateParams = [next_follow_up_date || null];

      if (status_changed_to) {
        updateParts.push("status = ?");
        updateParams.push(status_changed_to);
      }

      updateParams.push(req.params.id);
      await connection.execute(`UPDATE leads SET ${updateParts.join(", ")} WHERE id = ?`, updateParams);

      await connection.commit();
      return res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (error) {
      await connection.rollback();
      return res.status(500).json({ success: false, error: "Failed to log follow-up" });
    } finally {
      connection.release();
    }
  }
);

router.get("/leads/:id/followups", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT f.*, c.name AS counsellor_name
       FROM follow_ups f
       JOIN counsellors c ON c.id = f.counsellor_id
       WHERE f.lead_id = ?
       ORDER BY f.created_at DESC`,
      [req.params.id]
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch follow-ups" });
  }
});

router.get("/followups/today", verifyToken, async (req, res) => {
  try {
    const params = [];
    const scope = ["DATE(l.next_follow_up_date) = CURDATE()"];

    if (!["admin", "centre_head"].includes(req.user.role)) {
      scope.push("l.counsellor_id = ?");
      params.push(req.user.id);
    }

    const [rows] = await pool.execute(
      `SELECT l.*, c.name AS counsellor_name
       FROM leads l
       LEFT JOIN counsellors c ON c.id = l.counsellor_id
       WHERE ${scope.join(" AND ")}
       AND l.status NOT IN ('admitted', 'not-interested', 'lost')
       ORDER BY l.priority = 'high' DESC, l.updated_at ASC`,
      params
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch today's follow-ups" });
  }
});

router.get("/followups/overdue", verifyToken, async (req, res) => {
  try {
    const params = [];
    const scope = ["DATE(l.next_follow_up_date) < CURDATE()"];

    if (!["admin", "centre_head"].includes(req.user.role)) {
      scope.push("l.counsellor_id = ?");
      params.push(req.user.id);
    }

    const [rows] = await pool.execute(
      `SELECT l.*, c.name AS counsellor_name
       FROM leads l
       LEFT JOIN counsellors c ON c.id = l.counsellor_id
       WHERE ${scope.join(" AND ")}
       AND l.status NOT IN ('admitted', 'not-interested', 'lost')
       ORDER BY l.next_follow_up_date ASC`,
      params
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch overdue follow-ups" });
  }
});

module.exports = router;
