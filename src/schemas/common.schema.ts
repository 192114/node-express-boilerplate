import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3, "用户名至少 3 位")
  .max(20, "用户名最多 20 位")
  .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母数字下划线");

export const passwordSchema = z
  .string()
  .min(8, "密码至少 8 位")
  .max(32, "密码最多 32 位")
  .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "密码必须包含字母和数字");

export const emailSchema = z.string().email("邮箱格式不正确");

export const uuidSchema = z.string().uuid("UUID 格式不正确");

export const emailCodeSchema = z.string().length(6, "邮箱验证码必须是 6 位");
