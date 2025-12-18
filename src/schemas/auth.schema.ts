import { z } from "zod";

import {
  usernameSchema,
  passwordSchema,
  emailSchema,
  emailCodeSchema,
  uuidSchema,
} from "./common.schema.js";

// 注册schema
export const registerSchema = z.object({
  body: z.object({
    username: usernameSchema,
    password: passwordSchema,
    email: emailSchema,
    emailCode: emailCodeSchema,
    emialUuid: uuidSchema,
  }),
});

export type RegisterBody = z.infer<typeof registerSchema>["body"];

// 登录schema
export const loginSchema = z.object({
  body: z.object({
    username: usernameSchema,
    password: passwordSchema,
  }),
});

export type LoginBody = z.infer<typeof loginSchema>["body"];
