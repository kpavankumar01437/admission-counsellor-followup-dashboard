const express = require("express");
const pool = require("../db/connection");
const { verifyToken } = require("../middleware/auth");
const {
  generateCallScript,
  generateFollowUpMessage,
  calculatePriority,
  calculatePriorityDetails,
  generateAdmissionSummary
} = require("../services/aiEngine");

const router = express.Router();

const getLead = async (leadId) => {
  const [rows] = await pool.execute(
    `SELECT l.*, c.name AS counsellor_name
     FROM leads l
     LEFT JOIN counsellors c ON c.id = l.counsellor_id
     WHERE l.id = ?`,
    [leadId]
  );
  return rows[0] || null;
};

router.post("/call-script/:leadId", verifyToken, async (req, res) => {
  try {
    const lead = await getLead(req.params.leadId);
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    return res.json({ success: true, data: { script: generateCallScript(lead) } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to generate call script" });
  }
});

router.get("/followup-message/:leadId", verifyToken, async (req, res) => {
  try {
    const lead = await getLead(req.params.leadId);
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    return res.json({ success: true, data: { message: generateFollowUpMessage(lead, lead.counsellor_name) } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to generate follow-up message" });
  }
});

const recalculatePriorities = async () => {
  const [leads] = await pool.execute(
    `SELECT l.*, COUNT(f.id) AS follow_up_count
     FROM leads l
     LEFT JOIN follow_ups f ON f.lead_id = l.id
     WHERE l.status NOT IN ('admitted', 'not-interested', 'lost')
     GROUP BY l.id`
  );

  let updated = 0;
  const reasons = [];

  for (const lead of leads) {
    const details = calculatePriorityDetails(lead, Number(lead.follow_up_count || 0));
    if (details.priority !== lead.priority) {
      await pool.execute("UPDATE leads SET priority = ? WHERE id = ?", [details.priority, lead.id]);
      updated += 1;
    }
    reasons.push({ lead_id: lead.id, priority: details.priority, reason: details.reason });
  }

  return { updated, checked: leads.length, reasons };
};

router.post("/recalculate-priority", verifyToken, async (req, res) => {
  try {
    return res.json({ success: true, data: await recalculatePriorities() });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to recalculate priorities" });
  }
});

router.post("/priority-flags", verifyToken, async (req, res) => {
  try {
    return res.json({ success: true, data: await recalculatePriorities() });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to recalculate priorities" });
  }
});

router.get("/priority/:leadId", verifyToken, async (req, res) => {
  try {
    const lead = await getLead(req.params.leadId);
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }
    const [[countRow]] = await pool.execute("SELECT COUNT(*) AS count FROM follow_ups WHERE lead_id = ?", [lead.id]);
    return res.json({
      success: true,
      data: {
        priority: calculatePriority(lead, Number(countRow.count || 0)),
        ...calculatePriorityDetails(lead, Number(countRow.count || 0))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to calculate priority" });
  }
});

router.get("/admission-summary/:leadId", verifyToken, async (req, res) => {
  try {
    const lead = await getLead(req.params.leadId);
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    const [followUps] = await pool.execute("SELECT * FROM follow_ups WHERE lead_id = ? ORDER BY created_at ASC", [lead.id]);
    const [admissions] = await pool.execute("SELECT * FROM admissions WHERE lead_id = ? LIMIT 1", [lead.id]);

    return res.json({
      success: true,
      data: { summary: generateAdmissionSummary(lead, followUps, admissions[0] || null) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to generate admission summary" });
  }
});

module.exports = router;
