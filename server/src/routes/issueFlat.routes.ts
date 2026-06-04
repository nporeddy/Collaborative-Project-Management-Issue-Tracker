import { Router } from 'express';
import { issueController } from '../controllers/issue.controller.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/:id', requireRole('MEMBER'), issueController.findById);
router.patch('/:id', requireRole('MEMBER'), issueController.update);
router.delete('/:id', requireRole('ADMIN'), issueController.remove);

export default router;