import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import multer from 'multer'

import type { Request, Response, NextFunction } from 'express'

import { config } from '@/config/index.js'
import { ErrorCode, HttpError } from '@/utils/httpError.js'

const { dir, allowedMimeTypes, maxSize, maxFiles } = config.upload

const UPLOAD_DIR = path.join(process.cwd(), dir)
const MAX_FILE_SIZE = maxSize * 1024 * 1024

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true })
}

// 类型校验
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new HttpError(ErrorCode.VALIDATION_ERROR, `不支持的文件类型：${file.mimetype}`))
  }
}

// 配置存储位置
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${randomUUID()}${ext}`
    cb(null, filename)
  },
})

// 错误处理包装器
const handleMulterError = (err: unknown, next: (err?: unknown) => void) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(
        new HttpError(ErrorCode.VALIDATION_ERROR, `文件大小超过限制（最大 ${maxSize}MB）`),
      )
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(
        new HttpError(ErrorCode.VALIDATION_ERROR, `文件数量超过限制（最多${maxFiles}个）`),
      )
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new HttpError(ErrorCode.VALIDATION_ERROR, '不支持的文件类型'))
    }
    return next(new HttpError(ErrorCode.VALIDATION_ERROR, `文件上传错误: ${err.message}`))
  }

  if (err instanceof HttpError) {
    return next(err)
  }

  // 其他错误
  return next(new HttpError(ErrorCode.INTERNAL_SERVER_ERROR, '文件上传失败', err))
}

// 创建multer实例
const multerInstance = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: maxFiles,
  },
})

export const uploadMiddleware = {
  // 单文件
  single: (fieldName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      multerInstance.single(fieldName)(req, res, (error) => {
        if (error) {
          return handleMulterError(error, next)
        }

        next()
      })
    }
  },

  // 多个文件上传（同一字段名）
  array: (fieldName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      multerInstance.array(fieldName, maxFiles)(req, res, (err) => {
        if (err) {
          return handleMulterError(err, next)
        }
        next()
      })
    }
  },
}
