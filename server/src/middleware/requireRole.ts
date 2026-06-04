import type { Request, Response, NextFunction } from "express";
import type { Role } from "../generated/prisma/client.js";
import { memberService } from "../services/member.service.js";
import { prisma } from "../lib/prisma.js";
import { getStringParam } from "../lib/params.js";

const ROLE_HIERARCHY: Record<Role, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

async function resolveWorkspaceId(req: Request): Promise<string | null> {
  const directWorkspaceId = getStringParam(req, "workspaceId");
  if (directWorkspaceId) return directWorkspaceId;

  const projectId = getStringParam(req, "projectId");
  if (projectId) {
    const p = await prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true },
    });
    return p?.workspaceId ?? null;
  }

  const id = getStringParam(req, "id");
  if (id && req.baseUrl.endsWith("/issues")) {
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: { project: { select: { workspaceId: true } } },
    });
    return issue?.project.workspaceId ?? null;
  }

  if (id && req.baseUrl.endsWith("/comments")) {
    const c = await prisma.comment.findUnique({
      where: { id },
      include: {
        issue: { include: { project: { select: { workspaceId: true } } } },
      },
    });
    return c?.issue.project.workspaceId ?? null;
  }

  return null;
}

export function requireRole(minRole: Role) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    const workspaceId = await resolveWorkspaceId(req);
    if (!workspaceId)
      return res.status(404).json({ error: "Workspace context not found" });

    const role = await memberService.getRole(req.user.id, workspaceId);
    if (!role)
      return res
        .status(403)
        .json({ error: "You are not a member of this workspace" });

    if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[minRole]) {
      return res.status(403).json({
        error: `Requires role ${minRole} or higher (you are ${role})`,
      });
    }

    (req as Request & { userRole?: Role }).userRole = role;
    next();
  };
}
