# Smart Operations Workflow Guide

This file explains how the upgraded prototype works from Step 1 to Step 6.

Step 7, which is final deployment, report, PPT, GitHub, and demo video, will be handled later.

## What Changed

The project is no longer only an admission counsellor dashboard.

It now works as a smart admission and school operations prototype where information can come from:

- Parent enquiry form
- Parent portal
- Teacher dashboard
- Centre admin panel
- Daycare routine entry screen
- Classroom activity screen
- Counsellor follow-up screen

All these inputs are saved as structured workflow records.

## Step 1 - Information Entry

Users can enter or update information from different screens.

| Source | Where It Happens |
|---|---|
| Parent enquiry form | `/enquiry` |
| Parent portal | `/parent-portal` |
| Teacher dashboard | Operations page source dropdown |
| Centre admin panel | Operations page source dropdown |
| Daycare routine entry | Operations page source dropdown |
| Classroom activity | Operations page source dropdown |
| Counsellor follow-up | Operations page source dropdown |

## Step 2 - Backend Validation and Storage

Backend APIs validate the input and save:

- Source
- Status
- Owner type
- Priority
- Timestamp
- Parent email
- Child name
- Details

Main backend table:

```text
workflow_events
```

## Step 3 - Admission Conversion Workflow

The admission workflow is still handled by these existing modules:

- Leads
- Follow-ups
- Tours
- Admissions
- Referrals
- Seat availability

The funnel is:

```text
Enquiry → Contacted → Demo Scheduled → Demo Visited → Follow-up → Admitted / Lost
```

New supporting tables:

```text
seat_availability
referrals
```

## Step 4 - Rule-Based Smart Logic

The system generates useful recommendations using rule-based logic.

Examples:

- High-priority lead needs action
- Limited seats are available
- Parent portal update needs review
- Referral needs follow-up

Main backend function:

```text
generateOperationalRecommendations()
```

File:

```text
backend/services/aiEngine.js
```

## Step 5 - Dashboard View

Staff can view records, status, priorities, and action history from:

```text
/operations
```

The Operations page shows:

- Workflow summary cards
- Rule-based recommendations
- Source entry form
- Seat availability
- Referral tracking
- Action history

## Step 6 - Automated Reminders and Messages

The existing notification system still handles:

- Follow-up due today
- Overdue leads
- Demo reminders

The AI/rule-based system also helps prepare:

- Call scripts
- WhatsApp follow-up messages
- Operational recommendations

## Demo Flow

Use this sequence during review:

1. Open `/parent-login`.
2. Login as a parent with email.
3. Submit `/enquiry`.
4. Open `/parent-portal`.
5. Send a daycare or admission update.
6. Login as admin.
7. Open `/operations`.
8. Show the parent update in action history.
9. Add a teacher/daycare/classroom record.
10. Update seat availability.
11. Add a referral.
12. Show recommendations.

## Simple Explanation For Review

Say this:

> The system accepts admission and school-operation inputs from parents, teachers, centre admin, daycare, classroom activity, and counsellor follow-up screens. The backend validates every record and stores source, owner, status, priority, and timestamp. Then rule-based logic generates recommendations and alerts so the centre team can take action from one dashboard.
