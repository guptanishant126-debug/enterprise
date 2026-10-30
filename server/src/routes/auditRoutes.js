import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole(['Admin', 'Department_Lead']));

router.get('/', getAuditLogs);

export default router;

