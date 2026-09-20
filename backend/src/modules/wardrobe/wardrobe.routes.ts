import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import {
  requestUploadUrlController,
  confirmUploadController,
  listClothingItemsController,
  getClothingItemController,
  updateClothingItemController,
  deleteClothingItemController,
} from './wardrobe.controller';

const router = Router();

router.use(authMiddleware);

router.post('/upload-url', requestUploadUrlController);
router.post('/', confirmUploadController);
router.get('/', listClothingItemsController);
router.get('/:id', getClothingItemController);
router.patch('/:id', updateClothingItemController);
router.delete('/:id', deleteClothingItemController);

export default router;