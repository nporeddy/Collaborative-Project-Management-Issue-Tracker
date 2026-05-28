import { prisma } from '../lib/prisma.js';

export const projectService = {
  create: (workspaceId: string, data: { name: string; key: string }) =>
    prisma.project.create({ data: { ...data, workspaceId } }),

  findByWorkspace: (workspaceId: string) =>
    prisma.project.findMany({ where: { workspaceId }, orderBy: { createdAt: 'desc' } }),

  findById: (id: string) =>
    prisma.project.findUnique({ where: { id } }),

  update: (id: string, data: { name?: string; key?: string }) =>
    prisma.project.update({ where: { id }, data }),

  remove: (id: string) =>
    prisma.project.delete({ where: { id } }),
};