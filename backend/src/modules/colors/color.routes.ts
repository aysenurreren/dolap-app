import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { colorWheelController, colorSchemeController } from './color.controller';

const router = Router();
router.use(authMiddleware);

router.get('/wheel', colorWheelController);
router.get('/schemes/:itemId', colorSchemeController);

export default router;