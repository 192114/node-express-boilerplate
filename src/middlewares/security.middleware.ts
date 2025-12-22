import helmet from 'helmet'
import { rateLimit, ipKeyGenerator } from 'express-rate-limit'

import { config } from '@/config/index.js'

export const helmetMiddleware = helmet({
  contentSecurityPolicy: config.app.isProduction
    ? {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      }
    : false,

  frameguard: { action: 'deny' },

  hsts: config.app.isProduction
    ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      }
    : false,

  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
})

/**
 * CORS 配置优化
 * 更严格的 CORS 策略
 */
export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // 允许无 origin 的请求（如移动应用、Postman）
    if (!origin) {
      return callback(null, true)
    }

    const allowedOrigins =
      config.cors.origin === true
        ? ['*'] // 开发环境可能允许所有
        : Array.isArray(config.cors.origin)
          ? config.cors.origin
          : [config.cors.origin]

    // 如果允许所有来源（仅开发环境）
    if (config.app.isDevelopment) {
      callback(null, true)
      return
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true, // 允许携带凭证
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 小时
  preflightContinue: false,
  optionsSuccessStatus: 204,
}

/**
 * 请求大小限制
 */
export const bodyParserLimit = {
  json: { limit: '10mb' }, // JSON 请求体大小限制
  urlencoded: { limit: '10mb', extended: true },
}

/**
 * API 速率限制
 * 防止暴力破解和 DDoS 攻击
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: config.app.isProduction ? 100 : 1000, // 生产环境：100 次/15分钟，开发环境：1000 次
  message: {
    error: '请求过于频繁，请稍后再试',
    retryAfter: '15 分钟',
  },
  standardHeaders: true, // 返回 `RateLimit-*` 头
  legacyHeaders: false, // 禁用 `X-RateLimit-*` 头
  keyGenerator: (req) => {
    const ipKey = ipKeyGenerator(req.ip ?? 'unknown')
    const username = req.body?.username ?? 'anonymous'
    return `${ipKey}:${username}`
  },
})

/**
 * 严格速率限制（用于登录等敏感操作）
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 5, // 15 分钟内最多 5 次
  message: {
    error: '尝试次数过多，请稍后再试',
    retryAfter: '15 分钟',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 成功请求不计入限制
  keyGenerator: (req) => {
    const ipKey = ipKeyGenerator(req.ip ?? 'unknown')
    const username = req.body?.username ?? 'anonymous'
    return `${ipKey}:${username}`
  },
})
