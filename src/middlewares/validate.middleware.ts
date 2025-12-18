import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError";

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
    } catch (err: any) {
      throw new HttpError(
        40000,
        400,
        err.errors?.[0]?.message || "参数校验失败"
      );
    }
  };
};
