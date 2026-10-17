# CivicEye AI
> **Intelligent Public Issue Detection & Resolution Platform**
> *Report Smarter. Resolve Faster. Build Better Cities.*

![CivicEye AI Banner](https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80)

CivicEye AI is a modern, responsive web prototype designed for smart city governance. It demonstrates an end-to-end workflow from citizen civic issue reporting to multimodal AI vision analysis (Google Gemini API), transparent 100-point priority scoring, authority department assignment, field resolution with before/after photo evidence, and live citizen tracking.

---

## ✨ Features & Highlights

- 🤖 **Google Gemini Vision AI Integration**: Multimodal AI vision model automatically classifies photo uploads (*Potholes, Garbage Overflow, Broken Streetlights, Water Leakage, Drainage Blockages*), calculates visual confidence, and estimates hazard severity.
- 🎯 **Transparent 100-Point Priority Model**: Priority scoring formula based on Severity (max 40pt), Duplicate Reports (max 25pt), Public Impact (max 20pt), and Location Factor (max 15pt).
- 🗺️ **Interactive OpenStreetMap Integration**: Spatial issue plotting using Leaflet maps with custom priority-colored markers and popup cards.
- 🔄 **Citizen, Authority & Field Worker Roles**: Separate, role-protected dashboards for reporting, assignment, and work completion.
- 📸 **Authority-Verified Resolution Evidence**: Assigned field workers upload completion photos; only an authenticated municipal authority can approve evidence and resolve the complaint.
- 🪄 **Interactive Demo Tour Controller**: Floating guided controller walking evaluators step-by-step through the 14-stage presentation scenario.
- 🗄️ **MongoDB-backed civic data**: Accounts, sessions, complaints, notifications, and complaint ID counters are stored in MongoDB Atlas.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20.19 or higher)
- `npm`

### Installation & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/saipaladi-code/CivicEye-AI.git
cd CivicEye-AI

# 2. Install dependencies
npm install

# 3. Copy .env.example to .env and set your private server-side credentials

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000/](http://localhost:3000/) in your browser.

---

## 🔐 Authentication setup

Authentication uses the Node server and MongoDB configured in the server-side `.env` file. Copy `.env.example` to `.env` and set:

- `MONGODB_URI` to your MongoDB Atlas connection string and `MONGODB_DB_NAME` to the database name.
- `GEMINI_API_KEY` if you use the existing AI image analysis feature.
- SMTP settings (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`) plus `APP_BASE_URL` to enable real password-reset emails. Recovery returns an explicit setup error until mail delivery is configured.

Keep `.env` private and never use a `VITE_` prefix for MongoDB credentials. Percent-encode special characters in the database username/password portion of the MongoDB URI. Start both the Vite frontend and API with `npm run dev`; the app is available at `http://localhost:3000`. Passwords are bcrypt-hashed and sessions use random HttpOnly cookies stored in MongoDB.

Create or update the Atlas collections and indexes at any time with `npm run db:setup`. It is safe to rerun; the setup is also ensured automatically when the server connects to MongoDB. The collections are `users`, `sessions`, `passwordResets`, `complaints`, `notifications`, and `counters`. Completion evidence photos are stored in MongoDB GridFS (`evidencePhotos.files` and `evidencePhotos.chunks`).

Citizens and field workers can register through the app. Field worker registrations are stored in the `users` collection with `role: "field_worker"` and `approvalStatus: "PENDING_APPROVAL"`; they cannot access the worker dashboard or task APIs until an authenticated municipal authority approves the application. Authorities can inspect submitted identity proof, approve or reject an application with a reason, or request more information from the **Field Worker Applications** section in the dashboard. Status and decision messages are available to applicants at sign-in and through in-app notifications after approval. Municipal Authority accounts cannot self-register and must still be provisioned by an administrator with `npm run provision:authority`. `npm run provision:worker` remains available for legacy/trusted worker accounts.

### Quick demo access

The login page offers Citizen, Field Worker, and Authority demo buttons. Demo access still authenticates against MongoDB through the normal bcrypt and HttpOnly-session flow. The demo authority is restricted server-side to marked demo complaints and demo worker accounts; it cannot inspect or modify real complaints or worker applications. Demo field-worker access requires an approved account and starts with a clearly labeled sample assignment. Seed records are only inserted or updated by the demo setup command; existing user accounts using the configured emails are never overwritten unless they are already marked as demo accounts with the matching role.

To configure demo access, set the following server-side variables in the private `.env` file (or deployment environment): `DEMO_CITIZEN_EMAIL`, `DEMO_CITIZEN_PASSWORD`, `DEMO_FIELD_WORKER_EMAIL`, `DEMO_FIELD_WORKER_PASSWORD`, `DEMO_AUTHORITY_EMAIL`, and `DEMO_AUTHORITY_PASSWORD`. Use distinct email addresses and passwords of 8–128 characters. Keep them out of frontend/Vite variables and source control. If these values are absent or the accounts have not been seeded, the login page explains that an administrator must configure the demo accounts.

After configuring all three role credentials, run `npm run demo:setup` from a trusted terminal. The repeatable script hashes the passwords with bcrypt, provisions an approved demo field worker linked to the demo authority, and upserts one clearly identified sample complaint assigned to that worker. Rerunning resets that sample task to its assigned starting state; it does not delete collections, remove unrelated records, or modify non-demo accounts.

To provision only the authority account, set `DEMO_AUTHORITY_EMAIL` and `DEMO_AUTHORITY_PASSWORD`, then run `npm run demo:setup:authority`. This creates the account but does not create sample complaints or worker accounts; configure the remaining role credentials and run the full setup to populate the demo workflow. Restart the server after changing environment variables.

If the citizen demo email is already used by a non-demo account, leave that account unchanged and use unused emails for the authority and worker with `npm run demo:setup:authority-worker`. This provisions only those two demo accounts; add an unused citizen demo email and run the full `npm run demo:setup` command to seed the sample complaint and make all three demo roles ready.

For a demonstration, click each role card on the login page:

- **Citizen Demo** opens the Citizen Dashboard with clearly labeled sample complaint data and complaint tracking.
- **Field Worker Demo** opens the Field Worker Dashboard with the approved demo sample assignment and existing evidence workflow.
- **Authority Demo** opens the Authority Dashboard with only clearly marked demo complaints and demo field-worker accounts in its server-side scope.

All three demo sessions use the existing logout control. To verify permissions, try accessing a different role's dashboard/API while signed in; the existing role checks must reject the request. Normal email/password login, registration, password reset, and worker approval continue to use their existing flows.

Worker completion photos are stored in MongoDB GridFS and uploaded through the authenticated server API; no separate Blob storage token is required. Evidence file URLs are served through authenticated API routes and are visible to citizens only after approval.

For MongoDB Atlas, also allowlist the server's IP in **Network Access** and grant the database user access only to the CivicEye database. Rotate any database password that has been shared in chat or screenshots, then update the local `.env` and restart the server.

New complaints and status/assignment updates are persisted in MongoDB. Citizens can read only their own complaints and notifications; municipal authority actions require an authenticated, provisioned authority account. Existing demo reports saved in browser local storage are not automatically imported into MongoDB.

For production, run `npm run build`, set `NODE_ENV=production`, and start with `npm start` behind HTTPS.

### Deploying to Vercel

The Vercel deployment serves the Vite frontend from `dist` and exposes the Express API through serverless entry points under `api/`. Authentication paths use the shared `api/auth/[action].js` entry point; the dynamic routes reuse the same backend routes and MongoDB session store as local development while keeping the function count within the Vercel Hobby plan limit. Add `MONGODB_URI` and optionally `MONGODB_DB_NAME` to the Vercel project's server-side Environment Variables for every deployment environment, then redeploy. Add `GEMINI_API_KEY` if image analysis is needed. Configure the SMTP variables and `APP_BASE_URL` to enable password reset emails. Keep credentials server-side; do not add database credentials to variables prefixed with `VITE_`.

---

## 🛠️ Built With

- **Frontend Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Maps**: Leaflet / OpenStreetMap
- **AI Vision Engine**: Google Gemini API (`gemini-1.5-flash`)
- **Animations**: Canvas Confetti & Custom CSS scanning radar

---

## 📜 License

MIT License. Developed as a College AI Project Prototype.
