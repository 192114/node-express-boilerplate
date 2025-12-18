import { HttpError } from "../utils/httpError.js";

import type { Request, Response, NextFunction } from "express";
import type { ZodError } from "zod";

type ParsableSchema = {
  parse: (input: unknown) => unknown;
};

export const validate = (schema: ParsableSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (err: unknown) {
      const zodErr = err as ZodError;
      throw new HttpError(
        400,
        400,
        zodErr.issues?.[0]?.message || "参数校验失败"
      );
    }
  };
};
