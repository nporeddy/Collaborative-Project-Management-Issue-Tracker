import { Router } from 'express';
import { labelController } from '../controllers/label.controller.js';

const router = Router({ mergeParams: true });
router.post('/', labelController.create);
export default router;