import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authService } from "../services/auth.service.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/\d/, "Must contain a number")
    .regex(/[a-zA-Z]/, "Must contain a letter"),
  name: z.string().min(1).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const resendSchema = z.object({
  email: z.string().email(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z
    .string()
    .min(8)
    .regex(/\d/, "Must contain a number")
    .regex(/[a-zA-Z]/, "Must contain a letter"),
});

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const user = await authService.register(data);
      res.status(201).json({
        message: "Account created. Check your email for a verification code.",
        email: user.email,
      });
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

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/api/auth",
      });

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

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const data = verifyEmailSchema.parse(req.body);
      const result = await authService.verifyEmail(data);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/api/auth",
      });

      res.json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "INVALID_CODE") {
          return res
            .status(400)
            .json({ error: "Invalid or expired verification code" });
        }
        if (err.message === "ALREADY_VERIFIED") {
          return res
            .status(400)
            .json({ error: "Email is already verified. Please log in." });
        }
      }
      next(err);
    }
  },

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const data = resendSchema.parse(req.body);
      await authService.resendVerification(data.email);
      res.json({ message: "If an account exists, a new code has been sent." });
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "ALREADY_VERIFIED") {
          return res
            .status(400)
            .json({ error: "Email is already verified. Please log in." });
        }
        if (err.message === "RESEND_TOO_SOON") {
          const waitSec = (err as Error & { waitSec?: number }).waitSec ?? 60;
          return res.status(429).json({
            error: `Please wait ${waitSec} seconds before requesting another code.`,
          });
        }
      }
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = forgotPasswordSchema.parse(req.body);
      await authService.requestPasswordReset(data.email);
      res.json({
        message: "If an account exists, a password reset code has been sent.",
      });
    } catch (err) {
      if (err instanceof Error && err.message === "RESEND_TOO_SOON") {
        const waitSec = (err as Error & { waitSec?: number }).waitSec ?? 60;
        return res.status(429).json({
          error: `Please wait ${waitSec} seconds before requesting another code.`,
        });
      }
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(data);
      res.json({
        message: "Password reset. Please log in with your new password.",
      });
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_CODE") {
        return res.status(400).json({ error: "Invalid or expired reset code" });
      }
      next(err);
    }
  },
  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      await authService.deleteAccount(req.user.id);
      res.clearCookie("refreshToken", { path: "/api/auth" });
      res.status(204).send();
    } catch (err) {
      if (err instanceof Error && err.message === "SOLE_OWNER") {
        const workspaces =
          (err as Error & { workspaces?: string[] }).workspaces ?? [];
        return res.status(409).json({
          error: "SOLE_OWNER",
          message: `You're the only Owner of: ${workspaces.join(", ")}. Transfer ownership or delete those workspaces first.`,
          workspaces,
        });
      }
      next(err);
    }
  },
};
