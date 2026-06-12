const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const pool = require("../db/connection");
const { verifyToken } = require("../middleware/auth");
const { handleValidation } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const [rows] = await pool.execute(
        "SELECT id, name, email, phone, password_hash, role, is_active FROM counsellors WHERE email = ? LIMIT 1",
        [email]
      );

      if (!rows.length || !rows[0].is_active) {
        return res.status(401).json({ success: false, error: "Invalid email or password" });
      }

      const counsellor = rows[0];
      const isMatch = await bcrypt.compare(password, counsellor.password_hash);

      if (!isMatch) {
        return res.status(401).json({ success: false, error: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: counsellor.id, role: counsellor.role },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      delete counsellor.password_hash;

      return res.json({ success: true, data: { token, user: counsellor } });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Login failed" });
    }
  }
);

router.get("/me", verifyToken, (req, res) => {
  return res.json({ success: true, data: req.user });
});

module.exports = router;
