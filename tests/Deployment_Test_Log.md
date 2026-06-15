# Deployment Test Log

Date: 2026-06-15

## Live Services

| Service | URL | Status |
|---|---|---|
| Frontend | `https://frontend-beryl-seven-90.vercel.app` | Live |
| Backend | `https://admission-dashboard-backend-production.up.railway.app` | Live |
| GitHub | `https://github.com/kpavankumar01437/admission-counsellor-followup-dashboard` | Pushed |
| Railway MySQL | `admission_dashboard` database | Schema imported |

## Deployment Checks

| ID | Test | Expected | Actual | Status |
|---|---|---|---|---|
| DEP-01 | Backend health URL | Returns API status ok | Passed | Passed |
| DEP-02 | Backend admin login | Returns JWT success response | Passed | Passed |
| DEP-03 | CORS from Vercel frontend | `Access-Control-Allow-Origin` allows frontend | Passed | Passed |
| DEP-04 | Vercel frontend root | Returns HTTP 200 | Passed | Passed |
| DEP-05 | Staff login on deployed frontend | Redirects to dashboard | Passed | Passed |
| DEP-06 | Deployed dashboard | Command center visible | Passed | Passed |
| DEP-07 | Deployed operations page | Workflow and recommendations visible | Passed | Passed |
| DEP-08 | Deployed parent login | Parent login page visible | Passed | Passed |

Result: **8 / 8 deployment checks passed**

## Notes

- Backend is deployed on Railway because Render credentials were not available.
- Frontend is deployed on Vercel.
- Database is imported into Railway MySQL under the existing Railway project because the Railway free plan blocked creating a new separate project.
