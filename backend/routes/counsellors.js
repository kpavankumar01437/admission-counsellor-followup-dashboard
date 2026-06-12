const express = require("express");
const bcrypt = require("bcryptjs");
const { body } = require("express-validator");
const pool = require("../db/connection");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { handleValidation } = require("../middleware/validate");

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, phone, role, is_active, created_at FROM counsellors WHERE is_active = TRUE ORDER BY name ASC"
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch counsellors" });
  }
});

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").optional().isIn(["counsellor", "admin", "centre_head"])
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { name, email, phone, password, role = "counsellor" } = req.body;
      const passwordHash = await bcrypt.hash(password, 10);

      const [result] = await pool.execute(
        "INSERT INTO counsellors (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)",
        [name, email, phone || null, passwordHash, role]
      );

      return res.status(201).json({ success: true, data: { id: result.insertId, name, email, phone, role } });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ success: false, error: "Email already exists" });
      }
      return res.status(500).json({ success: false, error: "Failed to create counsellor" });
    }
  }
);

router.patch("/:id", async (req, res) => {
  try {
    const allowed = ["name", "phone", "role", "is_active"];
    const updates = [];
    const params = [];

    for (const field of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        if (field === "role" && !["counsellor", "admin", "centre_head"].includes(req.body[field])) {
          return res.status(400).json({ success: false, error: "Invalid role" });
        }
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }

    if (!updates.length) {
      return res.status(400).json({ success: false, error: "No valid fields provided" });
    }

    params.push(req.params.id);
    const [result] = await pool.execute(`UPDATE counsellors SET ${updates.join(", ")} WHERE id = ?`, params);

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, error: "Counsellor not found" });
    }

    return res.json({ success: true, data: { id: Number(req.params.id) } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update counsellor" });
  }
});

module.exports = router;
