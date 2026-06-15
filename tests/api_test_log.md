# API Test Log

Date: 2026-06-15

Environment:

- Backend: `http://127.0.0.1:5000`
- Frontend: `http://127.0.0.1:5173`
- Database: Local MySQL

## Automated API Smoke Tests

| ID | Test | Expected | Actual | Status |
|---|---|---|---|---|
| API-01 | Backend health | API returns healthy response | API healthy | Passed |
| API-02 | Admin login | JWT returned for valid credentials | JWT received | Passed |
| API-03 | Invalid login | Wrong password rejected | Rejected with 401 | Passed |
| API-04 | Parent email login | Parent token and parent record returned | Parent session created | Passed |
| API-05 | Public enquiry submission | Lead created with `new` status | Lead created with id `7` | Passed |
| API-06 | Lead visible in staff list | Created lead found by search | Lead found by phone search | Passed |
| API-07 | Follow-up logging | Follow-up saved for created lead | Follow-up logged | Passed |
| API-08 | AI call script generation | Script returned for lead | Script generated with 840 characters | Passed |
| API-09 | Parent portal update | Workflow event created | Parent portal workflow id `5` | Passed |
| API-10 | Staff workflow record | Workflow event created | Workflow event id `6` | Passed |
| API-11 | Seat availability update | Seat record saved or updated | Seat availability saved | Passed |
| API-12 | Referral tracking | Referral record created | Referral id `2` | Passed |
| API-13 | Operations recommendations | Rule-based recommendations returned | 4 recommendations returned | Passed |
| API-14 | Analytics summary | Summary object returned | Total leads: 7, conversion: 14.3% | Passed |
| API-15 | Tour slots list | Available tour slots returned | 4 slots returned | Passed |

Result: **15 / 15 passed**

## Frontend Checks

| ID | Test | Expected | Actual | Status |
|---|---|---|---|---|
| UI-01 | ESLint | No lint errors | Passed | Passed |
| UI-02 | Production build | Vite build succeeds | Passed with bundle-size warning | Passed |
| UI-03 | Dashboard route | Command center and charts visible | Visible | Passed |
| UI-04 | Leads route | Lead table and new lead controls visible | Visible | Passed |
| UI-05 | Operations route | Workflow, seats, referrals, recommendations visible | Visible | Passed |
| UI-06 | Analytics route | Counsellor performance and export visible | Visible | Passed |
| UI-07 | Tours route | Tour calendar and add slot visible | Visible | Passed |
| UI-08 | Parent login route | Parent login form visible | Visible | Passed |
| UI-09 | Browser console | No runtime errors | No errors | Passed |

Result: **9 / 9 passed**

## Overall Result

Total verified checks: **24 / 24 passed**

Known warning:

- Vite reports that the JavaScript bundle is larger than 500 KB after minification. This is acceptable for the prototype, but code splitting can improve it later.
