import { prisma } from '../lib/prisma.js';

export const commentService = {
  create: (issueId: string, data: { body: string; authorId: string }) =>
    prisma.comment.create({ data: { ...data, issueId } }),

  listByIssue: (issueId: string) =>
    prisma.comment.findMany({
      where: { issueId },
      orderBy: { createdAt: 'asc' },
      include: { author: true },
    }),

  remove: (id: string) => prisma.comment.delete({ where: { id } }),
};