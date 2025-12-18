import { Request, Response, NextFunction } from "express";
import { loginService, registerService } from "../services/auth.service";
import { successResponse } from "../utils/response";
import { LoginBody, RegisterBody } from "../schemas/auth.schema";
import { TypedRequest } from "../types/request";

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
