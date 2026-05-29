import { Router } from "express";
import { projectController } from "../controllers/project.controller.js";

const router = Router();
router.get("/:id", projectController.findById);
router.put("/:id", projectController.update);
router.delete("/:id", projectController.remove);
export default router;
