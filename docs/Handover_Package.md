# Company Handover Package

Date: 2026-06-15

Project: Admission Counsellor Follow-up Dashboard

## Live Links

| Item | URL |
|---|---|
| Frontend | `https://frontend-beryl-seven-90.vercel.app` |
| Backend API | `https://admission-dashboard-backend-production.up.railway.app` |
| Backend health check | `https://admission-dashboard-backend-production.up.railway.app/api/health` |
| GitHub repository | `https://github.com/kpavankumar01437/admission-counsellor-followup-dashboard` |

## Login Details For Demo

| Role | Email | Password |
|---|---|---|
| Admin | `admin@firstcryintellitots.com` | `Admin@123` |
| Counsellor | `priya@firstcry.com` | `Counsellor@123` |
| Counsellor | `arjun@firstcry.com` | `Counsellor@123` |

Parent login is email-based for the prototype. Any valid email can be used on:

```text
https://frontend-beryl-seven-90.vercel.app/parent-login
```

## Deployed Services

| Layer | Platform | Status |
|---|---|---|
| Frontend | Vercel | Deployed |
| Backend | Railway | Deployed |
| Database | Railway MySQL | Schema imported |
| Repository | GitHub | Private repo pushed |

## Database

The cloud database uses Railway MySQL.

Database name:

```text
admission_dashboard
```

Tables imported:

- `counsellors`
- `parents`
- `leads`
- `follow_ups`
- `workflow_events`
- `seat_availability`
- `referrals`
- `tour_slots`
- `tour_bookings`
- `admissions`
- `notifications`

Important note:

The database is currently inside the existing Railway project `zoological-success` because the Railway free plan blocked creating a new project. For company handover, either transfer this Railway project or recreate the database under the company's Railway account and rerun `backend/db/schema.sql`.

## Verification Completed

Backend:

- `/api/health` works
- Admin login works
- Railway backend deployment succeeded
- Cloud MySQL schema imported successfully

Frontend:

- Vercel deployment succeeded
- Staff login works on deployed frontend
- Dashboard loads after login
- Operations page loads with workflow recommendations
- Parent login page loads

Testing evidence:

- `tests/api_test_log.md`
- `tests/Quality_Report.md`

## Handover Checklist

Before final company handover:

- Transfer or invite company members to the GitHub repo.
- Transfer or recreate Railway backend and MySQL under company ownership.
- Transfer or invite company members to the Vercel project.
- Replace demo admin password.
- Replace `JWT_SECRET` if environment ownership changes.
- Remove sample data if the company wants a clean production database.
- Add real counsellor accounts.
- Add demo video link in `README.md`.

## Current Limitation

The backend is deployed on Railway instead of Render because Render CLI/API credentials were not available on this machine. This is acceptable for a working handover prototype. If the company specifically requires Render, connect the GitHub repo to Render manually and use the same backend environment variables.
