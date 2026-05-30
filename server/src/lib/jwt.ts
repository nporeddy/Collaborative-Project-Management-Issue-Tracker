import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("JWT secrets are not set in environment variables");
}

export interface TokenPayload {
  userId: string;
}

export const tokenService = {
  generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "15m" });
  },

  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" });
  },

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  },

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  },
};
