import { randomUUID } from 'node:crypto'

import { pinoHttp } from 'pino-http'

import logger from '@/utils/logger.js'
import { config } from '@/config/index.js'

// http 请求日志中间件
export const httpLoggerMiddleware = pinoHttp({
  logger,
  // 自定义日志序列化
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      // 生产环境不记录 body（可能包含敏感信息）
      ...(config.app.isDevelopment && { body: req.body }),
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: (err) => ({
      type: err.type,
      message: err.message,
      stack: config.app.isDevelopment ? err.stack : undefined,
    }),
  },
  // 自定义日志消息
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn'
    }
    if (res.statusCode >= 500 || err) {
      return 'error'
    }
    return 'info'
  },
  // 自定义成功消息
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`
  },
  // 自定义错误消息
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`
  },
  // 自动记录请求 ID
  genReqId: (req) => {
    const headerId = req.headers['x-request-id']
    if (typeof headerId === 'string') return headerId

    return randomUUID()
  },
})
