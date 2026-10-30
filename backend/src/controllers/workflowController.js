import db from '../config/db.js';

export const getWorkflowBoard = async (req, res) => {
  try {
    const user = req.user;
    const { department } = req.query;

    const sql = `
      SELECT 
        i.*,
        u.full_name as author_name,
        u.department as author_department,
        ae.overall_risk_score,
        ae.financial_impact_score,
        ae.operational_friction_score,
        ae.compliance_risk_score,
        ae.executive_action_verdict
      FROM initiatives i
      LEFT JOIN users u ON i.author_id = u.id
      LEFT JOIN ai_evaluations ae ON i.id = ae.initiative_id
      ORDER BY i.created_at DESC
    `;

    const { rows } = await db.query(sql);

    // Apply tenancy and RBAC
    let accessible = rows.filter(item => {
      if (user.role === 'Admin') return true;
      if (['Approved', 'Archived'].includes(item.current_stage)) return true;
      if (user.role === 'Department_Lead') {
        const isAuthorDept = item.department === user.department;
        const isImpacted = Array.isArray(item.impacted_departments) &&
          item.impacted_departments.includes(user.department);
        return isAuthorDept || isImpacted;
      }
      if (user.role === 'Analyst') {
        return item.author_id === user.id && item.department === user.department;
      }
      return false;
    });

    if (department && department !== 'All') {
      accessible = accessible.filter(item =>
        item.department === department ||
        (Array.isArray(item.impacted_departments) && item.impacted_departments.includes(department))
      );
    }

    // Define kanban pipeline stages
    const stages = ['Draft', 'Under_Review', 'Compliance_Pending', 'Approved', 'Rejected', 'Archived'];
    const columns = {};

    stages.forEach(stage => {
      columns[stage] = [];
    });

    accessible.forEach(item => {
      const card = {
        id: item.id,
        title: item.title,
        department: item.department,
        initiative_type: item.initiative_type,
        budget: parseFloat(item.budget) || 0,
        target_date: item.target_date,
        impacted_departments: item.impacted_departments,
        summary: item.summary,
        current_stage: item.current_stage,
        created_at: item.created_at,
        author_name: item.author_name || 'Enterprise User',
        evaluation: item.overall_risk_score !== null ? {
          overall_risk_score: item.overall_risk_score,
          financial_impact_score: item.financial_impact_score,
          operational_friction_score: item.operational_friction_score,
          compliance_risk_score: item.compliance_risk_score,
          executive_action_verdict: item.executive_action_verdict
        } : null
      };

      if (columns[item.current_stage]) {
        columns[item.current_stage].push(card);
      } else {
        columns['Draft'].push(card);
      }
    });

    return res.json({
      success: true,
      data: {
        stages,
        columns,
        total_initiatives: accessible.length
      }
    });
  } catch (error) {
    console.error('[WorkflowController.getWorkflowBoard] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve workflow pipeline board',
      error: error.message
    });
  }
};

