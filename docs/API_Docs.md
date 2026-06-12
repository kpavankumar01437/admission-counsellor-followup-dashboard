# Admission Counsellor Follow-up Dashboard API Docs

Base URL:

- Local: `http://localhost:5000/api`
- Production: `https://your-render-app.onrender.com/api`

All protected routes require `Authorization: Bearer <JWT>`.

## Auth

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/login` | No | Counsellor/admin login |
| GET | `/auth/me` | Yes | Current user profile |

Seed credentials:

- Admin: `admin@firstcryintellitots.com` / `Admin@123`
- Counsellors: `priya@firstcry.com` or `arjun@firstcry.com` / `Counsellor@123`

## Leads

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/leads` | Yes | List leads with filters |
| POST | `/leads` | Yes | Create lead |
| POST | `/leads/import` | Yes | Import JSON/CSV parsed leads |
| GET | `/leads/:id` | Yes | Lead detail with follow-ups and tours |
| PATCH | `/leads/:id/status` | Yes | Update lead status and log history |
| PATCH | `/leads/:id/assign` | Admin | Assign counsellor |
| PATCH | `/leads/:id` | Yes | Update lead fields |

Supported lead filters: `status`, `counsellor_id`, `priority`, `date_from`, `date_to`, `search`.

## Follow-ups

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/leads/:id/followup` | Yes | Log call/follow-up |
| GET | `/leads/:id/followups` | Yes | Follow-up history |
| GET | `/followups/today` | Yes | Due today |
| GET | `/followups/overdue` | Yes | Overdue active leads |

## Tours

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/tours/slots` | Yes | List demo slots |
| POST | `/tours/slots` | Admin | Create demo slot |
| POST | `/tours/book` | Yes | Book lead to slot |
| PATCH | `/tours/book/:id` | Yes | Update booking status |

## Analytics, AI, Notifications

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/analytics/summary` | Yes | Summary cards |
| GET | `/analytics/funnel` | Yes | Funnel counts |
| GET | `/analytics/counsellor` | Yes | Counsellor stats |
| GET | `/analytics/monthly` | Yes | Last 6 months trend |
| POST | `/ai/call-script/:leadId` | Yes | Rule-based call script |
| GET | `/ai/followup-message/:leadId` | Yes | WhatsApp message |
| POST | `/ai/recalculate-priority` | Yes | Update priorities |
| GET | `/notifications` | Yes | Notification list |
| PATCH | `/notifications/:id/read` | Yes | Mark one read |
| PATCH | `/notifications/read-all` | Yes | Mark all read |

Response shape:

```json
{ "success": true, "data": {} }
```

Error shape:

```json
{ "success": false, "error": "Message" }
```
