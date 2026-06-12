const express = require("express");
const { body } = require("express-validator");
const pool = require("../db/connection");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { handleValidation } = require("../middleware/validate");

const router = express.Router();

const VALID_STATUSES = ["new", "contacted", "demo-scheduled", "demo-visited", "follow-up", "admitted", "not-interested", "lost"];
const VALID_PRIORITIES = ["high", "medium", "low"];
const VALID_SOURCES = ["walk-in", "website", "referral", "whatsapp", "phone", "social-media"];
const LEAD_FIELDS = [
  "parent_name",
  "parent_phone",
  "parent_email",
  "child_name",
  "child_age",
  "child_dob",
  "program_interest",
  "source",
  "status",
  "priority",
  "counsellor_id",
  "notes",
  "next_follow_up_date",
  "referral_by",
  "address"
];

const statusToOutcome = (status) => {
  if (status === "admitted") return "admitted";
  if (["not-interested", "lost"].includes(status)) return "not-interested";
  if (status === "demo-scheduled") return "interested";
  if (status === "demo-visited") return "answered";
  if (status === "follow-up") return "callback-requested";
  return "answered";
};

const cleanValue = (value) => (value === "" ? null : value);

const buildLeadInsert = (payload, fallbackCounsellorId = null) => {
  const fields = [
    "parent_name",
    "parent_phone",
    "parent_email",
    "child_name",
    "child_age",
    "child_dob",
    "program_interest",
    "source",
    "status",
    "priority",
    "counsellor_id",
    "notes",
    "next_follow_up_date",
    "referral_by",
    "address"
  ];

  const values = fields.map((field) => {
    if (field === "status") return payload.status || "new";
    if (field === "priority") return payload.priority || "medium";
    if (field === "source") return payload.source || "phone";
    if (field === "counsellor_id") return payload.counsellor_id || fallbackCounsellorId;
    return cleanValue(payload[field] ?? null);
  });

  return { fields, values };
};

router.get("/", verifyToken, async (req, res) => {
  try {
    const { status, counsellor_id, priority, date_from, date_to, search } = req.query;
    const where = [];
    const params = [];

    if (status) {
      where.push("l.status = ?");
      params.push(status);
    }

    if (counsellor_id) {
      where.push("l.counsellor_id = ?");
      params.push(counsellor_id);
    }

    if (priority) {
      where.push("l.priority = ?");
      params.push(priority);
    }

    if (date_from) {
      where.push("DATE(l.created_at) >= ?");
      params.push(date_from);
    }

    if (date_to) {
      where.push("DATE(l.created_at) <= ?");
      params.push(date_to);
    }

    if (search) {
      where.push("(l.parent_name LIKE ? OR l.parent_phone LIKE ? OR l.child_name LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const sql = `
      SELECT l.*, c.name AS counsellor_name
      FROM leads l
      LEFT JOIN counsellors c ON c.id = l.counsellor_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY l.updated_at DESC, l.created_at DESC
    `;

    const [rows] = await pool.execute(sql, params);
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch leads" });
  }
});

router.post(
  "/",
  verifyToken,
  [
    body("parent_name").trim().notEmpty().withMessage("Parent name is required"),
    body("parent_phone").trim().notEmpty().withMessage("Parent phone is required"),
    body("status").optional().isIn(VALID_STATUSES),
    body("priority").optional().isIn(VALID_PRIORITIES),
    body("source").optional().isIn(VALID_SOURCES)
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { fields, values } = buildLeadInsert(req.body, req.body.counsellor_id || req.user.id);
      const placeholders = fields.map(() => "?").join(", ");
      const [result] = await pool.execute(
        `INSERT INTO leads (${fields.join(", ")}) VALUES (${placeholders})`,
        values
      );

      const [rows] = await pool.execute(
        `SELECT l.*, c.name AS counsellor_name
         FROM leads l
         LEFT JOIN counsellors c ON c.id = l.counsellor_id
         WHERE l.id = ?`,
        [result.insertId]
      );

      return res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Failed to create lead" });
    }
  }
);

router.post("/import", verifyToken, async (req, res) => {
  try {
    const leads = Array.isArray(req.body) ? req.body : req.body.leads;

    if (!Array.isArray(leads)) {
      return res.status(400).json({ success: false, error: "Request body must be an array of leads" });
    }

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const [index, lead] of leads.entries()) {
      if (!lead.parent_name || !lead.parent_phone) {
        skipped += 1;
        errors.push({ row: index + 1, error: "parent_name and parent_phone are required" });
        continue;
      }

      const [existing] = await pool.execute("SELECT id FROM leads WHERE parent_phone = ? LIMIT 1", [lead.parent_phone]);
      if (existing.length) {
        skipped += 1;
        errors.push({ row: index + 1, error: "Duplicate phone number" });
        continue;
      }

      const { fields, values } = buildLeadInsert(lead, lead.counsellor_id || req.user.id);
      const placeholders = fields.map(() => "?").join(", ");
      await pool.execute(`INSERT INTO leads (${fields.join(", ")}) VALUES (${placeholders})`, values);
      imported += 1;
    }

    return res.status(201).json({ success: true, data: { imported, skipped, errors } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to import leads" });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const [leadRows] = await pool.execute(
      `SELECT l.*, c.name AS counsellor_name, c.email AS counsellor_email, c.phone AS counsellor_phone
       FROM leads l
       LEFT JOIN counsellors c ON c.id = l.counsellor_id
       WHERE l.id = ?`,
      [req.params.id]
    );

    if (!leadRows.length) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    const [followUps] = await pool.execute(
      `SELECT f.*, c.name AS counsellor_name
       FROM follow_ups f
       JOIN counsellors c ON c.id = f.counsellor_id
       WHERE f.lead_id = ?
       ORDER BY f.created_at DESC`,
      [req.params.id]
    );

    const [tourBookings] = await pool.execute(
      `SELECT tb.*, ts.slot_date, ts.slot_time, ts.capacity, ts.booked_count, c.name AS booked_by_name
       FROM tour_bookings tb
       JOIN tour_slots ts ON ts.id = tb.slot_id
       LEFT JOIN counsellors c ON c.id = tb.booked_by
       WHERE tb.lead_id = ?
       ORDER BY tb.created_at DESC`,
      [req.params.id]
    );

    const [admissions] = await pool.execute(
      "SELECT * FROM admissions WHERE lead_id = ? LIMIT 1",
      [req.params.id]
    );

    return res.json({
      success: true,
      data: {
        ...leadRows[0],
        follow_ups: followUps,
        tour_bookings: tourBookings,
        admission: admissions[0] || null
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch lead" });
  }
});

router.patch(
  "/:id/status",
  verifyToken,
  [body("status").isIn(VALID_STATUSES).withMessage("Invalid lead status")],
  handleValidation,
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const { status, note, next_follow_up_date } = req.body;
      await connection.beginTransaction();

      const [existing] = await connection.execute("SELECT id FROM leads WHERE id = ? LIMIT 1", [req.params.id]);
      if (!existing.length) {
        await connection.rollback();
        return res.status(404).json({ success: false, error: "Lead not found" });
      }

      await connection.execute(
        "UPDATE leads SET status = ?, next_follow_up_date = COALESCE(?, next_follow_up_date) WHERE id = ?",
        [status, cleanValue(next_follow_up_date || null), req.params.id]
      );

      await connection.execute(
        `INSERT INTO follow_ups
         (lead_id, counsellor_id, outcome, status_changed_to, notes, next_action, next_follow_up_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.params.id,
          req.user.id,
          statusToOutcome(status),
          status,
          note || `Status updated to ${status}`,
          req.body.next_action || null,
          cleanValue(next_follow_up_date || null)
        ]
      );

      await connection.commit();
      return res.json({ success: true, data: { id: Number(req.params.id), status } });
    } catch (error) {
      await connection.rollback();
      return res.status(500).json({ success: false, error: "Failed to update status" });
    } finally {
      connection.release();
    }
  }
);

router.patch(
  "/:id/assign",
  verifyToken,
  requireAdmin,
  [body("counsellor_id").isInt().withMessage("Valid counsellor_id is required")],
  handleValidation,
  async (req, res) => {
    try {
      const [counsellors] = await pool.execute(
        "SELECT id FROM counsellors WHERE id = ? AND is_active = TRUE LIMIT 1",
        [req.body.counsellor_id]
      );

      if (!counsellors.length) {
        return res.status(404).json({ success: false, error: "Counsellor not found" });
      }

      const [result] = await pool.execute(
        "UPDATE leads SET counsellor_id = ? WHERE id = ?",
        [req.body.counsellor_id, req.params.id]
      );

      if (!result.affectedRows) {
        return res.status(404).json({ success: false, error: "Lead not found" });
      }

      return res.json({ success: true, data: { id: Number(req.params.id), counsellor_id: req.body.counsellor_id } });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Failed to assign counsellor" });
    }
  }
);

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const updates = [];
    const params = [];

    for (const field of LEAD_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        if (field === "status" && !VALID_STATUSES.includes(req.body[field])) {
          return res.status(400).json({ success: false, error: "Invalid lead status" });
        }
        if (field === "priority" && !VALID_PRIORITIES.includes(req.body[field])) {
          return res.status(400).json({ success: false, error: "Invalid priority" });
        }
        if (field === "source" && !VALID_SOURCES.includes(req.body[field])) {
          return res.status(400).json({ success: false, error: "Invalid source" });
        }
        updates.push(`${field} = ?`);
        params.push(cleanValue(req.body[field]));
      }
    }

    if (!updates.length) {
      return res.status(400).json({ success: false, error: "No valid lead fields provided" });
    }

    params.push(req.params.id);
    const [result] = await pool.execute(`UPDATE leads SET ${updates.join(", ")} WHERE id = ?`, params);

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    return res.json({ success: true, data: { id: Number(req.params.id) } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update lead" });
  }
});

module.exports = router;
