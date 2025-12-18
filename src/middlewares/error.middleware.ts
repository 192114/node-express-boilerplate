import { HttpError } from "../utils/httpError.js";

import type { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof HttpError) {
    return res.status(err.code).json({
      code: err.code,
      data: null,
      message: err.message,
    });
  }

  const message = err instanceof Error ? err.message : "Internal Server Error";

  return res.status(500).json({
    code: 500,
    data: null,
    message,
  });
};
