import { Router } from 'express';
import { commentController } from '../controllers/comment.controller.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.delete('/:id', requireRole('MEMBER'), commentController.remove);

export default router;