import { Router } from "express";
import { commentController } from "../controllers/comment.controller.js";

const router = Router();
router.delete("/:id", commentController.remove);
export default router;
