import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { memberService } from "../services/member.service.js";
import { requireStringParam } from "../lib/params.js";

const addSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
});

const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});

export const memberController = {
  async listByWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = requireStringParam(req, res, "workspaceId");
      if (!workspaceId) return;
      const members = await memberService.listByWorkspace(workspaceId);
      res.json(members);
    } catch (err) {
      next(err);
    }
  },

  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = requireStringParam(req, res, "workspaceId");
      if (!workspaceId) return;
      const data = addSchema.parse(req.body);
      const member = await memberService.addByEmail(
        workspaceId,
        data.email,
        data.role,
      );
      res.status(201).json(member);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "USER_NOT_FOUND")
          return res
            .status(404)
            .json({ error: "No user found with that email" });
        if (err.message === "ALREADY_MEMBER")
          return res.status(409).json({ error: "User is already a member" });
      }
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = requireStringParam(req, res, "workspaceId");
      const userId = requireStringParam(req, res, "userId");
      if (!workspaceId || !userId) return;
      await memberService.remove(workspaceId, userId);
      res.status(204).end();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "NOT_MEMBER")
          return res.status(404).json({ error: "User is not a member" });
        if (err.message === "CANNOT_REMOVE_OWNER")
          return res
            .status(403)
            .json({ error: "Cannot remove the workspace owner" });
      }
      next(err);
    }
  },

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = requireStringParam(req, res, "workspaceId");
      const userId = requireStringParam(req, res, "userId");
      if (!workspaceId || !userId) return;
      const data = updateRoleSchema.parse(req.body);
      const member = await memberService.updateRole(
        workspaceId,
        userId,
        data.role,
      );
      res.json(member);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "NOT_MEMBER")
          return res.status(404).json({ error: "User is not a member" });
        if (err.message === "CANNOT_CHANGE_OWNER")
          return res
            .status(403)
            .json({ error: "Cannot change the owner role" });
      }
      next(err);
    }
  },
  async listMyRoles(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user)
        return res.status(401).json({ error: "Not authenticated" });
      const roles = await memberService.listMyRolesAcross(req.user.id);
      res.json(roles);
    } catch (err) {
      next(err);
    }
  },
};
