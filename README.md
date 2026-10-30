# NexusAI Enterprise — AI Orchestrator & Knowledge Intelligence Platform

NexusAI Enterprise is a production-grade, full-stack Enterprise AI workflow automation and cross-departmental knowledge intelligence engine designed to eliminate enterprise data silos, automate complex proposal impact evaluations, and enforce strict multi-departmental governance.

---

## 🏛️ System Architecture

```
nexus-enterprise-ai/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js             # PostgreSQL connection pool with high-resilience persistence
│   │   │   └── gemini.js         # Official @google/genai SDK configuration (gemini-2.5-flash)
│   │   ├── controllers/
│   │   │   ├── authController.js         # JWT auth, bcrypt 12-round hashing, RBAC profiles
│   │   │   ├── initiativeController.js   # Parameterized SQL CRUD & auto AI dispatch
│   │   │   ├── workflowController.js     # Kanban pipeline aggregation
│   │   │   ├── intelligenceController.js # Cross-initiative semantic QA engine
│   │   │   ├── auditController.js        # Immutable WORM compliance logs
│   │   │   └── metricsController.js      # Executive KPI & risk index aggregation
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js         # JWT Bearer verification (8-hour session)
│   │   │   ├── roleMiddleware.js         # RBAC tenancy & stage transition gatekeeper
│   │   │   └── validateMiddleware.js     # Zod payload schema validation
│   │   ├── services/
│   │   │   ├── aiEvaluationService.js    # Gemini 2.5 Flash deterministic risk synthesis
│   │   │   └── auditService.js           # Immutable audit logging service
│   │   ├── validators/
│   │   │   └── schemas.js                # Zod schemas for all client and AI outputs
│   │   └── app.js                        # Express app with Helmet, CORS, Rate-Limiting
│   ├── db/
│   │   ├── schema.sql                    # Production PostgreSQL DDL
│   │   └── seed.js                       # Comprehensive enterprise seed dataset
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Badge, Button, Modal, Input, Select, RiskRadar, MetricCard
│   │   │   ├── initiatives/      # InitiativeCard, EvaluationMatrix
│   │   │   ├── workflow/         # WorkflowBoard, StageTransitionModal
│   │   │   ├── intelligence/     # IntelligenceChat
│   │   │   └── layout/           # AppLayout, Navbar, Sidebar
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Enterprise session & RBAC context
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── InitiativesPage.jsx
│   │   │   ├── InitiativeDetailPage.jsx
│   │   │   ├── NewInitiativePage.jsx
│   │   │   ├── WorkflowBoardPage.jsx
│   │   │   ├── IntelligencePage.jsx
│   │   │   └── AuditLogPage.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios with Bearer token & session interceptors
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## ⚡ Core Features

1. **Enterprise Identity & Hardened RBAC**:
   - Discrete roles: `Admin`, `Department_Lead`, and `Analyst`.
   - Salted passwords using `bcryptjs` with 12 salt rounds.
   - JWT session tokens in `Authorization: Bearer` headers (8-hour expiration).
   - Tenancy isolation: Analysts only draft in their department; Leads approve stage transitions impacting their department; Admins govern global state.

2. **Deterministic AI Risk & Impact Matrix (Gemini 2.5 Flash)**:
   - Server-side `@google/genai` integration with zero client-side key exposure.
   - Synthesizes 4 core risk vectors (1–100): Overall Risk, Financial Impact, Operational Friction, Compliance Risk.
   - Extracts Cross-Departmental Dependencies with friction level ratings (`Low`, `Medium`, `High`).
   - Identifies Operational Bottlenecks and classifies concrete mitigations (`P1`, `P2`, `P3`).
   - Emits definitive executive action verdicts (`Fast_Track_Approval`, `Standard_Review`, `Escalate_To_Legal`, `Require_Budget_Revision`, `Reject`).

3. **Interactive Departmental Workflow Board**:
   - Kanban-style stages: `Draft` ➔ `Under_Review` ➔ `Compliance_Pending` ➔ `Approved` / `Rejected` ➔ `Archived`.
   - Mandatory reviewer governance commentary captured on every stage transition.

4. **Cross-Departmental Knowledge Intelligence Engine**:
   - Multi-document contextual semantic QA engine (`/api/intelligence/query`).
   - Cites specific initiatives with clickable links.
   - Reports confidence ratings (`High`, `Medium`, `Low`) and dynamically generates actionable followup questions.

5. **Immutable Compliance Audit Trail**:
   - Write-Once / Read-Only (WORM) audit logs tracking every user action, stage transition, and AI evaluation run.
   - JSON metadata inspector for complete forensic transparency.

---

## 🔐 Default Demo Accounts

For instantaneous evaluation, the platform is pre-seeded with these enterprise profiles:

| Role | Name | Department | Email | Password |
|---|---|---|---|---|
| **Admin** | Dr. Elena Vance | Legal_Compliance | `admin@nexusai.corp` | `EnterpriseAdmin#2026!` |
| **Department Lead** | Marcus Sterling | Engineering | `marcus.lead@nexusai.corp` | `NexusLead#2026!` |
| **Department Lead** | Sophia Chen | Finance | `sophia.finance@nexusai.corp` | `NexusLead#2026!` |
| **Analyst** | Alex Rivera | Engineering | `alex.analyst@nexusai.corp` | `NexusAnalyst#2026!` |
| **Analyst** | David Kim | Operations | `david.ops@nexusai.corp` | `NexusAnalyst#2026!` |

*(The login page also provides one-click quick login buttons for these roles).*

---

## 🚀 Quickstart & Installation

### Prerequisites
- Node.js LTS (v18+)
- npm LTS (v9+)
- (Optional) PostgreSQL database (Neon, Supabase, Railway, or local). The backend automatically includes a zero-config persistent storage layer if a remote PostgreSQL instance is not yet connected.

### 1. Environment Configuration

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/nexus_enterprise_db?sslmode=disable
JWT_SECRET=nexus_enterprise_jwt_super_secret_signing_key_987654321_secure
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2. Install Dependencies

In backend directory:
```bash
cd backend
npm install
```

In frontend directory:
```bash
cd frontend
npm install
```

### 3. Run the Platform

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Starts Express server on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Starts Vite client on http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser.

