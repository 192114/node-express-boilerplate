// src/types/express.d.ts
import 'express'

declare global {
  namespace Express {
    interface Request {
      meta?: {
        ipAddress: string
        userAgent: string
      }
      user?: {
        userId: string
      }
    }
  }
}

// 让文件成为一个模块，避免被当作全局脚本
export {}
