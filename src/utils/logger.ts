import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { createWriteStream } from 'node:fs'

import pino from 'pino'
import { pinoHttp } from 'pino-http'

import { config } from '@/config/index.js'

// 创建日志文件流（按日期分割）
const logDir = 'logs'
const logFile = join(logDir, `${new Date().toISOString().split('T')[0]}.log`)
// 确保日志目录存在（可以在启动时创建）
const fileStream = createWriteStream(logFile, { flags: 'a' })

// 根据环境配置日志级别和格式
const logger = pino(
  {
    level: config.app.isProduction ? 'info' : 'debug',
    formatters: {
      level: (label) => {
        return { level: label }
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },

  pino.multistream([
    // 文件流：始终使用 JSON 格式
    {
      level: config.app.isProduction ? 'info' : 'debug',
      stream: fileStream,
    },
    // 控制台流：开发环境美化，生产环境 JSON
    {
      level: config.app.isProduction ? 'info' : 'debug',
      stream: config.app.isDevelopment
        ? pino.transport({
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          })
        : process.stdout,
    },
  ]),
)

// http 请求日志中间件
export const httpLogger = pinoHttp({
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

export default logger
