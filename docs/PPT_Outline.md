# Final PPT Outline - 12 Slides

## Slide 1: Title

- Admission Counsellor Follow-up Dashboard
- FirstCry Intellitots Internship Project
- K Pavan Kumar (Chinna), CSE-FSD-1A
- Aurora Deemed University x NIAT
- Review 3: June 29-30, 2026

## Slide 2: Problem Statement

- Parent enquiries are currently tracked through calls, WhatsApp, and spreadsheets.
- Follow-ups are missed when ownership is unclear.
- Centre heads cannot quickly see counsellor performance or funnel status.
- Lost follow-ups directly reduce admission conversion.

## Slide 3: Proposed Solution

- A role-based dashboard for admission counsellors and centre heads.
- Public parent enquiry form.
- Lead status funnel from enquiry to admitted/lost.
- Follow-up reminders, demo tour booking, analytics, and AI call scripts.

## Slide 4: Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MySQL on Railway
- Auth: JWT
- Deployment: Render backend, Vercel frontend
- AI: Rule-based JavaScript engine

## Slide 5: Architecture

- Parent submits enquiry from public frontend.
- React dashboard calls Express APIs.
- Express validates requests and stores data in MySQL.
- AI service generates scripts and priorities.
- Notifications service scans due and overdue follow-ups.

## Slide 6: Database Design

- `counsellors` stores staff and roles.
- `leads` stores parent enquiries.
- `follow_ups` stores every call/status history.
- `tour_slots` and `tour_bookings` manage demo visits.
- `admissions` stores final conversions.
- `notifications` stores alerts.

## Slide 7: Frontend Demo

- Login screen
- Dashboard summary cards and charts
- Leads table with filters
- Lead detail timeline
- Public enquiry form
- Tour booking calendar

## Slide 8: Backend APIs

- Auth APIs: login and current user
- Lead APIs: create, list, update status, assign
- Follow-up APIs: log call, today, overdue
- Tour APIs: slots and booking
- Analytics APIs: summary, funnel, counsellor stats

## Slide 9: AI Module

- Generates personalized counsellor call scripts.
- Creates WhatsApp-ready follow-up messages.
- Calculates lead priority using rule-based logic.
- No external API cost.

## Slide 10: Testing

- Public form validation tested.
- Auth success/failure tested.
- Lead creation and status update tested.
- Follow-up timeline tested.
- Tour booking and analytics tested.
- Mobile responsive layout checked.

## Slide 11: Deployment

- Database: Railway MySQL
- Backend: Render Node.js service
- Frontend: Vercel static deployment
- Environment variables configured separately.
- React Router handled through Vercel rewrites.

## Slide 12: Conclusion and Future Scope

- Reduces missed follow-ups.
- Improves counsellor accountability.
- Gives centre head real-time funnel visibility.
- Future: WhatsApp API, email alerts, multi-branch support, PDF reports, OpenAI summaries.
