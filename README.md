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
