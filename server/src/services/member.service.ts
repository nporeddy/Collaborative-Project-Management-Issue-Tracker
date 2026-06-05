import { prisma } from "../lib/prisma.js";
import type { Role } from "../generated/prisma/client.js";

export const memberService = {
  async listByWorkspace(workspaceId: string) {
    return prisma.membership.findMany({
      where: { workspaceId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { user: { name: "asc" } },
    });
  },

  async isMember(userId: string, workspaceId: string): Promise<boolean> {
    const found = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    return !!found;
  },

  async getRole(userId: string, workspaceId: string): Promise<Role | null> {
    const m = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
      select: { role: true },
    });
    return m?.role ?? null;
  },

  async addByEmail(workspaceId: string, email: string, role: Role = "MEMBER") {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("USER_NOT_FOUND");

    const existing = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId } },
    });
    if (existing) throw new Error("ALREADY_MEMBER");

    return prisma.membership.create({
      data: { userId: user.id, workspaceId, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  },

  async remove(workspaceId: string, userId: string) {
    const m = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!m) throw new Error("NOT_MEMBER");
    if (m.role === "OWNER") throw new Error("CANNOT_REMOVE_OWNER");

    await prisma.membership.delete({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
  },

  async updateRole(workspaceId: string, userId: string, role: Role) {
    const m = await prisma.membership.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!m) throw new Error("NOT_MEMBER");
    if (m.role === "OWNER") throw new Error("CANNOT_CHANGE_OWNER");

    return prisma.membership.update({
      where: { userId_workspaceId: { userId, workspaceId } },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  },
  async listMyRolesAcross(userId: string) {
    const memberships = await prisma.membership.findMany({
      where: { userId },
      select: { workspaceId: true, role: true },
    });
    const map: Record<string, "OWNER" | "ADMIN" | "MEMBER"> = {};
    for (const m of memberships) {
      map[m.workspaceId] = m.role;
    }
    return map;
  },
};
