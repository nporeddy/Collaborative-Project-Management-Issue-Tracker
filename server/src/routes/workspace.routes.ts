import { Router } from 'express';
import { workspaceController } from '../controllers/workspace.controller.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/', workspaceController.list);
router.post('/', workspaceController.create);

router.get('/:workspaceId', requireRole('MEMBER'), workspaceController.findById);
router.patch('/:workspaceId', requireRole('ADMIN'), workspaceController.update);
router.delete('/:workspaceId', requireRole('OWNER'), workspaceController.remove);

export default router;