const express = require("express");
const { body } = require("express-validator");
const pool = require("../db/connection");
const { verifyToken } = require("../middleware/auth");
const { handleValidation } = require("../middleware/validate");
const { generateOperationalRecommendations } = require("../services/aiEngine");

const router = express.Router();

const SOURCES = [
  "parent-enquiry",
  "teacher-dashboard",
  "centre-admin-panel",
  "daycare-routine",
  "classroom-activity",
  "parent-portal",
  "counsellor-follow-up"
];
const EVENT_STATUSES = ["new", "in-review", "action-needed", "completed"];
const PRIORITIES = ["high", "medium", "low"];
const OWNER_TYPES = ["parent", "teacher", "counsellor", "admin", "centre_head"];
const REFERRAL_STATUSES = ["new", "contacted", "converted", "closed"];
const REWARD_STATUSES = ["not-applicable", "pending", "issued"];

const cleanValue = (value) => (value === "" || value === undefined ? null : value);

router.get("/summary", verifyToken, async (req, res) => {
  try {
    const [[events]] = await pool.execute(
      `SELECT
        COUNT(*) AS total_events,
        SUM(status = 'action-needed') AS action_needed,
        SUM(source = 'parent-portal') AS parent_updates,
        SUM(source IN ('teacher-dashboard', 'daycare-routine', 'classroom-activity')) AS school_updates
       FROM workflow_events`
    );
    const [[seats]] = await pool.execute(
      `SELECT
        COUNT(*) AS program_count,
        SUM(total_seats) AS total_seats,
        SUM(filled_seats) AS filled_seats
       FROM seat_availability`
    );
    const [[referrals]] = await pool.execute(
      `SELECT
        COUNT(*) AS referral_count,
        SUM(status IN ('new', 'contacted')) AS open_referrals
       FROM referrals`
    );

    return res.json({
      success: true,
      data: {
        total_events: Number(events.total_events || 0),
        action_needed: Number(events.action_needed || 0),
        parent_updates: Number(events.parent_updates || 0),
        school_updates: Number(events.school_updates || 0),
        program_count: Number(seats.program_count || 0),
        total_seats: Number(seats.total_seats || 0),
        filled_seats: Number(seats.filled_seats || 0),
        available_seats: Number(seats.total_seats || 0) - Number(seats.filled_seats || 0),
        referral_count: Number(referrals.referral_count || 0),
        open_referrals: Number(referrals.open_referrals || 0)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch operations summary" });
  }
});

router.get("/events", verifyToken, async (req, res) => {
  try {
    const { source, status, priority } = req.query;
    const where = [];
    const params = [];

    if (source) {
      where.push("we.source = ?");
      params.push(source);
    }

    if (status) {
      where.push("we.status = ?");
      params.push(status);
    }

    if (priority) {
      where.push("we.priority = ?");
      params.push(priority);
    }

    const [rows] = await pool.execute(
      `SELECT we.*, l.parent_name, l.parent_phone, c.name AS created_by_name
       FROM workflow_events we
       LEFT JOIN leads l ON l.id = we.lead_id
       LEFT JOIN counsellors c ON c.id = we.created_by
       ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
       ORDER BY we.updated_at DESC, we.created_at DESC
       LIMIT 100`,
      params
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch workflow events" });
  }
});

router.post(
  "/events",
  verifyToken,
  [
    body("source").isIn(SOURCES).withMessage("Invalid source"),
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("status").optional().isIn(EVENT_STATUSES),
    body("priority").optional().isIn(PRIORITIES),
    body("owner_type").optional().isIn(OWNER_TYPES)
  ],
  handleValidation,
  async (req, res) => {
    try {
      const payload = req.body;
      const [result] = await pool.execute(
        `INSERT INTO workflow_events
         (source, lead_id, parent_email, child_name, title, details, status, priority, owner_type, owner_id, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payload.source,
          cleanValue(payload.lead_id),
          cleanValue(payload.parent_email),
          cleanValue(payload.child_name),
          payload.title.trim(),
          cleanValue(payload.details),
          payload.status || "new",
          payload.priority || "medium",
          payload.owner_type || "admin",
          cleanValue(payload.owner_id),
          req.user.id
        ]
      );

      const [rows] = await pool.execute("SELECT * FROM workflow_events WHERE id = ?", [result.insertId]);
      return res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Failed to create workflow event" });
    }
  }
);

router.post(
  "/parent-update",
  [
    body("parent_email").isEmail().withMessage("Valid parent email is required"),
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("priority").optional().isIn(PRIORITIES)
  ],
  handleValidation,
  async (req, res) => {
    try {
      const [result] = await pool.execute(
        `INSERT INTO workflow_events
         (source, parent_email, child_name, title, details, status, priority, owner_type)
         VALUES ('parent-portal', ?, ?, ?, ?, 'new', ?, 'parent')`,
        [
          req.body.parent_email.trim().toLowerCase(),
          cleanValue(req.body.child_name),
          req.body.title.trim(),
          cleanValue(req.body.details),
          req.body.priority || "medium"
        ]
      );

      return res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Failed to save parent portal update" });
    }
  }
);

router.patch(
  "/events/:id/status",
  verifyToken,
  [body("status").isIn(EVENT_STATUSES).withMessage("Invalid event status")],
  handleValidation,
  async (req, res) => {
    try {
      const [result] = await pool.execute(
        "UPDATE workflow_events SET status = ? WHERE id = ?",
        [req.body.status, req.params.id]
      );

      if (!result.affectedRows) {
        return res.status(404).json({ success: false, error: "Workflow event not found" });
      }

      return res.json({ success: true, data: { id: Number(req.params.id), status: req.body.status } });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Failed to update workflow event" });
    }
  }
);

router.get("/seat-availability", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT sa.*, c.name AS updated_by_name, (sa.total_seats - sa.filled_seats) AS available_seats
       FROM seat_availability sa
       LEFT JOIN counsellors c ON c.id = sa.updated_by
       ORDER BY sa.program ASC`
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch seat availability" });
  }
});

router.post(
  "/seat-availability",
  verifyToken,
  [
    body("program").trim().notEmpty().withMessage("Program is required"),
    body("academic_year").trim().notEmpty().withMessage("Academic year is required"),
    body("total_seats").isInt({ min: 0 }).withMessage("Total seats must be a valid number"),
    body("filled_seats").isInt({ min: 0 }).withMessage("Filled seats must be a valid number")
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { program, academic_year, total_seats, filled_seats } = req.body;
      if (Number(filled_seats) > Number(total_seats)) {
        return res.status(400).json({ success: false, error: "Filled seats cannot be more than total seats" });
      }

      await pool.execute(
        `INSERT INTO seat_availability (program, academic_year, total_seats, filled_seats, updated_by)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           total_seats = VALUES(total_seats),
           filled_seats = VALUES(filled_seats),
           updated_by = VALUES(updated_by)`,
        [program.trim(), academic_year.trim(), total_seats, filled_seats, req.user.id]
      );

      return res.status(201).json({ success: true, data: { program, academic_year } });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Failed to save seat availability" });
    }
  }
);

router.get("/referrals", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT r.*, l.parent_name AS original_parent_name, c.name AS created_by_name
       FROM referrals r
       LEFT JOIN leads l ON l.id = r.lead_id
       LEFT JOIN counsellors c ON c.id = r.created_by
       ORDER BY r.updated_at DESC, r.created_at DESC`
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch referrals" });
  }
});

router.post(
  "/referrals",
  verifyToken,
  [
    body("referred_parent_name").trim().notEmpty().withMessage("Referred parent name is required"),
    body("status").optional().isIn(REFERRAL_STATUSES),
    body("reward_status").optional().isIn(REWARD_STATUSES)
  ],
  handleValidation,
  async (req, res) => {
    try {
      const payload = req.body;
      const [result] = await pool.execute(
        `INSERT INTO referrals
         (lead_id, referred_parent_name, referred_parent_phone, referred_child_name, referral_source, status, reward_status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cleanValue(payload.lead_id),
          payload.referred_parent_name.trim(),
          cleanValue(payload.referred_parent_phone),
          cleanValue(payload.referred_child_name),
          cleanValue(payload.referral_source),
          payload.status || "new",
          payload.reward_status || "not-applicable",
          req.user.id
        ]
      );

      const [rows] = await pool.execute("SELECT * FROM referrals WHERE id = ?", [result.insertId]);
      return res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Failed to create referral" });
    }
  }
);

router.get("/recommendations", verifyToken, async (req, res) => {
  try {
    const [leads] = await pool.execute(
      `SELECT id, parent_name, child_name, program_interest, status, priority, next_follow_up_date
       FROM leads
       ORDER BY updated_at DESC
       LIMIT 50`
    );
    const [seats] = await pool.execute(
      "SELECT program, academic_year, total_seats, filled_seats FROM seat_availability"
    );
    const [events] = await pool.execute(
      "SELECT source, title, status, priority, updated_at FROM workflow_events ORDER BY updated_at DESC LIMIT 50"
    );
    const [referrals] = await pool.execute(
      "SELECT status, reward_status FROM referrals ORDER BY updated_at DESC LIMIT 50"
    );

    const recommendations = generateOperationalRecommendations({ leads, seats, events, referrals });
    return res.json({ success: true, data: recommendations });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to generate recommendations" });
  }
});

module.exports = router;
