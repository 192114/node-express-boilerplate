import { join } from 'node:path'
import { createWriteStream } from 'node:fs'

import pino from 'pino'

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

export default logger
