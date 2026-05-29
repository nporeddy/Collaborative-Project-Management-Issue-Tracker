import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { workspaceService } from "../services/workspace.service.js";

const createSchema = z.object({ name: z.string().min(1).max(100) });

export const workspaceController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSchema.parse(req.body);
      const workspace = await workspaceService.create(data);
      res.status(201).json(workspace);
    } catch (err) {
      next(err);
    }
  },

  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await workspaceService.findAll());
    } catch (err) {
      next(err);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid id" });
      }
      const workspace = await workspaceService.findById(id);
      if (!workspace)
        return res.status(404).json({ error: "Workspace not found" });
      res.json(workspace);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSchema.parse(req.body);
      const { id } = req.params;
      if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid id" });
      }
      const workspace = await workspaceService.update(id, data);
      res.json(workspace);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid id" });
      }
      await workspaceService.remove(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
