import { Router } from "express";
import { workspaceController } from "../controllers/workspace.controller.js";

const router = Router();

router.post("/", workspaceController.create);
router.get("/", workspaceController.findAll);
router.get("/:id", workspaceController.findById);
router.put("/:id", workspaceController.update);
router.delete("/:id", workspaceController.remove);

export default router;
