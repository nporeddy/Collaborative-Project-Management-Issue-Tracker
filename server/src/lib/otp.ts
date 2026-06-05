import { randomInt } from "crypto";

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export const OTP_TTL_MS = 15 * 60 * 1000; 