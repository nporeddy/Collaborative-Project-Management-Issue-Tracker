import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { projectService } from '../services/project.service.js';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  key: z.string().min(1).max(10),
});
const updateSchema = createSchema.partial();

export const projectController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      if (typeof workspaceId !== 'string') return res.status(400).json({ error: 'Invalid workspaceId' });
      const data = createSchema.parse(req.body);
      const project = await projectService.create(workspaceId, data);
      res.status(201).json(project);
    } catch (err) { next(err); }
  },

  async findByWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      if (typeof workspaceId !== 'string') return res.status(400).json({ error: 'Invalid workspaceId' });
      res.json(await projectService.findByWorkspace(workspaceId));
    } catch (err) { next(err); }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' });
      const project = await projectService.findById(id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      res.json(project);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' });
      const data = updateSchema.parse(req.body);
      const project = await projectService.update(id, data);
      res.json(project);
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' });
      await projectService.remove(id);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};