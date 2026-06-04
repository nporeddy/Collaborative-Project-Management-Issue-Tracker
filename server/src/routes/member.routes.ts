import { Router } from 'express';
import { memberController } from '../controllers/member.controller.js';

const router = Router({ mergeParams: true });

router.get('/', memberController.listByWorkspace);
router.post('/', memberController.add);
router.delete('/:userId', memberController.remove);
router.patch('/:userId', memberController.updateRole);

export default router;