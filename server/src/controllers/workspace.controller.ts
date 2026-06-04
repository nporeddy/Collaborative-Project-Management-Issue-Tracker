import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { workspaceService } from "../services/workspace.service.js";
import { requireStringParam } from "../lib/params.js";

const createSchema = z.object({ name: z.string().min(1).max(100) });

export const workspaceController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user)
        return res.status(401).json({ error: "Not authenticated" });
      const data = createSchema.parse(req.body);
      const workspace = await workspaceService.create(req.user.id, data);
      res.status(201).json(workspace);
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user)
        return res.status(401).json({ error: "Not authenticated" });
      const workspaces = await workspaceService.listForUser(req.user.id);
      res.json(workspaces);
    } catch (err) {
      next(err);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = requireStringParam(req, res, "workspaceId");
      if (!workspaceId) return;
      const workspace = await workspaceService.findById(workspaceId);
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
      const workspaceId = requireStringParam(req, res, "workspaceId");
      if (!workspaceId) return;
      const workspace = await workspaceService.update(workspaceId, data);
      res.json(workspace);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = requireStringParam(req, res, "workspaceId");
      if (!workspaceId) return;
      await workspaceService.remove(workspaceId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};