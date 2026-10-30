import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/metricsController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateJWT);

router.get('/dashboard', getDashboardMetrics);

export default router;

