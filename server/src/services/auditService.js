import db from '../config/db.js';

export const logAuditEvent = async ({
  actorId,
  actionType,
  entityType,
  entityId,
  metadata = {},
  ipAddress = '127.0.0.1'
}) => {
  try {
    const metaString = typeof metadata === 'object' ? JSON.stringify(metadata) : metadata;
    const { rows } = await db.query(
      `INSERT INTO audit_logs (actor_id, action_type, entity_type, entity_id, metadata, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [actorId || null, actionType, entityType, entityId, metaString, ipAddress]
    );
    return rows[0];
  } catch (err) {
    console.error('[AuditService] Failed to record immutable audit log:', err.message);
    // Audit logging failure should not crash main transaction, but must be logged
    return null;
  }
};

