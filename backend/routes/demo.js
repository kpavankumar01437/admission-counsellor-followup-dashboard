const express = require("express");
const jwt = require("jsonwebtoken");
const {
  generateCallScript,
  generateFollowUpMessage,
  calculatePriorityDetails,
  generateAdmissionSummary
} = require("../services/aiEngine");

const router = express.Router();

const today = new Date();
const isoDate = (offset = 0) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};
const isoDateTime = (offset = 0) => `${isoDate(offset)}T09:30:00.000Z`;

let counters = {
  lead: 6,
  followUp: 6,
  slot: 5,
  booking: 2,
  notification: 3,
  counsellor: 4
};

const counsellors = [
  { id: 1, name: "Centre Admin", email: "admin@firstcryintellitots.com", phone: "9000000000", role: "admin", is_active: true, created_at: isoDateTime(-20) },
  { id: 2, name: "Priya Sharma", email: "priya@firstcry.com", phone: "9111111111", role: "counsellor", is_active: true, created_at: isoDateTime(-20) },
  { id: 3, name: "Arjun Mehta", email: "arjun@firstcry.com", phone: "9222222222", role: "counsellor", is_active: true, created_at: isoDateTime(-20) }
];

const leads = [
  { id: 1, parent_name: "Ananya Rao", parent_phone: "9876500001", parent_email: "ananya.rao@example.com", child_name: "Ishaan", child_age: 3, program_interest: "Nursery", source: "website", status: "new", priority: "high", counsellor_id: 2, notes: "Requested fee details through website form.", next_follow_up_date: isoDate(0), referral_by: null, address: "Madhapur, Hyderabad", created_at: isoDateTime(-8), updated_at: isoDateTime(-1) },
  { id: 2, parent_name: "Rahul Nair", parent_phone: "9876500002", parent_email: "rahul.nair@example.com", child_name: "Mira", child_age: 4, program_interest: "LKG", source: "phone", status: "contacted", priority: "medium", counsellor_id: 2, notes: "Interested but asked for transport details.", next_follow_up_date: isoDate(1), referral_by: null, address: "Kondapur, Hyderabad", created_at: isoDateTime(-5), updated_at: isoDateTime(-2) },
  { id: 3, parent_name: "Sneha Kapoor", parent_phone: "9876500003", parent_email: "sneha.kapoor@example.com", child_name: "Kabir", child_age: 2, program_interest: "Playgroup", source: "whatsapp", status: "demo-scheduled", priority: "medium", counsellor_id: 3, notes: "Demo booked for this week.", next_follow_up_date: isoDate(2), referral_by: null, address: "Gachibowli, Hyderabad", created_at: isoDateTime(-3), updated_at: isoDateTime(-1) },
  { id: 4, parent_name: "Vikram Reddy", parent_phone: "9876500004", parent_email: "vikram.reddy@example.com", child_name: "Aarohi", child_age: 5, program_interest: "UKG", source: "referral", status: "demo-visited", priority: "high", counsellor_id: 3, notes: "Visited centre, comparing with another preschool.", next_follow_up_date: isoDate(-1), referral_by: "Existing parent", address: "Nanakramguda, Hyderabad", created_at: isoDateTime(-10), updated_at: isoDateTime(-4) },
  { id: 5, parent_name: "Pooja Menon", parent_phone: "9876500005", parent_email: "pooja.menon@example.com", child_name: "Vihaan", child_age: 3, program_interest: "Nursery", source: "social-media", status: "admitted", priority: "low", counsellor_id: 2, notes: "Converted after demo visit.", next_follow_up_date: null, referral_by: null, address: "HITEC City, Hyderabad", created_at: isoDateTime(-14), updated_at: isoDateTime(-2) }
];

const followUps = [
  { id: 1, lead_id: 1, counsellor_id: 2, call_date: isoDateTime(-7), duration_mins: 4, outcome: "no-answer", status_changed_to: "new", notes: "Initial call not answered.", next_action: "Call again today", next_follow_up_date: isoDate(0), created_at: isoDateTime(-7) },
  { id: 2, lead_id: 2, counsellor_id: 2, call_date: isoDateTime(-4), duration_mins: 9, outcome: "answered", status_changed_to: "contacted", notes: "Discussed program and transport route.", next_action: "Share transport estimate", next_follow_up_date: isoDate(1), created_at: isoDateTime(-4) },
  { id: 3, lead_id: 3, counsellor_id: 3, call_date: isoDateTime(-2), duration_mins: 8, outcome: "interested", status_changed_to: "demo-scheduled", notes: "Parent agreed to centre tour.", next_action: "Confirm demo timing", next_follow_up_date: isoDate(2), created_at: isoDateTime(-2) },
  { id: 4, lead_id: 4, counsellor_id: 3, call_date: isoDateTime(-4), duration_mins: 12, outcome: "answered", status_changed_to: "demo-visited", notes: "Parent liked curriculum, fee concern pending.", next_action: "Close admission", next_follow_up_date: isoDate(-1), created_at: isoDateTime(-4) },
  { id: 5, lead_id: 5, counsellor_id: 2, call_date: isoDateTime(-8), duration_mins: 10, outcome: "admitted", status_changed_to: "admitted", notes: "Admission confirmed.", next_action: "Collect remaining documents", next_follow_up_date: null, created_at: isoDateTime(-8) }
];

const tourSlots = [
  { id: 1, slot_date: isoDate(0), slot_time: "10:00:00", capacity: 5, booked_count: 0, notes: "Morning school tour", created_at: isoDateTime(-2) },
  { id: 2, slot_date: isoDate(1), slot_time: "11:30:00", capacity: 5, booked_count: 0, notes: "Classroom walkthrough", created_at: isoDateTime(-2) },
  { id: 3, slot_date: isoDate(2), slot_time: "15:00:00", capacity: 4, booked_count: 1, notes: "Afternoon parent visit", created_at: isoDateTime(-2) },
  { id: 4, slot_date: isoDate(4), slot_time: "10:30:00", capacity: 6, booked_count: 0, notes: "Centre head available", created_at: isoDateTime(-2) }
];

const tourBookings = [
  { id: 1, lead_id: 3, slot_id: 3, status: "confirmed", booked_by: 3, created_at: isoDateTime(-2) }
];

const admissions = [
  { id: 1, lead_id: 5, counsellor_id: 2, program: "Nursery", start_date: isoDate(10), fee_amount: 55000, fee_paid: 15000, admission_date: isoDate(-2), remarks: "Admission confirmed after demo visit.", created_at: isoDateTime(-2) }
];

const notifications = [
  { id: 1, counsellor_id: 2, lead_id: 1, type: "follow-up-due", message: "Follow-up due today for Ananya Rao.", is_read: false, priority: "urgent", created_at: isoDateTime(0) },
  { id: 2, counsellor_id: 3, lead_id: 4, type: "overdue-lead", message: "Follow-up is overdue for Vikram Reddy.", is_read: false, priority: "urgent", created_at: isoDateTime(0) }
];

const isAdmin = (user) => ["admin", "centre_head"].includes(user?.role);
const publicUser = (user) => {
  if (!user) return null;
  const { id, name, email, phone, role, is_active, created_at } = user;
  return { id, name, email, phone, role, is_active, created_at };
};
const send = (res, data, status = 200) => res.status(status).json({ success: true, data });
const error = (res, message, status = 400) => res.status(status).json({ success: false, error: message });
const now = () => new Date().toISOString();
const leadWithCounsellor = (lead) => ({
  ...lead,
  counsellor_name: counsellors.find((counsellor) => counsellor.id === lead.counsellor_id)?.name || null
});
const scopedLeads = (user) => (isAdmin(user) ? leads : leads.filter((lead) => lead.counsellor_id === user.id));

const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return error(res, "Missing authorization token", 401);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = counsellors.find((item) => item.id === payload.id && item.is_active);
    if (!user) return error(res, "User account is inactive or missing", 401);
    req.user = publicUser(user);
    next();
  } catch {
    return error(res, "Invalid authorization token", 401);
  }
};

const requireAdmin = (req, res, next) => {
  if (!isAdmin(req.user)) return error(res, "Admin access required", 403);
  next();
};

router.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = counsellors.find((item) => item.email === email && item.is_active);
  const validPassword = user?.role === "admin" ? password === "Admin@123" : password === "Counsellor@123";
  if (!user || !validPassword) return error(res, "Invalid email or password", 401);
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" });
  return send(res, { token, user: publicUser(user) });
});

router.post("/enquiry", (req, res) => {
  if (!req.body.parent_name || !req.body.parent_phone) return error(res, "Parent name and phone are required", 400);
  if (leads.some((lead) => lead.parent_phone === req.body.parent_phone)) return error(res, "An enquiry with this phone number already exists", 409);
  const counsellorLoads = counsellors
    .filter((user) => user.role === "counsellor" && user.is_active)
    .map((user) => ({ id: user.id, count: leads.filter((lead) => lead.counsellor_id === user.id && !["admitted", "not-interested", "lost"].includes(lead.status)).length }))
    .sort((a, b) => a.count - b.count);
  const lead = {
    id: counters.lead++,
    parent_name: req.body.parent_name,
    parent_phone: req.body.parent_phone,
    parent_email: req.body.parent_email || null,
    child_name: req.body.child_name || null,
    child_age: req.body.child_age || null,
    program_interest: req.body.program_interest || null,
    source: req.body.source || "website",
    status: "new",
    priority: "medium",
    counsellor_id: counsellorLoads[0]?.id || null,
    notes: req.body.notes || null,
    next_follow_up_date: null,
    referral_by: req.body.referral_by || null,
    address: req.body.address || null,
    created_at: now(),
    updated_at: now()
  };
  leads.push(lead);
  return send(res, { id: lead.id, message: "Thank you. Our admission team will contact you within 24 hours." }, 201);
});

router.use(requireAuth);

router.get("/auth/me", (req, res) => send(res, req.user));

router.get("/leads", (req, res) => {
  const { status, counsellor_id, priority, date_from, date_to, search } = req.query;
  let data = scopedLeads(req.user);
  if (status) data = data.filter((lead) => lead.status === status);
  if (counsellor_id) data = data.filter((lead) => String(lead.counsellor_id) === String(counsellor_id));
  if (priority) data = data.filter((lead) => lead.priority === priority);
  if (date_from) data = data.filter((lead) => lead.created_at.slice(0, 10) >= date_from);
  if (date_to) data = data.filter((lead) => lead.created_at.slice(0, 10) <= date_to);
  if (search) {
    const needle = search.toLowerCase();
    data = data.filter((lead) => [lead.parent_name, lead.parent_phone, lead.child_name].some((value) => String(value || "").toLowerCase().includes(needle)));
  }
  return send(res, data.map(leadWithCounsellor).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
});

router.post("/leads", (req, res) => {
  if (!req.body.parent_name || !req.body.parent_phone) return error(res, "Parent name and phone are required", 400);
  const lead = {
    id: counters.lead++,
    parent_name: req.body.parent_name,
    parent_phone: req.body.parent_phone,
    parent_email: req.body.parent_email || null,
    child_name: req.body.child_name || null,
    child_age: req.body.child_age || null,
    program_interest: req.body.program_interest || null,
    source: req.body.source || "phone",
    status: req.body.status || "new",
    priority: req.body.priority || "medium",
    counsellor_id: Number(req.body.counsellor_id || req.user.id),
    notes: req.body.notes || null,
    next_follow_up_date: req.body.next_follow_up_date || null,
    referral_by: req.body.referral_by || null,
    address: req.body.address || null,
    created_at: now(),
    updated_at: now()
  };
  leads.push(lead);
  return send(res, leadWithCounsellor(lead), 201);
});

router.post("/leads/import", (req, res) => {
  const rows = Array.isArray(req.body) ? req.body : req.body.leads;
  if (!Array.isArray(rows)) return error(res, "Request body must be an array of leads", 400);
  let imported = 0;
  let skipped = 0;
  const errors = [];
  for (const [index, row] of rows.entries()) {
    if (!row.parent_name || !row.parent_phone) {
      skipped += 1;
      errors.push({ row: index + 1, error: "parent_name and parent_phone are required" });
      continue;
    }
    if (leads.some((lead) => lead.parent_phone === row.parent_phone)) {
      skipped += 1;
      errors.push({ row: index + 1, error: "Duplicate phone number" });
      continue;
    }
    leads.push({ ...row, id: counters.lead++, status: row.status || "new", priority: row.priority || "medium", counsellor_id: Number(row.counsellor_id || req.user.id), created_at: now(), updated_at: now() });
    imported += 1;
  }
  return send(res, { imported, skipped, errors }, 201);
});

router.get("/leads/:id", (req, res) => {
  const lead = leads.find((item) => item.id === Number(req.params.id));
  if (!lead) return error(res, "Lead not found", 404);
  return send(res, {
    ...leadWithCounsellor(lead),
    follow_ups: followUps
      .filter((item) => item.lead_id === lead.id)
      .map((item) => ({ ...item, counsellor_name: counsellors.find((counsellor) => counsellor.id === item.counsellor_id)?.name }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    tour_bookings: tourBookings
      .filter((booking) => booking.lead_id === lead.id)
      .map((booking) => ({ ...booking, ...tourSlots.find((slot) => slot.id === booking.slot_id), booked_by_name: counsellors.find((counsellor) => counsellor.id === booking.booked_by)?.name })),
    admission: admissions.find((item) => item.lead_id === lead.id) || null
  });
});

router.patch("/leads/:id/status", (req, res) => {
  const lead = leads.find((item) => item.id === Number(req.params.id));
  if (!lead) return error(res, "Lead not found", 404);
  lead.status = req.body.status;
  lead.next_follow_up_date = req.body.next_follow_up_date || lead.next_follow_up_date;
  lead.updated_at = now();
  followUps.push({ id: counters.followUp++, lead_id: lead.id, counsellor_id: req.user.id, call_date: now(), duration_mins: null, outcome: req.body.status === "admitted" ? "admitted" : "answered", status_changed_to: req.body.status, notes: req.body.note || `Status updated to ${req.body.status}`, next_action: req.body.next_action || null, next_follow_up_date: req.body.next_follow_up_date || null, created_at: now() });
  return send(res, { id: lead.id, status: lead.status });
});

router.patch("/leads/:id/assign", requireAdmin, (req, res) => {
  const lead = leads.find((item) => item.id === Number(req.params.id));
  if (!lead) return error(res, "Lead not found", 404);
  lead.counsellor_id = Number(req.body.counsellor_id);
  lead.updated_at = now();
  return send(res, { id: lead.id, counsellor_id: lead.counsellor_id });
});

router.patch("/leads/:id", (req, res) => {
  const lead = leads.find((item) => item.id === Number(req.params.id));
  if (!lead) return error(res, "Lead not found", 404);
  Object.assign(lead, req.body, { updated_at: now() });
  return send(res, { id: lead.id });
});

router.post("/leads/:id/followup", (req, res) => {
  const lead = leads.find((item) => item.id === Number(req.params.id));
  if (!lead) return error(res, "Lead not found", 404);
  const followUp = { id: counters.followUp++, lead_id: lead.id, counsellor_id: req.user.id, call_date: now(), duration_mins: req.body.duration_mins || null, outcome: req.body.outcome, status_changed_to: req.body.status_changed_to || null, notes: req.body.notes || null, next_action: req.body.next_action || null, next_follow_up_date: req.body.next_follow_up_date || null, created_at: now() };
  followUps.push(followUp);
  if (req.body.status_changed_to) lead.status = req.body.status_changed_to;
  lead.next_follow_up_date = req.body.next_follow_up_date || null;
  lead.updated_at = now();
  return send(res, { id: followUp.id }, 201);
});

router.get("/leads/:id/followups", (req, res) => send(res, followUps.filter((item) => item.lead_id === Number(req.params.id))));

router.get("/followups/today", (req, res) => send(res, scopedLeads(req.user).filter((lead) => lead.next_follow_up_date === isoDate(0) && !["admitted", "not-interested", "lost"].includes(lead.status)).map(leadWithCounsellor)));
router.get("/followups/overdue", (req, res) => send(res, scopedLeads(req.user).filter((lead) => lead.next_follow_up_date && lead.next_follow_up_date < isoDate(0) && !["admitted", "not-interested", "lost"].includes(lead.status)).map(leadWithCounsellor)));

router.get("/tours/slots", (req, res) => {
  const includeFull = req.query.include_full === "true";
  const data = tourSlots
    .filter((slot) => includeFull || slot.booked_count < slot.capacity)
    .map((slot) => ({
      ...slot,
      available_count: slot.capacity - slot.booked_count,
      bookings: tourBookings
        .filter((booking) => booking.slot_id === slot.id)
        .map((booking) => ({ ...booking, ...leadWithCounsellor(leads.find((lead) => lead.id === booking.lead_id) || {}) }))
    }));
  return send(res, data);
});

router.post("/tours/slots", requireAdmin, (req, res) => {
  const slot = { id: counters.slot++, slot_date: req.body.slot_date, slot_time: req.body.slot_time, capacity: Number(req.body.capacity || 5), booked_count: 0, notes: req.body.notes || null, created_at: now() };
  tourSlots.push(slot);
  return send(res, { id: slot.id }, 201);
});

router.post("/tours/book", (req, res) => {
  const lead = leads.find((item) => item.id === Number(req.body.lead_id));
  const slot = tourSlots.find((item) => item.id === Number(req.body.slot_id));
  if (!lead) return error(res, "Lead not found", 404);
  if (!slot) return error(res, "Tour slot not found", 404);
  if (slot.booked_count >= slot.capacity) return error(res, "Tour slot is full", 400);
  const booking = { id: counters.booking++, lead_id: lead.id, slot_id: slot.id, status: "confirmed", booked_by: req.user.id, created_at: now() };
  tourBookings.push(booking);
  slot.booked_count += 1;
  lead.status = "demo-scheduled";
  lead.updated_at = now();
  return send(res, { id: booking.id }, 201);
});

router.patch("/tours/book/:id", (req, res) => {
  const booking = tourBookings.find((item) => item.id === Number(req.params.id));
  if (!booking) return error(res, "Tour booking not found", 404);
  booking.status = req.body.status;
  const lead = leads.find((item) => item.id === booking.lead_id);
  if (lead && req.body.status === "visited") lead.status = "demo-visited";
  return send(res, { id: booking.id, status: booking.status });
});

router.get("/analytics/summary", (req, res) => {
  const total = leads.length;
  const admitted = leads.filter((lead) => lead.status === "admitted").length;
  return send(res, { total_leads: total, new_this_month: total, conversion_rate: total ? Number(((admitted / total) * 100).toFixed(1)) : 0, pending_followups_today: leads.filter((lead) => lead.next_follow_up_date === isoDate(0)).length, overdue_count: leads.filter((lead) => lead.next_follow_up_date && lead.next_follow_up_date < isoDate(0) && !["admitted", "not-interested", "lost"].includes(lead.status)).length, demo_scheduled_count: leads.filter((lead) => lead.status === "demo-scheduled").length });
});

router.get("/analytics/funnel", (req, res) => {
  const statuses = ["new", "contacted", "demo-scheduled", "demo-visited", "follow-up", "admitted", "not-interested", "lost"];
  return send(res, statuses.map((status) => ({ status, label: status.replace(/-/g, " "), count: leads.filter((lead) => lead.status === status).length })));
});

router.get("/analytics/counsellor", (req, res) => send(res, counsellors.map((user) => {
  const owned = leads.filter((lead) => lead.counsellor_id === user.id);
  const admitted = owned.filter((lead) => lead.status === "admitted").length;
  return { id: user.id, name: user.name, email: user.email, total_leads: owned.length, calls_made: followUps.filter((item) => item.counsellor_id === user.id).length, demos_done: owned.filter((lead) => ["demo-visited", "admitted"].includes(lead.status)).length, admitted_count: admitted, conversion_rate: owned.length ? Number(((admitted / owned.length) * 100).toFixed(1)) : 0 };
})));

router.get("/analytics/monthly", (req, res) => send(res, ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((label, index) => ({ month: `2026-${String(index + 1).padStart(2, "0")}`, label, count: index === 5 ? leads.length : Math.max(0, index - 1) }))));

router.post("/ai/call-script/:leadId", (req, res) => {
  const lead = leadWithCounsellor(leads.find((item) => item.id === Number(req.params.leadId)) || {});
  if (!lead.id) return error(res, "Lead not found", 404);
  return send(res, { script: generateCallScript(lead) });
});

router.get("/ai/followup-message/:leadId", (req, res) => {
  const lead = leadWithCounsellor(leads.find((item) => item.id === Number(req.params.leadId)) || {});
  if (!lead.id) return error(res, "Lead not found", 404);
  return send(res, { message: generateFollowUpMessage(lead, lead.counsellor_name) });
});

router.post("/ai/recalculate-priority", (req, res) => {
  let updated = 0;
  for (const lead of leads) {
    if (["admitted", "not-interested", "lost"].includes(lead.status)) continue;
    const detail = calculatePriorityDetails(lead, followUps.filter((item) => item.lead_id === lead.id).length);
    if (lead.priority !== detail.priority) {
      lead.priority = detail.priority;
      updated += 1;
    }
  }
  return send(res, { updated, checked: leads.length });
});

router.post("/ai/priority-flags", (req, res) => res.redirect(307, "/api/ai/recalculate-priority"));
router.get("/ai/admission-summary/:leadId", (req, res) => {
  const lead = leads.find((item) => item.id === Number(req.params.leadId));
  if (!lead) return error(res, "Lead not found", 404);
  return send(res, { summary: generateAdmissionSummary(lead, followUps.filter((item) => item.lead_id === lead.id), admissions.find((item) => item.lead_id === lead.id)) });
});

router.get("/counsellors", requireAdmin, (req, res) => send(res, counsellors.filter((user) => user.is_active).map(publicUser)));
router.post("/counsellors", requireAdmin, (req, res) => {
  const user = { id: counters.counsellor++, name: req.body.name, email: req.body.email, phone: req.body.phone || null, role: req.body.role || "counsellor", is_active: true, created_at: now() };
  counsellors.push(user);
  return send(res, publicUser(user), 201);
});
router.patch("/counsellors/:id", requireAdmin, (req, res) => {
  const user = counsellors.find((item) => item.id === Number(req.params.id));
  if (!user) return error(res, "Counsellor not found", 404);
  Object.assign(user, req.body);
  return send(res, publicUser(user));
});

router.get("/notifications", (req, res) => {
  const data = (isAdmin(req.user) ? notifications : notifications.filter((item) => item.counsellor_id === req.user.id)).filter((item) => req.query.unread === "true" ? !item.is_read : true);
  return send(res, { notifications: data, unread_count: data.filter((item) => !item.is_read).length });
});
router.post("/notifications/scan", (req, res) => send(res, { created: 0, due_today: 1, overdue: 1 }));
router.patch("/notifications/:id/read", (req, res) => {
  const notification = notifications.find((item) => item.id === Number(req.params.id));
  if (!notification) return error(res, "Notification not found", 404);
  notification.is_read = true;
  return send(res, { id: notification.id, is_read: true });
});
router.patch("/notifications/read-all", (req, res) => {
  notifications.forEach((item) => {
    if (isAdmin(req.user) || item.counsellor_id === req.user.id) item.is_read = true;
  });
  return send(res, { updated: notifications.length });
});

module.exports = router;
