const express = require("express");
const pool = require("../db/connection");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

const STATUSES = ["new", "contacted", "demo-scheduled", "demo-visited", "follow-up", "admitted", "not-interested", "lost"];

router.get("/summary", verifyToken, async (req, res) => {
  try {
    const [[totals]] = await pool.execute(
      `SELECT
        COUNT(*) AS total_leads,
        SUM(status = 'admitted') AS admitted_count,
        SUM(MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())) AS new_this_month,
        SUM(next_follow_up_date = CURDATE() AND status NOT IN ('admitted', 'not-interested', 'lost')) AS pending_followups_today,
        SUM(next_follow_up_date < CURDATE() AND status NOT IN ('admitted', 'not-interested', 'lost')) AS overdue_count,
        SUM(status = 'demo-scheduled') AS demo_scheduled_count
       FROM leads`
    );

    const total = Number(totals.total_leads || 0);
    const admitted = Number(totals.admitted_count || 0);

    return res.json({
      success: true,
      data: {
        total_leads: total,
        new_this_month: Number(totals.new_this_month || 0),
        conversion_rate: total ? Number(((admitted / total) * 100).toFixed(1)) : 0,
        pending_followups_today: Number(totals.pending_followups_today || 0),
        overdue_count: Number(totals.overdue_count || 0),
        demo_scheduled_count: Number(totals.demo_scheduled_count || 0)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch analytics summary" });
  }
});

router.get("/funnel", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT status, COUNT(*) AS count FROM leads GROUP BY status");
    const counts = Object.fromEntries(rows.map((row) => [row.status, Number(row.count)]));
    const data = STATUSES.map((status) => ({
      status,
      label: status.replace(/-/g, " "),
      count: counts[status] || 0
    }));

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch funnel analytics" });
  }
});

router.get("/counsellor", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        c.id,
        c.name,
        c.email,
        (SELECT COUNT(*) FROM leads l WHERE l.counsellor_id = c.id) AS total_leads,
        (SELECT COUNT(*) FROM follow_ups f WHERE f.counsellor_id = c.id) AS calls_made,
        (SELECT COUNT(*) FROM leads l WHERE l.counsellor_id = c.id AND l.status IN ('demo-visited', 'admitted')) AS demos_done,
        (SELECT COUNT(*) FROM leads l WHERE l.counsellor_id = c.id AND l.status = 'admitted') AS admitted_count
       FROM counsellors c
       WHERE c.is_active = TRUE
       ORDER BY c.role = 'counsellor' DESC, c.name ASC`
    );

    const data = rows.map((row) => {
      const total = Number(row.total_leads || 0);
      const admitted = Number(row.admitted_count || 0);
      return {
        ...row,
        total_leads: total,
        calls_made: Number(row.calls_made || 0),
        demos_done: Number(row.demos_done || 0),
        admitted_count: admitted,
        conversion_rate: total ? Number(((admitted / total) * 100).toFixed(1)) : 0
      };
    });

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch counsellor analytics" });
  }
});

router.get("/monthly", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
       FROM leads
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`
    );

    const counts = Object.fromEntries(rows.map((row) => [row.month, Number(row.count)]));
    const data = [];
    const now = new Date();

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      data.push({
        month: key,
        label: date.toLocaleString("en-IN", { month: "short" }),
        count: counts[key] || 0
      });
    }

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch monthly trend" });
  }
});

module.exports = router;
