import type { LoginBody, RegisterBody } from "../schemas/auth.schema.ts";

export const loginService = async (body: LoginBody) => {
  return {
    token: "1111",
    refreshToken: "222",
  };
};

export const registerService = async (body: RegisterBody) => {
  return null;
};
