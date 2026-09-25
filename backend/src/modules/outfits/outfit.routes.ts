import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { suggestOutfitsController, saveOutfitController, listOutfitsController } from './outfit.controller';

const router = Router();
router.use(authMiddleware);

router.get('/suggestions', suggestOutfitsController);
router.post('/', saveOutfitController);
router.get('/', listOutfitsController);

export default router;