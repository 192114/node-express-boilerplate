import * as argon2 from 'argon2'

import { verifyEmailCode } from './mail.service.js'

import type { Request } from 'express'
import type { LoginBody, RegisterBody, ResetPasswordBody } from '@/schemas/auth.schema.ts'

import { prisma } from '@/database/prisma.js'
import { HttpError, ErrorCode } from '@/utils/httpError.js'
import { generateAccessToken, generateRefreshToken } from '@/utils/jwt.js'

export const loginService = async (body: LoginBody, meta: Request['meta']) => {
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
  const { refreshToken, expiresAt } = generateRefreshToken()

  await prisma.userSession.create({
    data: {
      userId,
      refreshToken,
      refreshExpiresAt: expiresAt,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
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

// 删除refreshToken
export const deleteRefreshToken = async (id: string) => {
  await prisma.userSession.delete({
    where: {
      id,
    },
  })
}

// 刷新token
export const refreshTokenService = async (refreshToken?: string) => {
  if (!refreshToken) {
    throw new HttpError(ErrorCode.VALIDATION_ERROR, '无效的凭证')
  }

  const existingSession = await prisma.userSession.findFirst({
    where: {
      refreshToken,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // refresh token 不存在
  if (!existingSession) {
    throw new HttpError(ErrorCode.INVALID_TOKEN, '无效的凭证')
  }

  const { revoked, refreshExpiresAt, id } = existingSession
  const now = new Date()

  if (revoked) {
    await deleteRefreshToken(id)
    throw new HttpError(ErrorCode.SESSION_REVOKED, '凭证已被吊销')
  }

  if (now.getTime() > new Date(refreshExpiresAt).getTime()) {
    await deleteRefreshToken(id)
    throw new HttpError(ErrorCode.TOKEN_EXPIRED, '凭证已经过期')
  }

  const { userId } = existingSession
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!existingUser) {
    await deleteRefreshToken(id)
    throw new HttpError(ErrorCode.NOT_FOUND, '用户不存在')
  }

  const { email } = existingUser

  const { accessToken } = generateAccessToken({
    email,
    userId,
  })

  return {
    accessToken,
  }
}

// 忘记密码
export const resetPasswordService = async (body: ResetPasswordBody) => {
  const { email, emailCode, password } = body

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (!existingUser) {
    throw new HttpError(ErrorCode.VALIDATION_ERROR, '邮箱或验证码错误')
  }

  await verifyEmailCode(email, emailCode, 'RESET_PASSWORD')

  const passwordHash = await argon2.hash(password)

  await prisma.userCredential.updateMany({
    where: {
      userId: existingUser.id,
      type: 'PASSWORD',
    },
    data: {
      passwordHash,
    },
  })
}
