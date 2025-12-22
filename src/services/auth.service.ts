import type { LoginBody, RegisterBody } from '@/schemas/auth.schema.ts'

import { prisma } from '@/database/prisma.js'
import { HttpError, ErrorCode } from '@/utils/httpError.js'

export const loginService = async (body: LoginBody) => {
  const user = await prisma.users.findUnique({
    where: {
      username: body.username,
    },
  })
  if (!user) {
    throw new HttpError(ErrorCode.INVALID_CREDENTIALS, '用户名或密码错误')
  }

  return {
    token: '1111',
    refreshToken: '222',
  }
}

export const registerService = async (body: RegisterBody) => {
  return null
}
