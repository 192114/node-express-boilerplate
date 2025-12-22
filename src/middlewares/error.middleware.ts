import type { Request, Response, NextFunction } from 'express'

import { HttpError, ErrorCode } from '@/utils/httpError.js'
import logger from '@/utils/logger.js'
import { config } from '@/config/index.js'

export const errorMiddleware = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  // 从 pino-http 获取请求日志上下文
  const requestLogger = req.log || logger

  if (err instanceof HttpError) {
    // 记录业务错误（警告级别）
    requestLogger.warn(
      {
        err: {
          code: err.code,
          status: err.status,
          message: err.message,
          details: err.details,
          stack: config.app.isDevelopment ? err.stack : undefined,
        },
        req: {
          method: req.method,
          url: req.url,
          ip: req.ip,
          userAgent: req.get('user-agent'),
        },
      },
      `HTTP Error: ${err.message}`,
    )

    return res.status(err.status).json({
      code: err.code,
      data: null,
      message: err.message,
      // 仅在非生产环境返回详细错误信息
      ...(config.app.isDevelopment && err.details ? { details: err.details } : {}),
    })
  }

  // 记录未预期的系统错误（错误级别）
  const message = err instanceof Error ? err.message : 'Internal Server Error'
  const stack = err instanceof Error ? err.stack : undefined

  requestLogger.error(
    {
      err: {
        message,
        stack: config.app.isDevelopment ? stack : undefined,
        // 生产环境只记录错误类型，不记录完整错误对象
        ...(config.app.isDevelopment && { error: err }),
      },
      req: {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        body: config.app.isDevelopment ? req.body : undefined,
      },
    },
    'Unhandled Error',
  )

  // 生产环境不暴露详细错误信息
  const errorMessage = config.app.isProduction ? 'Internal Server Error' : message

  return res.status(500).json({
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    data: null,
    message: errorMessage,
    // 开发环境可以返回堆栈信息
    ...(config.app.isDevelopment && stack && { stack }),
  })
}
