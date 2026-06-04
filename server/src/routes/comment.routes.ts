import { Router } from 'express';
import { commentController } from '../controllers/comment.controller.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router({ mergeParams: true });

router.get('/', requireRole('MEMBER'), commentController.list);
router.post('/', requireRole('MEMBER'), commentController.create);

export default router;