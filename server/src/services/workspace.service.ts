import { prisma } from "../lib/prisma.js";

export const workspaceService = {
  create: (data: { name: string }) => prisma.workspace.create({ data }),

  findAll: () => prisma.workspace.findMany({ orderBy: { createdAt: "desc" } }),

  findById: (id: string) => prisma.workspace.findUnique({ where: { id } }),

  update: (id: string, data: { name: string }) =>
    prisma.workspace.update({ where: { id }, data }),

  remove: (id: string) => prisma.workspace.delete({ where: { id } }),
};
