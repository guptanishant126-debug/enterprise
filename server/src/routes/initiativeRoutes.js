import { Router } from 'express';
import {
  getInitiatives,
  createInitiative,
  getInitiativeById,
  updateStage,
  reEvaluateInitiative
} from '../controllers/initiativeController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { initiativeCreateSchema, stageUpdateSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getInitiatives);
router.post('/', validate(initiativeCreateSchema), createInitiative);
router.get('/:id', getInitiativeById);
router.patch('/:id/stage', validate(stageUpdateSchema), updateStage);
router.post('/:id/re-evaluate', reEvaluateInitiative);

export default router;

