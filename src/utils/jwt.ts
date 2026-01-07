import jwt from 'jsonwebtoken'

import dayjs from '@/utils/dayjs.js'
import { config } from '@/config/index.js'

export interface JwtPalyload {
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

const { secret, expiresIn, refreshSecret, refreshExpiresIn } = config.jwt

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
  payload: JwtPalyload,
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
export const verifyAccessToken = (accessToken: string): JwtPalyload => {
  return jwt.verify(accessToken, secret) as JwtPalyload
}

// 生成refresh_token
export const generateRefreshToken = (
  payload: JwtPalyload,
): {
  refreshToken: string
  expiresAt: Date
} => {
  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: refreshExpiresIn })

  const expiresAt = calcExpiresAt(refreshExpiresIn)

  return {
    refreshToken,
    expiresAt,
  }
}

// 验证refresh_access_token
export const verfiyRefreshToken = (refreshToken: string): JwtPalyload => {
  return jwt.verify(refreshToken, refreshSecret) as JwtPalyload
}
