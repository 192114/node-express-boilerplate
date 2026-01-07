import * as argon2 from 'argon2'

import { verifyEmailCode } from './mail.service.js'

import type { LoginBody, RegisterBody } from '@/schemas/auth.schema.ts'

import { prisma } from '@/database/prisma.js'
import { HttpError, ErrorCode } from '@/utils/httpError.js'
import { generateAccessToken, generateRefreshToken } from '@/utils/jwt.js'

export const loginService = async (body: LoginBody) => {
  const { email, password } = body
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  })
  if (!existingUser) {
    throw new HttpError(ErrorCode.INVALID_CREDENTIALS, '用户名或密码错误')
  }

  const userId = existingUser.id

  const existingCredential = await prisma.userCredential.findFirst({
    where: {
      userId,
      type: 'PASSWORD',
    },
  })

  const passwordHash = existingCredential?.passwordHash

  if (!existingCredential || !passwordHash) {
    throw new HttpError(ErrorCode.INVALID_CREDENTIALS, '用户名或密码错误')
  }

  const isValidatePassword = await argon2.verify(passwordHash, password)

  if (!isValidatePassword) {
    throw new HttpError(ErrorCode.INVALID_CREDENTIALS, '用户名或密码错误')
  }

  // 认证通过 开始处理jwt
  const jwtPayload = { email, userId }
  const { accessToken } = generateAccessToken(jwtPayload)
  const { refreshToken, expiresAt } = generateRefreshToken(jwtPayload)

  await prisma.userSession.create({
    data: {
      userId,
      refreshToken,
      refreshExpiresAt: expiresAt,
    },
  })

  return {
    accessToken,
    refreshToken,
  }
}

export const registerService = async (body: RegisterBody) => {
  const { email, emailCode, password } = body

  const existingUser = await prisma.user.findFirst({
    where: {
      email,
    },
  })

  if (existingUser) {
    // 用户存在
    throw new HttpError(ErrorCode.EMAIL_ALREADY_EXISTS, '邮箱已存在')
  }

  // 校验验证码
  await verifyEmailCode(email, emailCode, 'REGISTER')

  const passwordHash = await argon2.hash(password)

  await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
      },
    })

    await tx.userCredential.create({
      data: {
        passwordHash,
        userId: newUser.id,
        type: 'PASSWORD',
      },
    })
  })
}
