# NexusAI Enterprise — Production Deployment Architecture
### Supabase (Database) ⇄ Render (Backend API) ⇄ Vercel (Frontend Client)

- **Frontend Client (Vercel)**: `https://enterprise-lemon-three.vercel.app`
- **Backend Server (Render)**: `https://enterprise-1l1e.onrender.com`
- **Database (Supabase)**: `https://ltaiyufseyxfytlzeqdm.supabase.co`

---

## 🚀 Live Linked Cloud Setup

### 1. Client Environment on Vercel
In Vercel Project Settings > Environment Variables:
- `VITE_API_BASE_URL` = `https://enterprise-1l1e.onrender.com/api`
- `VITE_SUPABASE_URL` = `https://ltaiyufseyxfytlzeqdm.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. Backend Environment on Render
In Render Dashboard under `enterprise-1l1e` > Environment:
- `CLIENT_URL` = `https://enterprise-lemon-three.vercel.app`
- `PORT` = `5000`
- `NODE_ENV` = `production`
- `JWT_SECRET` = *(32+ character random string)*
- `GEMINI_API_KEY` = *(Your Gemini 2.5 Flash API key)*
- `SUPABASE_DB_URL` = `postgresql://postgres:Nishant.0698@db.ltaiyufseyxfytlzeqdm.supabase.co:5432/postgres`
- `SUPABASE_URL` = `https://ltaiyufseyxfytlzeqdm.supabase.co`
- `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- `SUPABASE_SERVICE_ROLE_KEY` = *(From your Supabase project)*

---

## 🔒 Verification Endpoints
- **Render Health Check**: [https://enterprise-1l1e.onrender.com/api/health](https://enterprise-1l1e.onrender.com/api/health)
- **Vercel Client**: [https://enterprise-lemon-three.vercel.app](https://enterprise-lemon-three.vercel.app)
