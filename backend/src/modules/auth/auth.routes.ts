import { Router } from 'express';
import { register, verifyEmailController, loginController } from './auth.controller';
import { refreshController } from './auth.controller';
import { logoutController } from './auth.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { meController } from './auth.controller';

const router = Router();

router.post('/register', register);
router.post('/verify-email', verifyEmailController);
router.post('/login', loginController);
router.post('/refresh', refreshController);
router.post('/logout', logoutController);
router.get('/me', authMiddleware, meController);

export default router;