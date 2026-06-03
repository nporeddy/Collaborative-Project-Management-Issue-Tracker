import type { Request, Response, NextFunction } from "express";
import { memberService } from "../services/member.service.js";

export const memberController = {
  async listByWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      if (typeof workspaceId !== "string") {
        return res.status(400).json({ error: "Invalid workspaceId" });
      }
      const members = await memberService.listByWorkspace(workspaceId);
      res.json(members);
    } catch (err) {
      next(err);
    }
  },
};
