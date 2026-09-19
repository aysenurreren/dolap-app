import { Router } from 'express';
import { register, verifyEmailController, loginController } from './auth.controller';

const router = Router();

router.post('/register', register);
router.post('/verify-email', verifyEmailController);
router.post('/login', loginController);

export default router;