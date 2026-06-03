import { Router } from 'express';
import { memberController } from '../controllers/member.controller.js';

const router = Router({ mergeParams: true });
router.get('/', memberController.listByWorkspace);
export default router;