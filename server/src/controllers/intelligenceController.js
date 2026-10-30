import db from '../config/db.js';
import { queryEnterpriseKnowledge } from '../services/aiEvaluationService.js';
import { logAuditEvent } from '../services/auditService.js';

export const queryKnowledge = async (req, res) => {
  try {
    const { query, department_filter } = req.body;
    const user = req.user;

    // Retrieve all initiatives and attached evaluations for multi-document context
    const sql = `
      SELECT 
        i.*,
        u.full_name as author_name,
        ae.overall_risk_score,
        ae.financial_impact_score,
        ae.operational_friction_score,
        ae.compliance_risk_score,
        ae.strategic_alignment_summary,
        ae.executive_action_verdict,
        ae.recommended_mitigations,
        ae.identified_bottlenecks
      FROM initiatives i
      LEFT JOIN users u ON i.author_id = u.id
      LEFT JOIN ai_evaluations ae ON i.id = ae.initiative_id
      ORDER BY i.created_at DESC
    `;

    const { rows } = await db.query(sql);

    const initiativesWithEvaluations = rows.map(r => ({
      ...r,
      evaluation: r.overall_risk_score !== null ? {
        overall_risk_score: r.overall_risk_score,
        financial_impact_score: r.financial_impact_score,
        operational_friction_score: r.operational_friction_score,
        compliance_risk_score: r.compliance_risk_score,
        strategic_alignment_summary: r.strategic_alignment_summary,
        executive_action_verdict: r.executive_action_verdict,
        recommended_mitigations: r.recommended_mitigations,
        identified_bottlenecks: r.identified_bottlenecks
      } : null
    }));

    // Invoke Gemini multi-document semantic reasoning
    const assistantResult = await queryEnterpriseKnowledge({
      userQuery: query,
      initiatives: initiativesWithEvaluations,
      departmentFilter: department_filter
    });

    // Immutable audit logging
    await logAuditEvent({
      actorId: user.id,
      actionType: 'KNOWLEDGE_QUERY_EXECUTED',
      entityType: 'IntelligenceQuery',
      entityId: user.id,
      metadata: {
        query_snippet: query.slice(0, 100),
        department_filter: department_filter || 'All',
        confidence_rating: assistantResult.confidence_rating,
        cited_count: assistantResult.cited_initiative_ids?.length || 0
      },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      data: assistantResult
    });
  } catch (error) {
    console.error('[IntelligenceController.queryKnowledge] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process enterprise intelligence query',
      error: error.message
    });
  }
};

