import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { labelService } from '../services/label.service.js';

const createSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().min(1).max(20),
});

export const labelController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { issueId } = req.params;
      if (typeof issueId !== 'string') return res.status(400).json({ error: 'Invalid issueId' });
      const data = createSchema.parse(req.body);
      const label = await labelService.create(issueId, data);
      res.status(201).json(label);
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' });
      await labelService.remove(id);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};