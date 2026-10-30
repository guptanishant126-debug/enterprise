import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Priority loading: .env.supabase, .env, or root .env
const candidateEnvPaths = [
  path.resolve(__dirname, '../../.env.supabase'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env.supabase'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(process.cwd(), '.env.supabase'),
  path.resolve(process.cwd(), '.env')
];

for (const p of candidateEnvPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
}
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.SUPABASE_SERVICE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  (supabaseAnonKey || supabaseServiceRoleKey)
);

// 1. Supabase Client with Anon Key (Client-level authentication & RLS scoped queries)
export const supabase = isSupabaseConfigured && (supabaseAnonKey || supabaseServiceRoleKey)
  ? createClient(supabaseUrl, supabaseAnonKey || supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

// 2. Supabase Admin Client with Service Role Key (Bypasses RLS for deterministic AI audits, evaluations & system logs)
export const supabaseAdmin = isSupabaseConfigured && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : supabase; // Fallback to anon client if service role not provided

/**
 * Health check & connectivity verification for Supabase integration
 */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured) {
    console.log('ℹ️ [Supabase] SUPABASE_URL / SUPABASE_ANON_KEY not fully populated in env. Running in resilient hybrid database mode.');
    return { connected: false, reason: 'Environment credentials pending' };
  }

  try {
    const client = supabaseAdmin || supabase;
    // Probe users or initiatives table
    const { data, error } = await client.from('initiatives').select('id').limit(1);

    if (error && error.code !== 'PGRST116') {
      console.warn(`⚠️ [Supabase] SDK probe notice: ${error.message}`);
      return { connected: false, error: error.message };
    }

    console.log('✅ [Supabase] SDK client successfully authenticated with Supabase Service URL & Keys.');
    return { connected: true };
  } catch (err) {
    console.warn(`⚠️ [Supabase] Connection check encountered error: ${err.message}`);
    return { connected: false, error: err.message };
  }
}

export default {
  supabase,
  supabaseAdmin,
  isSupabaseConfigured,
  testSupabaseConnection
};
