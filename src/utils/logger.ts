// src/utils/logger.ts
import { join } from 'node:path'
import { createWriteStream } from 'node:fs'

import pino from 'pino'

import dayjs from '@/utils/dayjs.js' // 新增
import { config } from '@/config/index.js'

const logDir = 'logs'

// 用 dayjs（默认 Asia/Shanghai）生成日志文件日期
const getDate = () => dayjs().format('YYYY-MM-DD')

const logFile = join(logDir, `${getDate()}.log`)
const fileStream = createWriteStream(logFile, { flags: 'a' })

// 用 dayjs 生成 ISO 时间戳（含时区偏移）
const timestampFunction = () => {
  const ts = dayjs().format('YYYY-MM-DDTHH:mm:ss.SSSZ')
  return `,"time":"${ts}"`
}

// 根据环境配置日志级别和格式
const logger = pino(
  {
    level: config.app.isProduction ? 'info' : 'debug',
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: timestampFunction,
  },
  pino.multistream([
    {
      level: config.app.isProduction ? 'info' : 'debug',
      stream: fileStream,
    },
    {
      level: config.app.isProduction ? 'info' : 'debug',
      stream: config.app.isDevelopment
        ? pino.transport({
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard', // 可保持不变；timestamp 已用 dayjs
              ignore: 'pid,hostname',
            },
          })
        : process.stdout,
    },
  ]),
)

export default logger
