import { prisma } from '../lib/prisma.js';

export const labelService = {
  create: (issueId: string, data: { name: string; color: string }) =>
    prisma.label.create({ data: { ...data, issueId } }),

  remove: (id: string) => prisma.label.delete({ where: { id } }),
};