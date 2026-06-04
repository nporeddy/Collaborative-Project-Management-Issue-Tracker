import { Router } from 'express';
import { projectController } from '../controllers/project.controller.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router({ mergeParams: true });

router.get('/', requireRole('MEMBER'), projectController.findByWorkspace);
router.post('/', requireRole('ADMIN'), projectController.create);

export default router;