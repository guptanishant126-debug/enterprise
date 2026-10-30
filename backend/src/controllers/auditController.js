import db from '../config/db.js';

export const getAuditLogs = async (req, res) => {
  try {
    const user = req.user;

    // RBAC: Restricted to Admin and Department_Lead
    if (!['Admin', 'Department_Lead'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access restricted: Compliance audit log requires Department_Lead or Admin role.'
      });
    }

    const { page = 1, limit = 50, action_type, entity_type } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const sql = `
      SELECT 
        al.*,
        u.full_name as actor_name,
        u.department as actor_department,
        u.role as actor_role
      FROM audit_logs al
      LEFT JOIN users u ON al.actor_id = u.id
      ORDER BY al.created_at DESC
    `;

    const { rows } = await db.query(sql);

    let filtered = rows;
    if (action_type) {
      filtered = filtered.filter(l => l.action_type === action_type);
    }
    if (entity_type) {
      filtered = filtered.filter(l => l.entity_type === entity_type);
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limitNum);

    return res.json({
      success: true,
      data: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('[AuditController.getAuditLogs] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve immutable audit logs',
      error: error.message
    });
  }
};

