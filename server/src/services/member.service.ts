import { prisma } from "../lib/prisma.js";
import type { Role } from "../generated/prisma/client.js";

export const memberService = {
  async listByWorkspace(workspaceId: string) {
    return prisma.membership.findMany({
      where: { workspaceId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { user: { name: "asc" } },
    });
  },

  async isMember(userId: string, workspaceId: string): Promise<boolean> {
    const found = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });
    return !!found;
  },

  async add(userId: string, workspaceId: string, role: Role = "MEMBER") {
    return prisma.membership.create({
      data: { userId, workspaceId, role },
    });
  },
};
