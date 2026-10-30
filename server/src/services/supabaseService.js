import { supabase, supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import db from '../config/db.js';

/**
 * Enterprise Supabase Data Service
 * Utilizes the official @supabase/supabase-js SDK with service_role and anon keys,
 * seamlessly bridging with PostgreSQL connection pooling.
 */

export const supabaseService = {
  /**
   * Retrieves initiatives via Supabase Client
   */
  async getInitiatives(filters = {}) {
    if (isSupabaseConfigured && (supabaseAdmin || supabase)) {
      const client = supabaseAdmin || supabase;
      let query = client
        .from('initiatives')
        .select(`
          *,
          users:author_id (full_name, department, email),
          ai_evaluations (*)
        `)
        .order('created_at', { ascending: false });

      if (filters.department && filters.department !== 'All') {
        query = query.eq('department', filters.department);
      }
      if (filters.stage && filters.stage !== 'All') {
        query = query.eq('current_stage', filters.stage);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data.map(item => ({
          ...item,
          author_name: item.users?.full_name || 'Enterprise User',
          author_department: item.users?.department || item.department,
          evaluation: Array.isArray(item.ai_evaluations) ? item.ai_evaluations[0] : item.ai_evaluations
        }));
      }
    }

    // Default to parameterized SQL pool
    const { rows } = await db.query('SELECT * FROM initiatives ORDER BY created_at DESC');
    return rows;
  },

  /**
   * Inserts an initiative using Supabase SDK
   */
  async createInitiative(payload) {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('initiatives')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    }

    // Direct SQL fallback
    const { rows } = await db.query(
      `INSERT INTO initiatives (
        author_id, title, department, initiative_type, budget,
        target_date, impacted_departments, summary, raw_content, current_stage
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        payload.author_id,
        payload.title,
        payload.department,
        payload.initiative_type,
        payload.budget,
        payload.target_date,
        payload.impacted_departments,
        payload.summary,
        payload.raw_content,
        payload.current_stage || 'Draft'
      ]
    );
    return rows[0];
  },

  /**
   * Stores AI evaluation via Supabase SDK
   */
  async saveAIEvaluation(evalPayload) {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('ai_evaluations')
        .upsert([evalPayload], { onConflict: 'initiative_id' })
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    }

    // Fallback SQL query
    const { rows } = await db.query(
      `INSERT INTO ai_evaluations (
        initiative_id, overall_risk_score, financial_impact_score,
        operational_friction_score, compliance_risk_score, strategic_alignment_summary,
        cross_departmental_dependencies, identified_bottlenecks, recommended_mitigations,
        executive_action_verdict, model_version, raw_response
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        evalPayload.initiative_id,
        evalPayload.overall_risk_score,
        evalPayload.financial_impact_score,
        evalPayload.operational_friction_score,
        evalPayload.compliance_risk_score,
        evalPayload.strategic_alignment_summary,
        JSON.stringify(evalPayload.cross_departmental_dependencies),
        JSON.stringify(evalPayload.identified_bottlenecks),
        JSON.stringify(evalPayload.recommended_mitigations),
        evalPayload.executive_action_verdict,
        evalPayload.model_version,
        JSON.stringify(evalPayload.raw_response)
      ]
    );
    return rows[0];
  },

  /**
   * Records an immutable audit log using Supabase Service Role client
   */
  async recordAuditLog({ actorId, actionType, entityType, entityId, metadata, ipAddress }) {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('audit_logs')
        .insert([{
          actor_id: actorId || null,
          action_type: actionType,
          entity_type: entityType,
          entity_id: entityId,
          metadata: metadata || {},
          ip_address: ipAddress || '127.0.0.1'
        }])
        .select()
        .single();

      if (!error && data) return data;
    }

    // Direct SQL fallback
    const { rows } = await db.query(
      `INSERT INTO audit_logs (actor_id, action_type, entity_type, entity_id, metadata, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [actorId || null, actionType, entityType, entityId, JSON.stringify(metadata || {}), ipAddress || '127.0.0.1']
    );
    return rows[0];
  }
};

export default supabaseService;
