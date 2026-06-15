# Admission Counsellor Follow-up Dashboard

Full-stack internship project for FirstCry Intellitots admission follow-up management.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MySQL
- Auth: JWT
- AI Layer: Rule-based JavaScript
- Deployment: Railway backend + Vercel frontend + Railway MySQL

## Features

- Parent email login
- Parent enquiry form
- Parent portal update screen
- Counsellor/admin login
- Lead funnel tracking: new, contacted, demo scheduled, demo visited, follow-up, admitted, lost
- Follow-up logging with history timeline
- Demo tour slot creation and booking
- Teacher, daycare, classroom, centre admin, and counsellor workflow records
- Seat availability tracking
- Referral tracking
- Overdue and due-today follow-up alerts
- Counsellor performance analytics
- Funnel and monthly trend charts
- Rule-based AI call scripts, priority recalculation, and operational recommendations
- CSV lead import

## Local Setup

### 1. Database

Create MySQL database and run:

```powershell
Get-Content .\backend\db\schema.sql | mysql -u root -p
```

If you prefer using Command Prompt instead of PowerShell:

```cmd
mysql -u root -p < backend\db\schema.sql
```

Another PowerShell-safe option is to open MySQL first:

```powershell
mysql -u root -p
```

Then run this inside the MySQL prompt:

```sql
source C:/Users/kpava/Downloads/OPENAIHACKATHON/admission-dashboard/backend/db/schema.sql;
```

If PowerShell says `mysql is not recognized`, MySQL is not installed locally or the MySQL `bin` folder is not in PATH. Use Railway's MySQL query editor instead, or install MySQL Server first:

```powershell
winget install Oracle.MySQL
```

After installing MySQL, open a new PowerShell window and rerun the schema import command.

Seed users:

- Admin: `admin@firstcryintellitots.com` / `Admin@123`
- Counsellors: `priya@firstcry.com`, `arjun@firstcry.com` / `Counsellor@123`

### 2. Backend

```powershell
cd C:\Users\kpava\Downloads\OPENAIHACKATHON\admission-dashboard\backend
npm install
copy .env.example .env
npm run dev
```

Backend runs on `http://localhost:5000`.

### 3. Frontend

```powershell
cd C:\Users\kpava\Downloads\OPENAIHACKATHON\admission-dashboard\frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Environment Variables

Backend production:

```env
PORT=5000
DB_HOST=your-railway-host
DB_USER=your-railway-user
DB_PASS=your-railway-password
DB_NAME=railway
DB_PORT=3306
DB_SSL=true
JWT_SECRET=replace_with_long_secret
CORS_ORIGIN=https://frontend-beryl-seven-90.vercel.app
ENABLE_NOTIFICATION_INTERVAL=true
```

Frontend production on Vercel:

```env
VITE_API_URL=https://admission-dashboard-backend-production.up.railway.app
```

## Deployment Notes

- Backend is deployed on Railway from the `backend` folder.
- Vercel frontend root directory: `frontend`
- Vercel build command: `npm run build`
- Vercel output directory: `dist`
- React Router rewrites are in `vercel.json`

## Live URLs

- Public parent portal: `https://frontend-beryl-seven-90.vercel.app`
- Private staff login: `https://frontend-beryl-seven-90.vercel.app/staff-login`
- Backend: `https://admission-dashboard-backend-production.up.railway.app`
- GitHub: `https://github.com/kpavankumar01437/admission-counsellor-followup-dashboard`
- Demo video: `TODO: add demo video link`

Do not publish the private staff login link on parent-facing pages. Staff access is still protected by JWT login credentials.

## Team Credits

- K Pavan Kumar (Chinna) - CSE-FSD-1A
- Aurora Deemed University x NIAT
- FirstCry Intellitots internship project

## Final Commit Message

```text
feat: complete admission counsellor follow-up dashboard
```

## Release Tag

```powershell
git tag v1.0.0 -m "Final submission - Review 3"
```
