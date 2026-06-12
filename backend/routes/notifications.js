const express = require("express");
const pool = require("../db/connection");
const { verifyToken } = require("../middleware/auth");
const { runNotificationScan } = require("../services/notificationService");

const router = express.Router();

router.use(verifyToken);

router.get("/", async (req, res) => {
  try {
    const params = [];
    const where = [];

    if (!["admin", "centre_head"].includes(req.user.role)) {
      where.push("n.counsellor_id = ?");
      params.push(req.user.id);
    }

    if (req.query.unread === "true") {
      where.push("n.is_read = FALSE");
    }

    const [rows] = await pool.execute(
      `SELECT n.*, l.parent_name, l.parent_phone
       FROM notifications n
       LEFT JOIN leads l ON l.id = n.lead_id
       ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
       ORDER BY n.created_at DESC
       LIMIT 50`,
      params
    );

    return res.json({
      success: true,
      data: {
        notifications: rows,
        unread_count: rows.filter((notification) => !notification.is_read).length
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch notifications" });
  }
});

router.post("/scan", async (req, res) => {
  try {
    const data = await runNotificationScan();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to scan notifications" });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const params = [req.params.id];
    const scope = [];

    if (!["admin", "centre_head"].includes(req.user.role)) {
      scope.push("counsellor_id = ?");
      params.push(req.user.id);
    }

    const [result] = await pool.execute(
      `UPDATE notifications SET is_read = TRUE WHERE id = ? ${scope.length ? `AND ${scope.join(" AND ")}` : ""}`,
      params
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, error: "Notification not found" });
    }

    return res.json({ success: true, data: { id: Number(req.params.id), is_read: true } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update notification" });
  }
});

router.patch("/read-all", async (req, res) => {
  try {
    const params = [];
    const where = [];

    if (!["admin", "centre_head"].includes(req.user.role)) {
      where.push("counsellor_id = ?");
      params.push(req.user.id);
    }

    const [result] = await pool.execute(
      `UPDATE notifications SET is_read = TRUE ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`,
      params
    );

    return res.json({ success: true, data: { updated: result.affectedRows } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to mark notifications read" });
  }
});

module.exports = router;
