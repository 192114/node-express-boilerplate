import { z } from 'zod'

import { passwordSchema, emailSchema, emailCodeSchema } from './common.schema.js'

// 注册schema
export const registerSchema = z.object({
  body: z.object({
    password: passwordSchema,
    email: emailSchema,
    emailCode: emailCodeSchema,
  }),
})

export type RegisterBody = z.infer<typeof registerSchema>['body']

// 登录schema
export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
})

export type LoginBody = z.infer<typeof loginSchema>['body']

// 忘记密码
export const resetPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
    emailCode: emailCodeSchema,
    password: passwordSchema,
  }),
})

export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>['body']
