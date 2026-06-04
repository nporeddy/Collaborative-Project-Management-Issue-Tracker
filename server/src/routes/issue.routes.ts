import { Router } from 'express';
import { issueController } from '../controllers/issue.controller.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router({ mergeParams: true });

router.get('/', requireRole('MEMBER'), issueController.list);
router.post('/', requireRole('MEMBER'), issueController.create);

export default router;