import { prisma } from '../database/prisma.js'
import { HttpError } from '../utils/httpError.js'

import type { LoginBody, RegisterBody } from '../schemas/auth.schema.ts'

export const loginService = async (body: LoginBody) => {
  const user = await prisma.users.findUnique({
    where: {
      username: body.username,
    },
  })
  if (!user) {
    throw new HttpError(401, 401, '用户不存在')
  }

  return {
    token: '1111',
    refreshToken: '222',
  }
}

export const registerService = async (body: RegisterBody) => {
  return null
}
