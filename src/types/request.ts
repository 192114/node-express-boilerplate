import type { Request } from "express";

export type TypedRequest<
  T extends {
    params?: unknown;
    body?: unknown;
    query?: unknown;
  }
> = Request<T["params"], {}, T["body"], T["query"]>;
