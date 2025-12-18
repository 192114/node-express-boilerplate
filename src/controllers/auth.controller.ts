import { loginService, registerService } from "../services/auth.service.js";
import { successResponse } from "../utils/response.js";

import type { Response, NextFunction } from "express";
import type { LoginBody, RegisterBody } from "../schemas/auth.schema.js";
import type { TypedRequest } from "../types/request.ts";

export const registerController = async (
  req: TypedRequest<{ body: RegisterBody }>,
  res: Response,
  next: NextFunction
) => {
  try {
    await registerService(req.body);
    successResponse(res, null, "注册成功");
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: TypedRequest<{ body: LoginBody }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const loginInfo = await loginService(body);
    successResponse(res, loginInfo, "登录成功");
  } catch (error) {
    next(error);
  }
};
