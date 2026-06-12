const express = require("express");
const { body } = require("express-validator");
const pool = require("../db/connection");
const { handleValidation } = require("../middleware/validate");

const router = express.Router();

const cleanValue = (value) => (value === "" ? null : value);

const getLeastLoadedCounsellor = async () => {
  const [rows] = await pool.execute(
    `SELECT c.id, COUNT(l.id) AS lead_count
     FROM counsellors c
     LEFT JOIN leads l ON l.counsellor_id = c.id AND l.status NOT IN ('admitted', 'not-interested', 'lost')
     WHERE c.is_active = TRUE AND c.role = 'counsellor'
     GROUP BY c.id
     ORDER BY lead_count ASC, c.id ASC
     LIMIT 1`
  );

  return rows[0]?.id || null;
};

router.post(
  "/",
  [
    body("parent_name").trim().notEmpty().withMessage("Parent name is required"),
    body("parent_phone").trim().notEmpty().withMessage("Phone number is required")
  ],
  handleValidation,
  async (req, res) => {
    try {
      const counsellorId = await getLeastLoadedCounsellor();
      const payload = req.body;
      const [duplicate] = await pool.execute("SELECT id FROM leads WHERE parent_phone = ? LIMIT 1", [payload.parent_phone]);

      if (duplicate.length) {
        return res.status(409).json({
          success: false,
          error: "An enquiry with this phone number already exists"
        });
      }

      const [result] = await pool.execute(
        `INSERT INTO leads
         (parent_name, parent_phone, parent_email, child_name, child_age, program_interest, source, status, priority, counsellor_id, notes, referral_by, address)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'new', 'medium', ?, ?, ?, ?)`,
        [
          payload.parent_name,
          payload.parent_phone,
          cleanValue(payload.parent_email || null),
          cleanValue(payload.child_name || null),
          cleanValue(payload.child_age || null),
          cleanValue(payload.program_interest || null),
          payload.source || "website",
          counsellorId,
          cleanValue(payload.notes || null),
          cleanValue(payload.referral_by || null),
          cleanValue(payload.address || null)
        ]
      );

      return res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          message: "Thank you. Our admission team will contact you within 24 hours."
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Failed to submit enquiry" });
    }
  }
);

module.exports = router;
