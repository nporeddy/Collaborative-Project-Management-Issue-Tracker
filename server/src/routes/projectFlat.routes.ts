import { Router } from 'express';
import { projectController } from '../controllers/project.controller.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/:projectId', requireRole('MEMBER'), projectController.findById);
router.patch('/:projectId', requireRole('ADMIN'), projectController.update);
router.delete('/:projectId', requireRole('ADMIN'), projectController.remove);

export default router;