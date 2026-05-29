import { Router } from "express";
import { issueController } from "../controllers/issue.controller.js";

const router = Router({ mergeParams: true });
router.post("/", issueController.create);
router.get("/", issueController.list);
export default router;
