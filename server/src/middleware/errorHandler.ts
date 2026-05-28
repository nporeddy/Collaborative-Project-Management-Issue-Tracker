import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // 1. Validation errors from Zod → 400 Bad Request
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.issues,
    });
  }

  // 2. Known Prisma errors → friendly messages
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2025 = record not found (e.g. updating/deleting something that doesn't exist)
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Resource not found' });
    }
    // P2002 = unique constraint violation (e.g. duplicate email)
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'A record with this value already exists' });
    }
  }

  // 3. Anything else → 500 Internal Server Error
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}