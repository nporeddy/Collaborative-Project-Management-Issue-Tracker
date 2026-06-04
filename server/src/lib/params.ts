import type { Request, Response } from "express";

export function getStringParam(req: Request, name: string): string | null {
  const value = req.params[name];
  return typeof value === "string" ? value : null;
}
export function requireStringParam(
  req: Request,
  res: Response,
  name: string,
): string | null {
  const value = getStringParam(req, name);
  if (!value) {
    res
      .status(400)
      .json({ error: `Missing or invalid path parameter: ${name}` });
    return null;
  }
  return value;
}
