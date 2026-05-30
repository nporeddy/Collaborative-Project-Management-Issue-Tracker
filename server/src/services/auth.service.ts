import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { tokenService } from "../lib/jwt.js";

export const authService = {
  async register(data: { email: string; password: string; name: string }) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new Error("EMAIL_TAKEN");
    }

    // Hash the password — 10 salt rounds is standard
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: passwordHash,
        name: data.name,
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

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
      user: { id: user.id, email: user.email, name: user.name },
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
      select: { id: true, email: true, name: true, createdAt: true },
    });
  },
};
