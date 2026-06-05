import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { tokenService } from "../lib/jwt.js";
import { generateOtp, OTP_TTL_MS } from "../lib/otp.js";
import { sendEmail } from "../lib/email.js";

const RESEND_COOLDOWN_MS = 60 * 1000; 

export const authService = {
  async register(data: { email: string; password: string; name: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new Error("EMAIL_TAKEN");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: passwordHash,
        name: data.name,
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    // Generate and store OTP
    const code = generateOtp();
    await prisma.verificationToken.create({
      data: {
        code,
        userId: user.id,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    try {
      await sendEmail({
        to: user.email,
        subject: "Your verification code",
        html: `
          <p>Hi ${user.name},</p>
          <p>Your verification code is <strong style="font-size:20px;letter-spacing:2px;">${code}</strong></p>
          <p>This code expires in 15 minutes.</p>
        `,
        text: `Hi ${user.name},\n\nYour verification code is ${code}\n\nThis code expires in 15 minutes.`,
      });
    } catch (err) {
      console.error("[auth.register] Failed to send verification email:", err);
    }

    return user;
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
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) throw new Error("INVALID_CODE");

    if (user.emailVerified) {
      throw new Error("ALREADY_VERIFIED");
    }

    // Find the most recent unused, unexpired token for this user
    const token = await prisma.verificationToken.findFirst({
      where: {
        userId: user.id,
        code: data.code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!token) throw new Error("INVALID_CODE");

    // Mark token used + user verified in a single transaction
    const [, updatedUser] = await prisma.$transaction([
      prisma.verificationToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
    ]);

    const accessToken = tokenService.generateAccessToken(updatedUser.id);
    const refreshToken = tokenService.generateRefreshToken(updatedUser.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        emailVerified: updatedUser.emailVerified,
      },
    };
  },

  async resendVerification(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether the email exists
      return { ok: true };
    }
    if (user.emailVerified) {
      throw new Error("ALREADY_VERIFIED");
    }

    // Check cooldown — find the most recent token
    const lastToken = await prisma.verificationToken.findFirst({
      where: { userId: user.id },
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

    // Invalidate previous unused tokens (mark used) to prevent multiple valid codes
    await prisma.verificationToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Issue new code
    const code = generateOtp();
    await prisma.verificationToken.create({
      data: {
        code,
        userId: user.id,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    await sendEmail({
      to: user.email,
      subject: "Your new verification code",
      html: `
        <p>Hi ${user.name},</p>
        <p>Your new verification code is <strong style="font-size:20px;letter-spacing:2px;">${code}</strong></p>
        <p>This code expires in 15 minutes.</p>
      `,
      text: `Hi ${user.name},\n\nYour new verification code is ${code}\n\nThis code expires in 15 minutes.`,
    });

    return { ok: true };
  },
};
