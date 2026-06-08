import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { tokenService } from "../lib/jwt.js";
import { generateOtp, OTP_TTL_MS } from "../lib/otp.js";
import { sendEmail } from "../lib/email.js";

const RESEND_COOLDOWN_MS = 60 * 1000;

export const authService = {
  async register(data: { email: string; password: string; name: string }) {
    // Check if a verified user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new Error("EMAIL_TAKEN");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const code = generateOtp();

    await prisma.pendingRegistration.upsert({
      where: { email: data.email },
      update: {
        name: data.name,
        password: passwordHash,
        code,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
        createdAt: new Date(),
      },
      create: {
        email: data.email,
        name: data.name,
        password: passwordHash,
        code,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    try {
      await sendEmail({
        to: data.email,
        subject: "Your verification code",
        html: `
        <p>Hi ${data.name},</p>
        <p>Your verification code is <strong style="font-size:20px;letter-spacing:2px;">${code}</strong></p>
        <p>This code expires in 15 minutes.</p>
      `,
        text: `Hi ${data.name},\n\nYour verification code is ${code}\n\nThis code expires in 15 minutes.`,
      });
    } catch (err) {
      console.error("[auth.register] Failed to send verification email:", err);
    }

    return { email: data.email };
  },

  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new Error("INVALID_CREDENTIALS");

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new Error("INVALID_CREDENTIALS");

    const accessToken = tokenService.generateAccessToken(user.id);
    const refreshToken = tokenService.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    };
  },

  refresh(refreshToken: string) {
    const payload = tokenService.verifyRefreshToken(refreshToken);
    const accessToken = tokenService.generateAccessToken(payload.userId);
    return { accessToken };
  },

  async me(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerified: true,
      },
    });
  },

  async verifyEmail(data: { email: string; code: string }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new Error("ALREADY_VERIFIED");
    }

    const pending = await prisma.pendingRegistration.findUnique({
      where: { email: data.email },
    });
    if (!pending) {
      throw new Error("INVALID_CODE");
    }

    if (pending.expiresAt < new Date()) {
      throw new Error("INVALID_CODE");
    }

    if (pending.code !== data.code) {
      throw new Error("INVALID_CODE");
    }
    const [newUser] = await prisma.$transaction([
      prisma.user.create({
        data: {
          email: pending.email,
          name: pending.name,
          password: pending.password,
          emailVerified: new Date(),
        },
      }),
      prisma.pendingRegistration.delete({
        where: { id: pending.id },
      }),
    ]);

    const accessToken = tokenService.generateAccessToken(newUser.id);
    const refreshToken = tokenService.generateRefreshToken(newUser.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        emailVerified: newUser.emailVerified,
      },
    };
  },

  async resendVerification(email: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("ALREADY_VERIFIED");
    }
    const pending = await prisma.pendingRegistration.findUnique({
      where: { email },
    });
    if (!pending) {
      return { ok: true };
    }
    const elapsed = Date.now() - pending.createdAt.getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      const err = new Error("RESEND_TOO_SOON") as Error & {
        waitSec?: number;
      };
      err.waitSec = waitSec;
      throw err;
    }

    const code = generateOtp();
    await prisma.pendingRegistration.update({
      where: { email },
      data: {
        code,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
        createdAt: new Date(), // reset cooldown timer
      },
    });

    await sendEmail({
      to: pending.email,
      subject: "Your new verification code",
      html: `
      <p>Hi ${pending.name},</p>
      <p>Your new verification code is <strong style="font-size:20px;letter-spacing:2px;">${code}</strong></p>
      <p>This code expires in 15 minutes.</p>
    `,
      text: `Hi ${pending.name},\n\nYour new verification code is ${code}\n\nThis code expires in 15 minutes.`,
    });

    return { ok: true };
  },

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether the email exists
      return { ok: true };
    }

    const lastToken = await prisma.verificationToken.findFirst({
      where: { userId: user.id, type: "PASSWORD_RESET" },
      orderBy: { createdAt: "desc" },
    });
    if (lastToken) {
      const elapsed = Date.now() - lastToken.createdAt.getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        const waitSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        const err = new Error("RESEND_TOO_SOON") as Error & {
          waitSec?: number;
        };
        err.waitSec = waitSec;
        throw err;
      }
    }

    await prisma.verificationToken.updateMany({
      where: { userId: user.id, type: "PASSWORD_RESET", usedAt: null },
      data: { usedAt: new Date() },
    });

    const code = generateOtp();
    await prisma.verificationToken.create({
      data: {
        code,
        type: "PASSWORD_RESET",
        userId: user.id,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `
          <p>Hi ${user.name},</p>
          <p>Your password reset code is <strong style="font-size:20px;letter-spacing:2px;">${code}</strong></p>
          <p>This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
        `,
        text: `Hi ${user.name},\n\nYour password reset code is ${code}\n\nThis code expires in 15 minutes. If you didn't request this, you can safely ignore this email.`,
      });
    } catch (err) {
      console.error("[auth.requestPasswordReset] Failed to send email:", err);
    }

    return { ok: true };
  },

  async resetPassword(data: {
    email: string;
    code: string;
    newPassword: string;
  }) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new Error("INVALID_CODE");

    const token = await prisma.verificationToken.findFirst({
      where: {
        userId: user.id,
        code: data.code,
        type: "PASSWORD_RESET",
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!token) throw new Error("INVALID_CODE");

    const passwordHash = await bcrypt.hash(data.newPassword, 10);

    await prisma.$transaction([
      prisma.verificationToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { password: passwordHash },
      }),
    ]);

    return { ok: true };
  },

  async deleteAccount(userId: string) {
    const ownerships = await prisma.membership.findMany({
      where: { userId, role: "OWNER" },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            memberships: {
              where: { role: "OWNER" },
              select: { userId: true },
            },
          },
        },
      },
    });

    const soleOwnerOf = ownerships
      .filter((m) => m.workspace.memberships.length === 1)
      .map((m) => m.workspace.name);

    if (soleOwnerOf.length > 0) {
      const err = new Error("SOLE_OWNER") as Error & { workspaces?: string[] };
      err.workspaces = soleOwnerOf;
      throw err;
    }

    await prisma.user.delete({ where: { id: userId } });

    return { ok: true };
  },
};
