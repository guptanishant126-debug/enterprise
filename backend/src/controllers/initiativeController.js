import db from '../config/db.js';
import { evaluateInitiativeWithAI } from '../services/aiEvaluationService.js';
import { logAuditEvent } from '../services/auditService.js';
import { checkStageTransitionPermission } from '../middleware/roleMiddleware.js';

export const getInitiatives = async (req, res) => {
  try {
    const { department, stage, search } = req.query;
    const user = req.user;

    // Fetch all initiatives with author information and latest evaluation
    const sql = `
      SELECT 
        i.*,
        u.full_name as author_name,
        u.department as author_department,
        ae.id as evaluation_id,
        ae.overall_risk_score,
        ae.financial_impact_score,
        ae.operational_friction_score,
        ae.compliance_risk_score,
        ae.executive_action_verdict,
        ae.strategic_alignment_summary,
        ae.cross_departmental_dependencies,
        ae.identified_bottlenecks,
        ae.recommended_mitigations
      FROM initiatives i
      LEFT JOIN users u ON i.author_id = u.id
      LEFT JOIN ai_evaluations ae ON i.id = ae.initiative_id
      ORDER BY i.created_at DESC
    `;

    const { rows } = await db.query(sql);

    // Apply tenancy and RBAC data isolation rules
    let filtered = rows.filter(item => {
      // Admin sees everything
      if (user.role === 'Admin') return true;

      // Approved or Archived initiatives are publicly viewable across the enterprise
      if (['Approved', 'Archived'].includes(item.current_stage)) return true;

      // Department Lead can view initiatives impacting or authored by their department
      if (user.role === 'Department_Lead') {
        const isAuthorDept = item.department === user.department;
        const isImpacted = Array.isArray(item.impacted_departments) &&
          item.impacted_departments.includes(user.department);
        return isAuthorDept || isImpacted;
      }

      // Analyst: can view approved items or items authored by themselves within their own department
      if (user.role === 'Analyst') {
        return item.author_id === user.id && item.department === user.department;
      }

      return false;
    });

    // Query filter: department
    if (department && department !== 'All') {
      filtered = filtered.filter(item =>
        item.department === department ||
        (Array.isArray(item.impacted_departments) && item.impacted_departments.includes(department))
      );
    }

    // Query filter: stage
    if (stage && stage !== 'All') {
      filtered = filtered.filter(item => item.current_stage === stage);
    }

    // Query filter: search term
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.initiative_type.toLowerCase().includes(q)
      );
    }

    // Format output with evaluation object
    const result = filtered.map(item => ({
      id: item.id,
      author_id: item.author_id,
      author_name: item.author_name || 'Enterprise User',
      author_department: item.author_department || item.department,
      title: item.title,
      department: item.department,
      initiative_type: item.initiative_type,
      budget: parseFloat(item.budget) || 0,
      target_date: item.target_date,
      impacted_departments: item.impacted_departments,
      summary: item.summary,
      raw_content: item.raw_content,
      current_stage: item.current_stage,
      created_at: item.created_at,
      updated_at: item.updated_at,
      evaluation: item.evaluation_id ? {
        id: item.evaluation_id,
        overall_risk_score: item.overall_risk_score,
        financial_impact_score: item.financial_impact_score,
        operational_friction_score: item.operational_friction_score,
        compliance_risk_score: item.compliance_risk_score,
        executive_action_verdict: item.executive_action_verdict,
        strategic_alignment_summary: item.strategic_alignment_summary,
        cross_departmental_dependencies: item.cross_departmental_dependencies,
        identified_bottlenecks: item.identified_bottlenecks,
        recommended_mitigations: item.recommended_mitigations
      } : null
    }));

    return res.json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('[InitiativeController.getInitiatives] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve enterprise initiatives',
      error: error.message
    });
  }
};

export const createInitiative = async (req, res) => {
  try {
    const {
      title,
      department,
      initiative_type,
      budget,
      target_date,
      impacted_departments,
      summary,
      raw_content
    } = req.body;

    const user = req.user;

    // Enforce department boundary for Analysts
    if (user.role === 'Analyst' && department !== user.department) {
      return res.status(403).json({
        success: false,
        message: `Analysts are restricted to drafting initiatives for their designated department (${user.department}).`
      });
    }

    // Insert initiative into database
    const insertSql = `
      INSERT INTO initiatives (
        author_id, title, department, initiative_type, budget,
        target_date, impacted_departments, summary, raw_content, current_stage
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const { rows } = await db.query(insertSql, [
      user.id,
      title,
      department,
      initiative_type,
      budget,
      target_date,
      impacted_departments,
      summary,
      raw_content,
      'Draft'
    ]);

    const initiative = rows[0];

    // Log creation audit event
    await logAuditEvent({
      actorId: user.id,
      actionType: 'INITIATIVE_CREATED',
      entityType: 'Initiative',
      entityId: initiative.id,
      metadata: {
        title: initiative.title,
        department: initiative.department,
        budget: initiative.budget
      },
      ipAddress: req.ip
    });

    // Automatically dispatch AI evaluation pipeline
    let evaluation = null;
    try {
      evaluation = await evaluateInitiativeWithAI(initiative);

      await logAuditEvent({
        actorId: null, // System Agent
        actionType: 'AI_EVALUATION_EXECUTED',
        entityType: 'Initiative',
        entityId: initiative.id,
        metadata: {
          overall_risk_score: evaluation.overall_risk_score,
          executive_action_verdict: evaluation.executive_action_verdict
        },
        ipAddress: req.ip
      });
    } catch (aiErr) {
      console.error('[InitiativeController.createInitiative] AI Evaluation error:', aiErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Initiative submitted and evaluated successfully by NexusAI Engine',
      data: {
        ...initiative,
        author_name: user.full_name,
        author_department: user.department,
        evaluation
      }
    });
  } catch (error) {
    console.error('[InitiativeController.createInitiative] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create initiative',
      error: error.message
    });
  }
};

export const getInitiativeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch initiative details with author info
    const initRes = await db.query(`
      SELECT i.*, u.full_name as author_name, u.email as author_email, u.department as author_department
      FROM initiatives i
      LEFT JOIN users u ON i.author_id = u.id
      WHERE i.id = $1
    `, [id]);

    if (initRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Enterprise initiative not found'
      });
    }

    const initiative = initRes.rows[0];

    // Fetch AI Evaluation
    const evalRes = await db.query(
      'SELECT * FROM ai_evaluations WHERE initiative_id = $1',
      [id]
    );

    // Fetch Workflow History
    const actionsRes = await db.query(`
      SELECT wa.*, u.full_name as reviewer_name, u.department as reviewer_department, u.role as reviewer_role
      FROM workflow_actions wa
      LEFT JOIN users u ON wa.reviewer_id = u.id
      WHERE wa.initiative_id = $1
      ORDER BY wa.created_at DESC
    `, [id]);

    return res.json({
      success: true,
      data: {
        ...initiative,
        evaluation: evalRes.rows[0] || null,
        workflow_history: actionsRes.rows
      }
    });
  } catch (error) {
    console.error('[InitiativeController.getInitiativeById] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch initiative details',
      error: error.message
    });
  }
};

export const updateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { to_stage, notes } = req.body;
    const user = req.user;

    // Fetch existing initiative
    const { rows } = await db.query('SELECT * FROM initiatives WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Initiative not found'
      });
    }

    const initiative = rows[0];
    const from_stage = initiative.current_stage;

    // Verify role permissions for stage transition
    const permission = checkStageTransitionPermission(user, initiative);
    if (!permission.allowed) {
      return res.status(403).json({
        success: false,
        message: permission.reason
      });
    }

    // Update initiative stage
    const updateRes = await db.query(
      'UPDATE initiatives SET current_stage = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [to_stage, id]
    );

    // Record immutable workflow action
    const actionRes = await db.query(
      `INSERT INTO workflow_actions (initiative_id, reviewer_id, from_stage, to_stage, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, user.id, from_stage, to_stage, notes || '']
    );

    // Log governance audit event
    await logAuditEvent({
      actorId: user.id,
      actionType: 'WORKFLOW_STAGE_TRANSITIONED',
      entityType: 'Initiative',
      entityId: id,
      metadata: {
        from_stage,
        to_stage,
        reviewer_name: user.full_name,
        reviewer_department: user.department,
        notes: notes || null
      },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: `Stage transitioned from ${from_stage} to ${to_stage}`,
      data: {
        initiative: updateRes.rows[0],
        action: actionRes.rows[0]
      }
    });
  } catch (error) {
    console.error('[InitiativeController.updateStage] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to transition workflow stage',
      error: error.message
    });
  }
};

export const reEvaluateInitiative = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // RBAC: Re-evaluation allowed by Department_Lead or Admin
    if (!['Admin', 'Department_Lead'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Only Department Leads and Admins can trigger AI re-evaluations.'
      });
    }

    const { rows } = await db.query('SELECT * FROM initiatives WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Initiative not found'
      });
    }

    const initiative = rows[0];

    // Trigger AI Evaluation Service
    const evaluation = await evaluateInitiativeWithAI(initiative);

    // Audit log
    await logAuditEvent({
      actorId: user.id,
      actionType: 'AI_EVALUATION_REFRESHED',
      entityType: 'Initiative',
      entityId: id,
      metadata: {
        requested_by: user.full_name,
        overall_risk_score: evaluation.overall_risk_score,
        verdict: evaluation.executive_action_verdict
      },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Initiative re-evaluated with Gemini AI Engine',
      data: evaluation
    });
  } catch (error) {
    console.error('[InitiativeController.reEvaluateInitiative] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to re-evaluate initiative',
      error: error.message
    });
  }
};

