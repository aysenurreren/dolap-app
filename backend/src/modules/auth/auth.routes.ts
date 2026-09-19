import { Router } from 'express';
import { register, verifyEmailController, loginController } from './auth.controller';
import { refreshController } from './auth.controller';

const router = Router();

router.post('/register', register);
router.post('/verify-email', verifyEmailController);
router.post('/login', loginController);
router.post('/refresh', refreshController);

export default router;