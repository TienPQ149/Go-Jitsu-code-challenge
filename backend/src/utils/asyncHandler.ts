import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Express 4 does not automatically forward synchronous throws (or rejected
 * promises) from route handlers to the error middleware. This wrapper does.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => unknown
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve()
      .then(() => fn(req, res, next))
      .catch(next);
  };
}
