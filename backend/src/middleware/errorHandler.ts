import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { ZodError } from "zod";

/** Express error middleware must have exactly 4 params for Express to recognize it. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: err.flatten(),
    });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
