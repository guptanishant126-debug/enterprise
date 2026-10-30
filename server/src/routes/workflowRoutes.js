import { Router } from 'express';
import { getWorkflowBoard } from '../controllers/workflowController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateJWT);

router.get('/board', getWorkflowBoard);

export default router;

