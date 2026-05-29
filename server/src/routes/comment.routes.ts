import { Router } from "express";
import { commentController } from "../controllers/comment.controller.js";

const router = Router({ mergeParams: true });
router.post("/", commentController.create);
router.get("/", commentController.listByIssue);
export default router;
