import { Router } from 'express';
import { projectController } from '../controllers/project.controller.js';

const router = Router({ mergeParams: true });
router.post('/', projectController.create);
router.get('/', projectController.findByWorkspace);
export default router;