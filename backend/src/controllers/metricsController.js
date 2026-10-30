import db from '../config/db.js';

export const getDashboardMetrics = async (req, res) => {
  try {
    const user = req.user;

    // Fetch initiatives with evaluation
    const sql = `
      SELECT 
        i.*,
        ae.overall_risk_score,
        ae.financial_impact_score,
        ae.operational_friction_score,
        ae.compliance_risk_score,
        ae.identified_bottlenecks,
        ae.executive_action_verdict
      FROM initiatives i
      LEFT JOIN ai_evaluations ae ON i.id = ae.initiative_id
    `;

    const { rows } = await db.query(sql);

    // Apply tenancy rules
    const visibleInitiatives = rows.filter(item => {
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

    const totalCount = visibleInitiatives.length;

    // Budget aggregation
    const totalBudget = visibleInitiatives.reduce((acc, curr) => acc + (parseFloat(curr.budget) || 0), 0);

    // Stage breakdown
    const stageCounts = {
      Draft: 0,
      Under_Review: 0,
      Compliance_Pending: 0,
      Approved: 0,
      Rejected: 0,
      Archived: 0
    };

    visibleInitiatives.forEach(item => {
      if (stageCounts[item.current_stage] !== undefined) {
        stageCounts[item.current_stage]++;
      }
    });

    const pendingApprovals = stageCounts.Under_Review + stageCounts.Compliance_Pending;

    // Risk aggregation
    const evaluatedItems = visibleInitiatives.filter(i => i.overall_risk_score !== null);
    const avgRiskScore = evaluatedItems.length > 0
      ? Math.round(evaluatedItems.reduce((acc, c) => acc + c.overall_risk_score, 0) / evaluatedItems.length)
      : 0;

    const avgFinancialScore = evaluatedItems.length > 0
      ? Math.round(evaluatedItems.reduce((acc, c) => acc + c.financial_impact_score, 0) / evaluatedItems.length)
      : 0;

    const avgFrictionScore = evaluatedItems.length > 0
      ? Math.round(evaluatedItems.reduce((acc, c) => acc + c.operational_friction_score, 0) / evaluatedItems.length)
      : 0;

    const avgComplianceScore = evaluatedItems.length > 0
      ? Math.round(evaluatedItems.reduce((acc, c) => acc + c.compliance_risk_score, 0) / evaluatedItems.length)
      : 0;

    const riskDistribution = {
      low: evaluatedItems.filter(i => i.overall_risk_score < 40).length,
      medium: evaluatedItems.filter(i => i.overall_risk_score >= 40 && i.overall_risk_score < 70).length,
      high: evaluatedItems.filter(i => i.overall_risk_score >= 70).length
    };

    // Cross-department bottlenecks
    const bottlenecksList = [];
    evaluatedItems.forEach(item => {
      let bList = item.identified_bottlenecks;
      if (typeof bList === 'string') {
        try { bList = JSON.parse(bList); } catch { bList = []; }
      }
      if (Array.isArray(bList)) {
        bList.forEach(b => {
          bottlenecksList.push({
            initiative_id: item.id,
            initiative_title: item.title,
            department: item.department,
            stage: b.stage,
            description: b.description
          });
        });
      }
    });

    // Departmental budget breakdown
    const departmentBudgets = {};
    visibleInitiatives.forEach(item => {
      const dept = item.department;
      departmentBudgets[dept] = (departmentBudgets[dept] || 0) + (parseFloat(item.budget) || 0);
    });

    // Recent initiatives
    const recentInitiatives = visibleInitiatives
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(item => ({
        id: item.id,
        title: item.title,
        department: item.department,
        budget: parseFloat(item.budget) || 0,
        current_stage: item.current_stage,
        overall_risk_score: item.overall_risk_score,
        executive_action_verdict: item.executive_action_verdict,
        created_at: item.created_at
      }));

    return res.json({
      success: true,
      data: {
        summary: {
          total_initiatives: totalCount,
          total_budget: totalBudget,
          pending_approvals: pendingApprovals,
          avg_risk_score: avgRiskScore,
          avg_financial_score: avgFinancialScore,
          avg_friction_score: avgFrictionScore,
          avg_compliance_score: avgComplianceScore,
          bottlenecks_count: bottlenecksList.length
        },
        stage_counts: stageCounts,
        risk_distribution: riskDistribution,
        department_budgets: departmentBudgets,
        bottlenecks: bottlenecksList.slice(0, 8),
        recent_initiatives: recentInitiatives
      }
    });
  } catch (error) {
    console.error('[MetricsController.getDashboardMetrics] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to aggregate dashboard metrics',
      error: error.message
    });
  }
};

