# NexusAI Enterprise — 3-System Deployment Architecture
### Supabase (Backend/Database) ⇄ Render (Server) ⇄ Vercel (Client)

NexusAI Enterprise is split into three decoupled, production-ready systems:
1. **Client**: Frontend React 18 + Vite SPA deployed to **Vercel** (`client/`).
2. **Server**: Node.js/Express REST API deployed to **Render** (`server/` or `backend/`).
3. **Backend**: Managed PostgreSQL, Row Level Security, and SDK access via **Supabase** (`backend/supabase/`).

---

## 🗂️ Environment Files Reference

| File | System | Description | Target Cloud |
|---|---|---|---|
| `.env.client.example` / `client/.env` | **Client** | Vercel client environment (`VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) | **Vercel** |
| `.env.server.example` / `server/.env` | **Server** | Express server environment (`PORT`, `CLIENT_URL`, `JWT_SECRET`, `GEMINI_API_KEY`) | **Render** |
| `.env.supabase.example` / `backend/.env.supabase` | **Backend** | Supabase keys (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`) | **Supabase** / **Render** |

---

## 🚀 System 1: Backend Setup (Supabase)

### Step 1: Create a Supabase Project
1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Choose your preferred region and set a strong database password.

### Step 2: Run Database Schema & RLS Policies
1. In the Supabase Dashboard, open the **SQL Editor** (`/project/_/sql`).
2. Open `backend/supabase/schema.sql` and run it. This creates:
   - `users`
   - `initiatives`
   - `ai_evaluations`
   - `workflow_actions`
   - `audit_logs`
   - UUID extension & performance indexes.
3. Open `backend/supabase/rls_policies.sql` and run it. This enables:
   - Row Level Security (RLS) across all tables.
   - Service Role bypass for the Render backend.
   - Public read permissions for approved initiatives.
   - Immutable WORM (Write-Once, Read-Only) policies on `audit_logs`.
4. Open `backend/supabase/seed.sql` and run it to pre-populate default enterprise users (Admin, Department Leads, Analysts) and initial initiatives.

### Step 3: Copy Supabase Keys
Go to **Project Settings > API**:
- **Project URL**: copy and save as `SUPABASE_URL` / `SUPABASE_SERVICE_URL`.
- **anon / public key**: copy and save as `SUPABASE_ANON_KEY` (also `VITE_SUPABASE_ANON_KEY`).
- **service_role key**: copy and save as `SUPABASE_SERVICE_ROLE_KEY`.

Go to **Project Settings > Database > Connection Parameters > URI**:
- Copy the **Connection string (URI)** or **Transaction pooler** URI:
  ```text
  postgresql://postgres.[project-ref]:[db-password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
  ```
- Save as `SUPABASE_DB_URL`.

---

## 🖥️ System 2: Server Setup (Render)

### Method A: Deploy with Render Blueprint (`render.yaml`)
1. Push your repository to GitHub / GitLab.
2. In the [Render Dashboard](https://dashboard.render.com), click **New + > Blueprint**.
3. Select your repository. Render will automatically read `render.yaml` and provision the Web Service.

### Method B: Manual Web Service Creation on Render
1. In Render, click **New + > Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Name**: `nexus-enterprise-backend`
   - **Region**: Same region as your Supabase DB (e.g. Oregon / US-East)
   - **Branch**: `main`
   - **Root Directory**: `server` (or `backend`)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Health Check Path**: `/api/health`
4. Add the following **Environment Variables** in Render:

| Environment Variable | Value | Notes |
|---|---|---|
| `PORT` | `5000` | Port for Express server |
| `NODE_ENV` | `production` | Production mode |
| `CLIENT_URL` | `https://nexus-enterprise.vercel.app` | Your Vercel frontend URL |
| `JWT_SECRET` | *(Random 32+ char string)* | JWT signing secret |
| `GEMINI_API_KEY` | `your_gemini_api_key` | Your Google Gemini API Key |
| `SUPABASE_URL` | `https://[ref].supabase.co` | Supabase Project URL |
| `SUPABASE_SERVICE_URL` | `https://[ref].supabase.co` | Supabase Project URL |
| `SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY`| `eyJhbGciOi...` | Supabase service_role key |
| `SUPABASE_DB_URL` | `postgresql://...:6543/postgres?pgbouncer=true` | Supabase Pooler URI |

5. Click **Create Web Service**. Once deployed, copy your Render public URL:
   `https://nexus-enterprise-backend.onrender.com`

---

## 🌐 System 3: Client Setup (Vercel)

### Step 1: Import Project to Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New... > Project**.
2. Select your repository.

### Step 2: Configure Project Settings
- **Framework Preset**: `Vite`
- **Root Directory**: Click *Edit* and select `client` (or `frontend`).
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Add Environment Variables in Vercel
In the Vercel project configuration, add:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://nexus-enterprise-backend.onrender.com/api` *(Your Render backend URL)* |
| `VITE_SUPABASE_URL` | `https://[ref].supabase.co` *(Your Supabase project URL)* |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` *(Your Supabase anon key)* |

### Step 4: Deploy
Click **Deploy**.
Vercel automatically applies [`client/vercel.json`](file:///c:/Users/Nishant%20Gupta/Enterprise/client/vercel.json) to handle single-page routing rewrites so routes like `/dashboard`, `/initiatives/:id`, and `/intelligence` refresh seamlessly.

---

## 💻 Local Multi-System Development

To run all 3 systems locally:

```powershell
# Run the Client (Vite React - http://localhost:5173)
npm run dev:client

# Run the Server (Express API - http://localhost:5000)
npm run dev:server

# Run the Backend integration tests
npm run test:backend
```

Both local and cloud setups are 100% synchronized and production-ready!

