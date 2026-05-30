import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authService } from "../services/auth.service.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const user = await authService.register(data);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof Error && err.message === "EMAIL_TAKEN") {
        return res
          .status(409)
          .json({ error: "An account with this email already exists" });
      }
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);

      // Refresh token → HTTP-only cookie (secure storage)
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        path: "/api/auth",
      });

      // Access token + user → response body (frontend reads these)
      res.json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      next(err);
    }
  },
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token" });
      }
      const result = authService.refresh(refreshToken);
      res.json(result);
    } catch {
      return res.status(401).json({ error: "Invalid refresh token" });
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user)
        return res.status(401).json({ error: "Not authenticated" });
      const user = await authService.me(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie("refreshToken", { path: "/api/auth" });
    res.status(204).send();
  },
};
