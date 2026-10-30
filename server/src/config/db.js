import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Priority loading: .env.supabase, .env, or root .env
const candidateEnvPaths = [
  path.resolve(__dirname, '../../.env.supabase'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env.supabase'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(process.cwd(), '.env.supabase'),
  path.resolve(process.cwd(), 'backend/.env.supabase'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(process.cwd(), 'server/.env.supabase'),
  path.resolve(process.cwd(), 'server/.env'),
  path.resolve(process.cwd(), '.env')
];

for (const p of candidateEnvPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
}
dotenv.config();

const { Pool } = pg;

let pool = null;
let isPostgresConnected = false;

// In-memory / file-persisted enterprise storage fallback if PostgreSQL server is not locally running
const FALLBACK_DB_FILE = path.join(__dirname, '..', '..', 'db', 'nexus_storage.json');

const memoryStore = {
  users: [],
  initiatives: [],
  ai_evaluations: [],
  workflow_actions: [],
  audit_logs: []
};

// Load fallback store from disk if exists
try {
  if (fs.existsSync(FALLBACK_DB_FILE)) {
    const raw = fs.readFileSync(FALLBACK_DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    Object.assign(memoryStore, parsed);
  }
} catch (err) {
  console.warn('[DB] Could not load persisted fallback DB file:', err.message);
}

function persistFallback() {
  try {
    const dir = path.dirname(FALLBACK_DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FALLBACK_DB_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Fallback save error:', err.message);
  }
}

/**
 * Lazily creates or returns the PostgreSQL connection pool
 */
export function getOrCreatePool() {
  if (pool) return pool;

  const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!databaseUrl) return null;

  try {
    const isSupabase = databaseUrl.includes('supabase.co') || databaseUrl.includes('supabase.com');
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: isSupabase
        ? { rejectUnauthorized: false }
        : (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
          ? false
          : { rejectUnauthorized: false }),
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20
    });
    return pool;
  } catch (e) {
    console.error('[DB] Failed to create pg.Pool:', e.message);
    return null;
  }
}

// Initial pool creation attempt
getOrCreatePool();

/**
 * Initializes database schemas and verifies connectivity
 */
export async function initializeDatabase() {
  const activePool = getOrCreatePool();
  const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

  if (activePool) {
    try {
      const client = await activePool.connect();
      console.log('✅ [DB] Connected successfully to PostgreSQL via pg.Pool.');
      isPostgresConnected = true;

      // Run schema migrations from schema.sql
      const schemaPath = path.join(__dirname, '..', '..', 'db', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        await client.query(schemaSql);
        console.log('✅ [DB] PostgreSQL schema verified and up-to-date.');
      }
      client.release();
      return true;
    } catch (err) {
      console.warn(`⚠️ [DB] PostgreSQL connection to database failed: ${err.message}`);
      console.log('⚡ [DB] Activating high-resilience embedded enterprise storage engine with full persistence.');
      isPostgresConnected = false;
    }
  } else {
    console.log('⚡ [DB] No DATABASE_URL or SUPABASE_DB_URL provided. Activating high-resilience embedded enterprise storage engine.');
  }
  return false;
}

/**
 * Parameterized query executor with strict SQL parameterization ($1, $2, ...)
 * Seamlessly routes to PostgreSQL pool if active, or executes against enterprise fallback store
 */
export async function query(text, params = []) {
  const activePool = getOrCreatePool();
  if (isPostgresConnected && activePool) {
    try {
      return await activePool.query(text, params);
    } catch (error) {
      console.error('[DB] PostgreSQL query error:', error.message, 'Query:', text);
      throw error;
    }
  }

  // Fallback SQL-like processor
  return executeFallbackQuery(text, params);
}

/**
 * Fallback query interpreter for parameterized queries
 */
function executeFallbackQuery(text, params = []) {
  const normalized = text.trim().replace(/\s+/g, ' ');
  const lower = normalized.toLowerCase();

  // 1. SELECT queries
  if (lower.startsWith('select')) {
    // A. Users table queries
    if (lower.includes('from users')) {
      if (lower.includes('count(*)')) {
        return { rows: [{ count: String(memoryStore.users.length) }], rowCount: 1 };
      }
      if (lower.includes('where email = $1')) {
        const user = memoryStore.users.find(u => u.email.toLowerCase() === (params[0] || '').toLowerCase());
        return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
      }
      if (lower.includes('where id = $1')) {
        const user = memoryStore.users.find(u => u.id === params[0]);
        return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
      }
      return { rows: [...memoryStore.users], rowCount: memoryStore.users.length };
    }

    // B. Initiatives queries
    if (lower.includes('from initiatives')) {
      if (lower.includes('count(*)')) {
        return { rows: [{ count: String(memoryStore.initiatives.length) }], rowCount: 1 };
      }

      let rows = [...memoryStore.initiatives];

      // Single initiative by ID
      if (lower.includes('where id = $1') || lower.includes('where i.id = $1')) {
        const target = rows.find(i => i.id === params[0]);
        if (!target) return { rows: [], rowCount: 0 };

        // Attach author name if joining
        const author = memoryStore.users.find(u => u.id === target.author_id);
        const evaluation = memoryStore.ai_evaluations.find(e => e.initiative_id === target.id);
        const item = {
          ...target,
          author_name: author ? author.full_name : 'Enterprise User',
          author_department: author ? author.department : target.department,
          evaluation: evaluation || null,
          overall_risk_score: evaluation ? evaluation.overall_risk_score : null,
          financial_impact_score: evaluation ? evaluation.financial_impact_score : null,
          operational_friction_score: evaluation ? evaluation.operational_friction_score : null,
          compliance_risk_score: evaluation ? evaluation.compliance_risk_score : null,
          executive_action_verdict: evaluation ? evaluation.executive_action_verdict : null,
          strategic_alignment_summary: evaluation ? evaluation.strategic_alignment_summary : null,
          cross_departmental_dependencies: evaluation ? evaluation.cross_departmental_dependencies : [],
          identified_bottlenecks: evaluation ? evaluation.identified_bottlenecks : [],
          recommended_mitigations: evaluation ? evaluation.recommended_mitigations : []
        };
        return { rows: [item], rowCount: 1 };
      }

      // Department filter
      if (lower.includes('department = $1') || lower.includes('department = $2')) {
        const deptParam = params.find(p => ['Finance', 'Engineering', 'Human_Resources', 'Legal_Compliance', 'Operations', 'Product_Strategy'].includes(p));
        if (deptParam) {
          rows = rows.filter(i => i.department === deptParam || (Array.isArray(i.impacted_departments) && i.impacted_departments.includes(deptParam)));
        }
      }

      // Stage filter
      if (lower.includes('current_stage = $') || lower.includes('stage = $')) {
        const stageParam = params.find(p => ['Draft', 'Under_Review', 'Compliance_Pending', 'Approved', 'Rejected', 'Archived'].includes(p));
        if (stageParam) {
          rows = rows.filter(i => i.current_stage === stageParam);
        }
      }

      // Attach authors and evaluations
      rows = rows.map(i => {
        const author = memoryStore.users.find(u => u.id === i.author_id);
        const evaluation = memoryStore.ai_evaluations.find(e => e.initiative_id === i.id);
        return {
          ...i,
          author_name: author ? author.full_name : 'Enterprise User',
          author_department: author ? author.department : i.department,
          evaluation: evaluation || null,
          evaluation_id: evaluation ? evaluation.id : null,
          overall_risk_score: evaluation ? evaluation.overall_risk_score : null,
          financial_impact_score: evaluation ? evaluation.financial_impact_score : null,
          operational_friction_score: evaluation ? evaluation.operational_friction_score : null,
          compliance_risk_score: evaluation ? evaluation.compliance_risk_score : null,
          executive_action_verdict: evaluation ? evaluation.executive_action_verdict : null,
          strategic_alignment_summary: evaluation ? evaluation.strategic_alignment_summary : null,
          cross_departmental_dependencies: evaluation ? evaluation.cross_departmental_dependencies : [],
          identified_bottlenecks: evaluation ? evaluation.identified_bottlenecks : [],
          recommended_mitigations: evaluation ? evaluation.recommended_mitigations : []
        };
      });

      // Sort descending by created_at
      rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return { rows, rowCount: rows.length };
    }

    // C. AI Evaluations queries
    if (lower.includes('from ai_evaluations')) {
      if (lower.includes('count(*)')) {
        return { rows: [{ count: String(memoryStore.ai_evaluations.length) }], rowCount: 1 };
      }
      if (lower.includes('where initiative_id = $1')) {
        const evalItem = memoryStore.ai_evaluations.find(e => e.initiative_id === params[0]);
        return { rows: evalItem ? [evalItem] : [], rowCount: evalItem ? 1 : 0 };
      }
      return { rows: [...memoryStore.ai_evaluations], rowCount: memoryStore.ai_evaluations.length };
    }

    // D. Workflow actions queries
    if (lower.includes('from workflow_actions')) {
      if (lower.includes('count(*)')) {
        return { rows: [{ count: String(memoryStore.workflow_actions.length) }], rowCount: 1 };
      }
      if (lower.includes('where initiative_id = $1')) {
        const actions = memoryStore.workflow_actions
          .filter(a => a.initiative_id === params[0])
          .map(a => {
            const reviewer = memoryStore.users.find(u => u.id === a.reviewer_id);
            return {
              ...a,
              reviewer_name: reviewer ? reviewer.full_name : 'Reviewer',
              reviewer_department: reviewer ? reviewer.department : 'Enterprise'
            };
          })
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return { rows: actions, rowCount: actions.length };
      }
      return { rows: [...memoryStore.workflow_actions], rowCount: memoryStore.workflow_actions.length };
    }

    // E. Audit logs queries
    if (lower.includes('from audit_logs')) {
      if (lower.includes('count(*)')) {
        return { rows: [{ count: String(memoryStore.audit_logs.length) }], rowCount: 1 };
      }
      const logs = memoryStore.audit_logs
        .map(l => {
          const actor = memoryStore.users.find(u => u.id === l.actor_id);
          return {
            ...l,
            actor_name: actor ? actor.full_name : 'System Agent',
            actor_role: actor ? actor.role : 'System'
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return { rows: logs, rowCount: logs.length };
    }
  }

  // 2. INSERT queries
  if (lower.startsWith('insert into')) {
    // Users
    if (lower.includes('insert into users')) {
      const existing = memoryStore.users.find(u => u.email.toLowerCase() === (params[0] || '').toLowerCase());
      if (existing) {
        return { rows: [existing], rowCount: 1 };
      }
      const newUser = {
        id: crypto.randomUUID(),
        email: params[0],
        password_hash: params[1],
        full_name: params[2],
        department: params[3],
        role: params[4],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      memoryStore.users.push(newUser);
      persistFallback();
      return { rows: [newUser], rowCount: 1 };
    }

    // Initiatives
    if (lower.includes('insert into initiatives')) {
      const newInit = {
        id: crypto.randomUUID(),
        author_id: params[0],
        title: params[1],
        department: params[2],
        initiative_type: params[3],
        budget: parseFloat(params[4]) || 0,
        target_date: params[5],
        impacted_departments: Array.isArray(params[6]) ? params[6] : JSON.parse(params[6] || '[]'),
        summary: params[7],
        raw_content: params[8],
        current_stage: params[9] || 'Draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      memoryStore.initiatives.push(newInit);
      persistFallback();
      return { rows: [newInit], rowCount: 1 };
    }

    // AI Evaluations
    if (lower.includes('insert into ai_evaluations')) {
      // Remove previous evaluation if re-evaluating
      const existingIdx = memoryStore.ai_evaluations.findIndex(e => e.initiative_id === params[0]);
      if (existingIdx !== -1) {
        memoryStore.ai_evaluations.splice(existingIdx, 1);
      }

      const parseJsonSafely = (val) => {
        if (typeof val === 'object' && val !== null) return val;
        try { return JSON.parse(val); } catch { return []; }
      };

      const newEval = {
        id: crypto.randomUUID(),
        initiative_id: params[0],
        overall_risk_score: parseInt(params[1], 10),
        financial_impact_score: parseInt(params[2], 10),
        operational_friction_score: parseInt(params[3], 10),
        compliance_risk_score: parseInt(params[4], 10),
        strategic_alignment_summary: params[5],
        cross_departmental_dependencies: parseJsonSafely(params[6]),
        identified_bottlenecks: parseJsonSafely(params[7]),
        recommended_mitigations: parseJsonSafely(params[8]),
        executive_action_verdict: params[9],
        model_version: params[10],
        raw_response: parseJsonSafely(params[11]),
        created_at: new Date().toISOString()
      };
      memoryStore.ai_evaluations.push(newEval);
      persistFallback();
      return { rows: [newEval], rowCount: 1 };
    }

    // Workflow actions
    if (lower.includes('insert into workflow_actions')) {
      const newAction = {
        id: crypto.randomUUID(),
        initiative_id: params[0],
        reviewer_id: params[1],
        from_stage: params[2],
        to_stage: params[3],
        notes: params[4] || '',
        created_at: new Date().toISOString()
      };
      memoryStore.workflow_actions.push(newAction);
      persistFallback();
      return { rows: [newAction], rowCount: 1 };
    }

    // Audit logs
    if (lower.includes('insert into audit_logs')) {
      const parseJsonSafely = (val) => {
        if (typeof val === 'object' && val !== null) return val;
        try { return JSON.parse(val); } catch { return {}; }
      };

      const newAudit = {
        id: crypto.randomUUID(),
        actor_id: params[0],
        action_type: params[1],
        entity_type: params[2],
        entity_id: params[3],
        metadata: parseJsonSafely(params[4]),
        ip_address: params[5] || '127.0.0.1',
        created_at: new Date().toISOString()
      };
      memoryStore.audit_logs.push(newAudit);
      persistFallback();
      return { rows: [newAudit], rowCount: 1 };
    }
  }

  // 3. UPDATE queries
  if (lower.startsWith('update')) {
    if (lower.includes('update initiatives set current_stage = $1')) {
      const stage = params[0];
      const id = params[1];
      const init = memoryStore.initiatives.find(i => i.id === id);
      if (init) {
        init.current_stage = stage;
        init.updated_at = new Date().toISOString();
        persistFallback();
        return { rows: [init], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }
  }

  return { rows: [], rowCount: 0 };
}

export default {
  query,
  initializeDatabase,
  getOrCreatePool,
  pool
};
