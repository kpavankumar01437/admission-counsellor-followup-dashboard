const pool = require("../db/connection");

const ACTIVE_STATUSES = ["new", "contacted", "demo-scheduled", "demo-visited", "follow-up"];

const notificationExistsToday = async (connection, leadId, counsellorId, type) => {
  const [rows] = await connection.execute(
    `SELECT id
     FROM notifications
     WHERE lead_id = ?
     AND counsellor_id = ?
     AND type = ?
     AND DATE(created_at) = CURDATE()
     LIMIT 1`,
    [leadId, counsellorId, type]
  );
  return rows.length > 0;
};

const insertNotificationIfMissing = async (connection, lead, type, message, priority) => {
  if (!lead.counsellor_id) return false;
  const exists = await notificationExistsToday(connection, lead.id, lead.counsellor_id, type);
  if (exists) return false;

  await connection.execute(
    "INSERT INTO notifications (counsellor_id, lead_id, type, message, priority) VALUES (?, ?, ?, ?, ?)",
    [lead.counsellor_id, lead.id, type, message, priority]
  );
  return true;
};

const runNotificationScan = async () => {
  const connection = await pool.getConnection();
  let created = 0;

  try {
    const activeList = ACTIVE_STATUSES.map(() => "?").join(", ");

    const [dueToday] = await connection.execute(
      `SELECT id, parent_name, counsellor_id
       FROM leads
       WHERE next_follow_up_date = CURDATE()
       AND status IN (${activeList})`,
      ACTIVE_STATUSES
    );

    for (const lead of dueToday) {
      const inserted = await insertNotificationIfMissing(
        connection,
        lead,
        "follow-up-due",
        `Follow-up due today for ${lead.parent_name}.`,
        "urgent"
      );
      if (inserted) created += 1;
    }

    const [overdue] = await connection.execute(
      `SELECT id, parent_name, counsellor_id, next_follow_up_date
       FROM leads
       WHERE next_follow_up_date < CURDATE()
       AND status IN (${activeList})`,
      ACTIVE_STATUSES
    );

    for (const lead of overdue) {
      const inserted = await insertNotificationIfMissing(
        connection,
        lead,
        "overdue-lead",
        `Follow-up is overdue for ${lead.parent_name}.`,
        "urgent"
      );
      if (inserted) created += 1;
    }

    return { created, due_today: dueToday.length, overdue: overdue.length };
  } finally {
    connection.release();
  }
};

const startNotificationService = () => {
  const enabled = process.env.ENABLE_NOTIFICATION_INTERVAL !== "false";
  if (!enabled) return null;

  runNotificationScan().catch((error) => {
    console.error("Initial notification scan failed:", error.message);
  });

  return setInterval(() => {
    runNotificationScan().catch((error) => {
      console.error("Notification scan failed:", error.message);
    });
  }, 60 * 60 * 1000);
};

module.exports = { runNotificationScan, startNotificationService };
