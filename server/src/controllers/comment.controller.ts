import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { commentService } from "../services/comment.service.js";

const createSchema = z.object({
  body: z.string().min(1).max(5000),
});

export const commentController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { issueId } = req.params;
      if (typeof issueId !== "string")
        return res.status(400).json({ error: "Invalid issueId" });
      if (!req.user)
        return res.status(401).json({ error: "Not authenticated" });

      const data = createSchema.parse(req.body);
      const comment = await commentService.create(issueId, {
        body: data.body,
        authorId: req.user.id, 
      });
      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  },

  async listByIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const { issueId } = req.params;
      if (typeof issueId !== "string")
        return res.status(400).json({ error: "Invalid issueId" });
      res.json(await commentService.listByIssue(issueId));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (typeof id !== "string")
        return res.status(400).json({ error: "Invalid id" });
      await commentService.remove(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
