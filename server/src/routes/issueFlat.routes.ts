import { Router } from "express";
import { issueController } from "../controllers/issue.controller.js";

const router = Router();
router.get("/:id", issueController.findById);
router.patch("/:id", issueController.update);
router.delete("/:id", issueController.remove);
export default router;
