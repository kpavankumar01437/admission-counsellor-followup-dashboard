# Parent Login Flow

This file explains the new parent login feature in simple language.

## Why We Added It

Earlier, parents could directly open the public enquiry form.

Now the flow is cleaner:

```text
Parent Login
     ↓
Admission Enquiry Form
     ↓
Lead Created in Dashboard
     ↓
Counsellor Follows Up
```

This lets the system remember the parent email before the enquiry is submitted.

## Parent URL

Parents should open:

```text
http://127.0.0.1:5173/parent-login
```

## What Parent Enters

The parent login page asks for:

- Parent email
- Parent name
- Phone number

Only email is required.

## What Happens After Login

When the parent clicks **Continue to Enquiry**:

1. Backend creates or updates a parent record in MySQL.
2. Backend returns a parent JWT token.
3. Frontend saves the parent session in `localStorage`.
4. Parent is redirected to `/enquiry`.
5. The enquiry form opens with the parent email already filled.

## Database Table

The parent login uses this table:

```text
parents
```

Important columns:

| Column | Purpose |
|---|---|
| `id` | Parent id |
| `name` | Parent name |
| `email` | Parent login email |
| `phone` | Parent phone |
| `last_login_at` | Last parent login time |
| `created_at` | Parent record created time |

## Backend API

Parent login uses:

```text
POST /api/auth/parent-login
```

Example request:

```json
{
  "email": "parent@example.com",
  "name": "Test Parent",
  "phone": "9876543210"
}
```

Example response:

```json
{
  "success": true,
  "data": {
    "token": "parent-jwt-token",
    "parent": {
      "id": 1,
      "name": "Test Parent",
      "email": "parent@example.com",
      "phone": "9876543210"
    }
  }
}
```

## Frontend Files Changed

| File | Purpose |
|---|---|
| `src/pages/ParentLogin.jsx` | Parent login page |
| `src/pages/Enquiry.jsx` | Reads parent session and prefills email |
| `src/App.jsx` | Adds `/parent-login` route and protects `/enquiry` |
| `src/services/api.js` | Adds `parentLogin()` API function |

## Review Explanation

Say this during review:

> Parents first login with their email id. After login, they are redirected to the enquiry form. The parent email is automatically attached to the enquiry, and the counsellor can see the enquiry as a new lead in the dashboard.

## Demo Steps

1. Open `http://127.0.0.1:5173/parent-login`.
2. Enter a parent email, name, and phone.
3. Click **Continue to Enquiry**.
4. Fill child details.
5. Submit the enquiry.
6. Login as admin.
7. Open Leads page and search for that parent email or phone.
