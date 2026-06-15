# Readable Code Guide

This file explains the project in simple language so anyone in the team can understand what was built, where the code is, and how the full flow works.

## 1. What This Project Does

The **Admission Counsellor Follow-up Dashboard** helps FirstCry Intellitots manage preschool admission enquiries.

Before this system, parent enquiries could be scattered across calls, WhatsApp, and Excel sheets. This app keeps everything in one place:

- Parent enquiry form
- Counsellor login
- Lead list and filters
- Follow-up history
- Demo tour booking
- Overdue follow-up alerts
- Counsellor performance analytics
- Rule-based AI call script

## 2. Main User Roles

### Parent

The parent uses the public enquiry page:

```text
/enquiry
```

They submit details like parent name, phone number, child name, child age, and program interest.

### Counsellor

The counsellor logs in and manages assigned leads:

- Calls parents
- Updates lead status
- Logs follow-up notes
- Books demo tours
- Generates call scripts

### Admin / Centre Head

The admin can see everything:

- All leads
- All counsellor performance
- Analytics
- Notifications
- Counsellor management

## 3. Folder Structure

```text
admission-dashboard/
├── backend/      Node.js + Express API
├── frontend/     React + Vite + Tailwind dashboard
├── docs/         API docs, diagrams, reports, readable guide
├── scripts/      PowerShell helper scripts for local MySQL
└── tests/        Test logs and bug report template
```

## 4. Backend Explanation

The backend is inside:

```text
backend/
```

### Important Files

| File | Purpose |
|---|---|
| `server.js` | Starts the Express server and connects all routes |
| `db/connection.js` | Creates the MySQL connection pool |
| `db/schema.sql` | Creates all database tables and seed data |
| `middleware/auth.js` | Checks JWT token and admin access |
| `services/aiEngine.js` | Rule-based AI logic |
| `services/notificationService.js` | Creates follow-up notifications |

### Backend Route Files

| File | What It Handles |
|---|---|
| `routes/auth.js` | Login and current user |
| `routes/leads.js` | Lead list, create, update, assign, import |
| `routes/followups.js` | Follow-up logging and due/overdue follow-ups |
| `routes/tours.js` | Demo tour slots and bookings |
| `routes/analytics.js` | Summary cards, funnel chart, counsellor stats |
| `routes/enquiry.js` | Public enquiry form submission |
| `routes/ai.js` | Call script, follow-up message, priority recalculation |
| `routes/counsellors.js` | Admin counsellor management |
| `routes/notifications.js` | Notification list and mark-as-read |

## 5. Database Explanation

The database has 7 main tables.

| Table | Purpose |
|---|---|
| `counsellors` | Stores admin and counsellor accounts |
| `leads` | Stores parent enquiries |
| `follow_ups` | Stores every call and status change |
| `tour_slots` | Stores available demo visit slots |
| `tour_bookings` | Connects leads to tour slots |
| `admissions` | Stores final converted admission records |
| `notifications` | Stores alerts for due and overdue follow-ups |

The most important table is `leads`, because every parent enquiry starts there.

## 6. Frontend Explanation

The frontend is inside:

```text
frontend/src/
```

### Important Files

| File | Purpose |
|---|---|
| `App.jsx` | Defines all page routes |
| `main.jsx` | Starts React, Query Client, Router, and Auth Provider |
| `services/api.js` | All backend API calls are written here |
| `context/AuthContext.jsx` | Stores login user and JWT token |
| `components/Layout/Sidebar.jsx` | Left navigation menu |
| `components/Layout/TopBar.jsx` | Top bar, search, quick add, notifications |

### Pages

| Page | Purpose |
|---|---|
| `Login.jsx` | Counsellor/admin login |
| `Dashboard.jsx` | Summary cards, charts, follow-ups, command center |
| `Leads.jsx` | Lead table, filters, new lead modal, CSV import |
| `LeadDetail.jsx` | Lead profile, timeline, call script, tour booking |
| `Enquiry.jsx` | Public parent enquiry form |
| `Tours.jsx` | Demo tour slot calendar |
| `Analytics.jsx` | Counsellor stats and charts |
| `FollowUps.jsx` | Due today and overdue follow-up queues |
| `Counsellors.jsx` | Admin-only counsellor management |

## 7. Full Flow

```text
Parent submits enquiry
        ↓
Lead is created in MySQL
        ↓
Counsellor logs in
        ↓
Counsellor views lead and calls parent
        ↓
Follow-up is logged
        ↓
Demo tour is booked
        ↓
Parent visits centre
        ↓
Lead becomes admitted or lost
        ↓
Admin checks analytics and performance
```

## 8. Rule-Based AI Layer

This project does not use paid external AI APIs.

The file:

```text
backend/services/aiEngine.js
```

does three useful things:

- Generates a call script for counsellors
- Generates a WhatsApp-style follow-up message
- Calculates lead priority as high, medium, or low

The AI logic is rule-based, so it is easy to explain in review.

## 9. How To Run Locally

Start MySQL:

```powershell
cd C:\Users\kpava\Downloads\OPENAIHACKATHON\admission-dashboard
powershell -ExecutionPolicy Bypass -File .\scripts\start-local-mysql.ps1
```

Import schema:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\import-schema.ps1
```

Start backend:

```powershell
cd C:\Users\kpava\Downloads\OPENAIHACKATHON\admission-dashboard\backend
npm run dev
```

Start frontend:

```powershell
cd C:\Users\kpava\Downloads\OPENAIHACKATHON\admission-dashboard\frontend
npm run dev
```

Open:

```text
http://127.0.0.1:5173/login
```

Login:

```text
admin@firstcryintellitots.com
Admin@123
```

## 10. Review Demo Script

Use this order during review:

1. Show architecture diagram.
2. Show ER diagram.
3. Open public enquiry form.
4. Submit a parent enquiry.
5. Login as admin.
6. Open dashboard and show metrics.
7. Open leads page and filters.
8. Open one lead detail page.
9. Log a follow-up call.
10. Generate AI call script.
11. Book a demo tour.
12. Show analytics and counsellor performance.

## 11. What To Say In Simple Words

This project is a complete admission follow-up system for a preschool. It helps counsellors avoid missed follow-ups and helps the centre head track the full admission funnel. It includes frontend, backend, MySQL database, authentication, analytics, notifications, demo tour booking, and rule-based AI call assistance.
