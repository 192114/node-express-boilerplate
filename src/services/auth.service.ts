import { LoginBody, RegisterBody } from "../schemas/auth.schema";

export const loginService = async (body: LoginBody) => {
  return {
    token: "1111",
    refreshToken: "222",
  };
};

export const registerService = async (body: RegisterBody) => {
  return null;
};
