import { Request, Response, NextFunction } from "express";
import { loginService } from "../services/auth.service";

export const registerController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    next(error);
  }
};

type LoginBodyType = {
  email: string;
  password: string;
};

export const loginController = async (
  req: Request<{}, {}, LoginBodyType>,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const loginInfo = await loginService(body);
    res.json(loginInfo);
  } catch (error) {
    next(error);
  }
};
