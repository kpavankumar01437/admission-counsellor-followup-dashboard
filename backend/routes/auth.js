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
 
// ── Parent Sign Up ──────────────────────────────────────────────
// Creates a new parent account. Fails if email already exists.
router.post(
  "/parent-signup",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("name").notEmpty().withMessage("Name is required").trim().isLength({ max: 100 }).withMessage("Name is too long"),
    body("phone").optional({ checkFalsy: true }).trim().isLength({ max: 15 }).withMessage("Phone number is too long")
  ],
  handleValidation,
  async (req, res) => {
    try {
      const email = req.body.email.trim().toLowerCase();
      const name = req.body.name.trim();
      const phone = req.body.phone?.trim() || null;
 
      // Check if account already exists
      const [existing] = await pool.execute(
        "SELECT id FROM parents WHERE email = ? LIMIT 1",
        [email]
      );
      if (existing.length) {
        return res.status(409).json({
          success: false,
          error: "An account with this email already exists. Please log in instead."
        });
      }
 
      // Create the new parent account
      await pool.execute(
        "INSERT INTO parents (name, email, phone, last_login_at) VALUES (?, ?, ?, NOW())",
        [name, email, phone]
      );
 
      const [rows] = await pool.execute(
        "SELECT id, name, email, phone, last_login_at, created_at FROM parents WHERE email = ? LIMIT 1",
        [email]
      );
 
      const parent = rows[0];
      const token = jwt.sign(
        { id: parent.id, email: parent.email, role: "parent" },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
 
      return res.status(201).json({ success: true, data: { token, parent } });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Sign up failed. Please try again." });
    }
  }
);
 
// ── Parent Login ────────────────────────────────────────────────
// Logs in an existing parent by email. Fails if account not found.
router.post(
  "/parent-login",
  [
    body("email").isEmail().withMessage("Valid email is required")
  ],
  handleValidation,
  async (req, res) => {
    try {
      const email = req.body.email.trim().toLowerCase();
 
      // Only allow login if account already exists
      const [rows] = await pool.execute(
        "SELECT id, name, email, phone, last_login_at, created_at FROM parents WHERE email = ? LIMIT 1",
        [email]
      );
 
      if (!rows.length) {
        return res.status(404).json({
          success: false,
          error: "No account found with this email. Please sign up first."
        });
      }
 
      // Update last login timestamp
      await pool.execute(
        "UPDATE parents SET last_login_at = NOW() WHERE email = ?",
        [email]
      );
 
      const parent = rows[0];
      const token = jwt.sign(
        { id: parent.id, email: parent.email, role: "parent" },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
 
      return res.json({ success: true, data: { token, parent } });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Login failed. Please try again." });
    }
  }
);
 
router.get("/me", verifyToken, (req, res) => {
  return res.json({ success: true, data: req.user });
});
 
module.exports = router;
