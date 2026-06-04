import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { commentService } from "../services/comment.service.js";
import { prisma } from "../lib/prisma.js";
import { requireStringParam } from "../lib/params.js";
import type { Role } from "../generated/prisma/client.js";

const createSchema = z.object({
  body: z.string().min(1).max(5000),
});

export const commentController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const issueId = requireStringParam(req, res, "issueId");
      if (!issueId) return;
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

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const issueId = requireStringParam(req, res, "issueId");
      if (!issueId) return;
      res.json(await commentService.listByIssue(issueId));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const commentId = requireStringParam(req, res, "id");
      if (!commentId) return;
      if (!req.user)
        return res.status(401).json({ error: "Not authenticated" });

      // Fetch the comment to check ownership
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { authorId: true },
      });
      if (!comment)
        return res.status(404).json({ error: "Comment not found" });

      // Author can always delete; Admins+ can delete anyone's
      const userRole = (req as Request & { userRole?: Role }).userRole;
      const isAuthor = comment.authorId === req.user.id;
      const isAdminPlus = userRole === "ADMIN" || userRole === "OWNER";

      if (!isAuthor && !isAdminPlus) {
        return res
          .status(403)
          .json({ error: "You can only delete your own comments" });
      }

      await commentService.remove(commentId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};