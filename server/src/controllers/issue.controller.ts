import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { issueService } from "../services/issue.service.js";

const statusEnum = z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]);
const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const typeEnum = z.enum(['STORY', 'BUG', 'TASK']);
const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  priority: priorityEnum.optional(),
  type: typeEnum.optional(),        
  assigneeId: z.string().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  type: typeEnum.optional(),
  assigneeId: z.string().optional(),
});

export const issueController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      if (typeof projectId !== "string")
        return res.status(400).json({ error: "Invalid projectId" });
      const data = createSchema.parse(req.body);
      const issue = await issueService.create(projectId, data);
      res.status(201).json(issue);
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      if (typeof projectId !== "string")
        return res.status(400).json({ error: "Invalid projectId" });

      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const status = req.query.status
        ? statusEnum.parse(req.query.status)
        : undefined;
      const assigneeId =
        typeof req.query.assigneeId === "string"
          ? req.query.assigneeId
          : undefined;

      const result = await issueService.list({
        projectId,
        status,
        assigneeId,
        page,
        limit,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (typeof id !== "string")
        return res.status(400).json({ error: "Invalid id" });
      const issue = await issueService.findById(id);
      if (!issue) return res.status(404).json({ error: "Issue not found" });
      res.json(issue);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (typeof id !== "string")
        return res.status(400).json({ error: "Invalid id" });
      const data = updateSchema.parse(req.body);
      const issue = await issueService.update(id, data);
      res.json(issue);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (typeof id !== "string")
        return res.status(400).json({ error: "Invalid id" });
      await issueService.remove(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
