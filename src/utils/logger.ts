import { join } from 'node:path'
import { createWriteStream } from 'node:fs'

import pino from 'pino'

import { config } from '@/config/index.js'

// 创建日志文件流（按日期分割）
const logDir = 'logs'

// 获取东八区日期（用于日志文件名）
const getCSTDate = () => {
  const now = new Date()
  const cstTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  return cstTime.toISOString().split('T')[0]
}

const logFile = join(logDir, `${getCSTDate()}.log`)
// 确保日志目录存在（可以在启动时创建）
const fileStream = createWriteStream(logFile, { flags: 'a' })

// 自定义时间戳函数（东八区）
const cstTimeFunction = () => {
  const now = new Date()
  const cstTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  return `,"time":"${cstTime.toISOString()}"`
}

// 根据环境配置日志级别和格式
const logger = pino(
  {
    level: config.app.isProduction ? 'info' : 'debug',
    formatters: {
      level: (label) => {
        return { level: label }
      },
    },
    timestamp: cstTimeFunction,
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
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          })
        : process.stdout,
    },
  ]),
)

export default logger
