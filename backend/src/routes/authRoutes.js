import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { registerSchema, loginSchema } from '../validators/schemas.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticateJWT, getMe);

export default router;

