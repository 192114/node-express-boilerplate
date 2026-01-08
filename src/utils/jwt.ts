import { randomBytes } from 'node:crypto'

import jwt, { type JwtPayload } from 'jsonwebtoken'

import dayjs from '@/utils/dayjs.js'
import { config } from '@/config/index.js'

export interface UserJwtPayload {
  userId: string
  email: string
}

const unitMap = {
  ms: 'millisecond',
  s: 'second',
  m: 'minute',
  h: 'hour',
  d: 'day',
  w: 'week',
  y: 'year',
} as const

const { secret, expiresIn, refreshExpiresIn } = config.jwt

type ExpiresInType = typeof expiresIn

const calcExpiresAt = (value: ExpiresInType): Date => {
  if (typeof value === 'number') {
    return dayjs().add(value, 'second').toDate()
  }

  const match = /^(\d+)(ms|s|m|h|d|w|y)$/i.exec(value)

  if (!match) {
    throw new Error(`无效的 JWT_EXPIRES_IN: ${value}`)
  }

  const amount = Number(match[1])
  const unit = unitMap[match[2].toLowerCase() as keyof typeof unitMap]
  return dayjs().add(amount, unit).toDate()
}

// 生成access_token
export const generateAccessToken = (
  payload: UserJwtPayload,
): {
  accessToken: string
  expiresAt: Date
} => {
  const accessToken = jwt.sign(payload, secret, { expiresIn })

  const expiresAt = calcExpiresAt(expiresIn)

  return {
    accessToken,
    expiresAt,
  }
}

// 验证access_token
export enum VerifyAccessTokenErrorCodeEnum {
  'TokenExpiredError' = 1, // token 过期
  'JsonWebTokenError' = 2, // token 无效
  'NotBeforeError' = 3, // token 还没到时间没生效
}

type VerifyAccessTokenErrorValue =
  (typeof VerifyAccessTokenErrorCodeEnum)[keyof typeof VerifyAccessTokenErrorCodeEnum] // 得到 1 | 2 | 3

export interface VerifyAccessTokenResult {
  code: 0 | VerifyAccessTokenErrorValue | 4
  data?: UserJwtPayload
}
export const verifyAccessToken = async (accessToken: string): Promise<VerifyAccessTokenResult> =>
  new Promise((resovle, reject) => {
    jwt.verify(accessToken, secret, (err, decode) => {
      if (err) {
        return reject({
          code: VerifyAccessTokenErrorCodeEnum[
            err.name as keyof typeof VerifyAccessTokenErrorCodeEnum
          ],
        })
      }

      if (!decode || typeof decode === 'string') {
        return reject({
          code: 4,
        })
      }

      return resovle({
        code: 0,
        data: {
          email: decode.email,
          userId: decode.userId,
        },
      })
    })
  })

// 生成refresh_token
export const generateRefreshToken = (): {
  refreshToken: string
  expiresAt: Date
} => {
  const refreshToken = randomBytes(32).toString('hex')

  const expiresAt = calcExpiresAt(refreshExpiresIn)

  return {
    refreshToken,
    expiresAt,
  }
}
