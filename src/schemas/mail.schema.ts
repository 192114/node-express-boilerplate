import { z } from 'zod'

import { emailSchema } from './common.schema.js'

// 发送验证码
export const sendEmailCodeSchema = z.object({
  query: z.object({
    email: emailSchema,
    type: z.enum(['REGISTER', 'RESET_PASSWORD']),
  }),
})

export type SendEmailCodeQuery = z.infer<typeof sendEmailCodeSchema>['query']
