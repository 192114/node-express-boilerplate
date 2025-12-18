import { Request } from "express";

export type TypedRequest<
  T extends {
    params?: any;
    body?: any;
    query?: any;
  }
> = Request<T["params"], {}, T["body"], T["query"]>;
