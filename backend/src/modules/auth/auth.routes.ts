import { Router } from 'express';
import { register, verifyEmailController } from './auth.controller';

const router = Router();

router.post('/register', register);
router.post('/verify-email', verifyEmailController);

export default router;