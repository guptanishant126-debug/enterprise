import { Router } from 'express';
import { queryKnowledge } from '../controllers/intelligenceController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { intelligenceQuerySchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticateJWT);

router.post('/query', validate(intelligenceQuerySchema), queryKnowledge);

export default router;

