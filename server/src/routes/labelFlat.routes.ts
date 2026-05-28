import { Router } from 'express';
import { labelController } from '../controllers/label.controller.js';

const router = Router();
router.delete('/:id', labelController.remove);
export default router;