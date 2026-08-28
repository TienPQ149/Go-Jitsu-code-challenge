import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

type RequestPart = "body" | "query" | "params";

/**
 * Validates & parses `req[part]` against a Zod schema, replacing it with the
 * parsed (and defaulted/coerced) value so downstream handlers get clean data.
 * Validation errors are forwarded to the centralized error handler.
 */
export function validate(schema: ZodSchema, part: RequestPart = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      next(result.error);
      return;
    }
    (req as any)[part] = result.data;
    next();
  };
}
