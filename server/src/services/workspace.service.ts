import { prisma } from "../lib/prisma.js";

export const workspaceService = {
  async create(userId: string, data: { name: string }) {
    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({ data });
      await tx.membership.create({
        data: {
          userId,
          workspaceId: workspace.id,
          role: "OWNER",
        },
      });
      return workspace;
    });
  },

  listForUser: (userId: string) =>
    prisma.workspace.findMany({
      where: {
        memberships: {
          some: { userId },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

  findById: (id: string) => prisma.workspace.findUnique({ where: { id } }),

  update: (id: string, data: { name: string }) =>
    prisma.workspace.update({ where: { id }, data }),

  remove: (id: string) => prisma.workspace.delete({ where: { id } }),
};