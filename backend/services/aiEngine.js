const ACTIVE_STATUSES = ["new", "contacted", "demo-scheduled", "demo-visited", "follow-up"];

const toDate = (value) => (value ? new Date(value) : null);

const daysBetween = (fromDate, toDateValue = new Date()) => {
  const start = toDate(fromDate);
  if (!start || Number.isNaN(start.getTime())) return 0;
  return Math.floor((toDateValue.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0)) / 86400000);
};

const ageBand = (age) => {
  const numericAge = Number(age || 0);
  if (numericAge <= 2) return "toddler";
  if (numericAge <= 4) return "preschool";
  return "school-readiness";
};

const programPhrase = (lead) => lead.program_interest || "our early learning program";

const statusOpening = (lead) => {
  const program = programPhrase(lead);
  const child = lead.child_name || "your child";
  const status = lead.status || "new";

  if (status === "new") {
    return `I noticed your enquiry for ${program}. I wanted to understand what you are looking for and explain how FirstCry Intellitots can support ${child}'s early learning journey.`;
  }

  if (status === "contacted" || status === "follow-up") {
    return `I am calling to continue our discussion about ${program} and help you decide the next best step for ${child}.`;
  }

  if (status === "demo-scheduled") {
    return `I am calling to confirm your upcoming school tour and answer anything you want to know before visiting us.`;
  }

  if (status === "demo-visited") {
    return `Thank you for visiting FirstCry Intellitots. I wanted to check your feedback and help you complete the admission process if the program feels right.`;
  }

  return `I am calling from FirstCry Intellitots regarding your admission enquiry.`;
};

const generateCallScript = (lead) => {
  const parent = lead.parent_name || "Parent";
  const child = lead.child_name || "your child";
  const age = lead.child_age ? `${lead.child_age} years old` : "in the early learning age group";
  const band = ageBand(lead.child_age);
  const program = programPhrase(lead);
  const source = lead.source ? `through ${lead.source}` : "with us";

  return [
    `Good morning ${parent}, this is your admission counsellor from FirstCry Intellitots. Thank you for enquiring ${source}.`,
    `${statusOpening(lead)} I see that ${child} is ${age}, so we can focus on ${band === "toddler" ? "safe settling, routines, sensory play, and social comfort" : band === "preschool" ? "language, social confidence, activities, and concept learning" : "school-readiness, independence, communication, and structured learning"}.`,
    `For ${program}, we usually recommend a short centre visit so you can see classrooms, safety practices, teacher interaction, and the daily routine directly.`,
    `If fees are a concern, I can explain the payment options clearly before you decide. If distance is a concern, I can help you understand practical timings and commute fit. If age readiness is a concern, our team can assess ${child}'s comfort level during the demo visit.`,
    `Would tomorrow or the day after be convenient for a 20-minute centre tour?`
  ].join(" ");
};

const calculatePriorityDetails = (lead, followUpCount = 0, daysSinceCreated) => {
  const leadAge = Number.isFinite(daysSinceCreated) ? daysSinceCreated : daysBetween(lead.created_at);
  const nextFollowUpAge = lead.next_follow_up_date ? daysBetween(lead.next_follow_up_date) : null;
  const status = lead.status || "new";
  const demoVisitedAge = status === "demo-visited" ? daysBetween(lead.updated_at || lead.created_at) : null;

  if (lead.next_follow_up_date && nextFollowUpAge >= 0 && ACTIVE_STATUSES.includes(status)) {
    return { priority: "high", reason: "Follow-up is due today or overdue" };
  }

  if (leadAge > 7 && ["new", "contacted"].includes(status)) {
    return { priority: "high", reason: "Lead is older than 7 days and still not progressed" };
  }

  if (demoVisitedAge !== null && demoVisitedAge > 3) {
    return { priority: "high", reason: "Demo was visited more than 3 days ago without conversion" };
  }

  if (followUpCount >= 3 && ACTIVE_STATUSES.includes(status)) {
    return { priority: "medium", reason: "Multiple follow-ups are already logged" };
  }

  if (leadAge >= 3 && leadAge <= 7) {
    return { priority: "medium", reason: "Lead is 3 to 7 days old" };
  }

  return { priority: "low", reason: "New lead under 3 days old" };
};

const calculatePriority = (lead, followUpCount = 0, daysSinceCreated) => {
  return calculatePriorityDetails(lead, followUpCount, daysSinceCreated).priority;
};

const generateFollowUpMessage = (lead, counsellorName = lead.counsellor_name || "Admission Counsellor") => {
  const parent = lead.parent_name || "Parent";
  const child = lead.child_name || "your child";
  const program = programPhrase(lead);
  const status = lead.status || "new";

  if (status === "demo-scheduled") {
    return `Dear ${parent}, this is ${counsellorName} from FirstCry Intellitots. Your demo visit for ${child} is scheduled. Please reply if you need timing help.`;
  }

  if (status === "demo-visited") {
    return `Dear ${parent}, this is ${counsellorName} from FirstCry Intellitots. Thank you for visiting us. Shall I help complete ${child}'s ${program} admission?`;
  }

  if (status === "follow-up" || status === "contacted") {
    return `Dear ${parent}, this is ${counsellorName} from FirstCry Intellitots. Following up on ${child}'s ${program} enquiry. Can we schedule your centre visit?`;
  }

  return `Dear ${parent}, this is ${counsellorName} from FirstCry Intellitots. Thank you for your enquiry for ${child}. Our team can guide you today.`;
};

const generateAdmissionSummary = (lead, followUps = [], admission = null) => {
  const parent = lead.parent_name || "The parent";
  const child = lead.child_name || "the child";
  const program = admission?.program || lead.program_interest || "the selected program";
  const calls = followUps.length;
  const finalStatus = admission ? "converted to admission" : `currently at ${lead.status || "new"} stage`;
  const amount = admission?.fee_amount ? ` with a fee amount of Rs. ${admission.fee_amount}` : "";

  return `${parent}'s enquiry for ${child} in ${program} is ${finalStatus}. The counsellor logged ${calls} interaction${calls === 1 ? "" : "s"} from first enquiry to the current stage${amount}. Key notes should be reviewed in the follow-up timeline before the next centre-head review.`;
};

const generateOperationalRecommendations = ({ leads = [], seats = [], events = [], referrals = [] }) => {
  const recommendations = [];

  const urgentLeads = leads.filter((lead) => lead.priority === "high" && ACTIVE_STATUSES.includes(lead.status));
  if (urgentLeads.length) {
    recommendations.push({
      type: "follow-up",
      priority: "high",
      title: `${urgentLeads.length} high-priority admission lead${urgentLeads.length === 1 ? "" : "s"} need action`,
      message: `Start with ${urgentLeads[0].parent_name}. Their lead is at ${urgentLeads[0].status.replace(/-/g, " ")} stage.`
    });
  }

  const tightSeatPrograms = seats.filter((seat) => Number(seat.total_seats || 0) - Number(seat.filled_seats || 0) <= 3);
  if (tightSeatPrograms.length) {
    recommendations.push({
      type: "seat-availability",
      priority: "high",
      title: "Limited seats need faster closure",
      message: `${tightSeatPrograms.map((seat) => seat.program).join(", ")} have 3 or fewer seats remaining. Prioritize demo-visited leads for these programs.`
    });
  }

  const actionEvents = events.filter((event) => event.status === "action-needed");
  if (actionEvents.length) {
    recommendations.push({
      type: "operations",
      priority: "medium",
      title: `${actionEvents.length} school operation item${actionEvents.length === 1 ? "" : "s"} need review`,
      message: `Latest action item: ${actionEvents[0].title}. Assign an owner or mark it completed after review.`
    });
  }

  const openReferrals = referrals.filter((referral) => ["new", "contacted"].includes(referral.status));
  if (openReferrals.length) {
    recommendations.push({
      type: "referral",
      priority: "medium",
      title: "Referral follow-up opportunity",
      message: `${openReferrals.length} referral${openReferrals.length === 1 ? "" : "s"} can be followed up to improve admission conversion.`
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      type: "system",
      priority: "low",
      title: "Workflow is stable",
      message: "No urgent operational gaps detected. Continue monitoring new enquiries, demo visits, and follow-up queues."
    });
  }

  return recommendations;
};

module.exports = {
  generateCallScript,
  calculatePriority,
  calculatePriorityDetails,
  generateFollowUpMessage,
  generateAdmissionSummary,
  generateOperationalRecommendations
};
