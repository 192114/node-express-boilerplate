import { ZodError } from 'zod'

import type { Request, Response, NextFunction } from 'express'

import { HttpError, ErrorCode } from '@/utils/httpError.js'

type ParsableSchema = {
  parse: (input: unknown) => unknown
}

export const validate = (schema: ParsableSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      })
      next()
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        // 格式化所有验证错误
        const errors = err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }))

        // 生成友好的错误消息
        const messages = errors.map((e) => `${e.path}: ${e.message}`)
        const errorMessage = `参数校验失败: ${messages.join('; ')}`

        throw new HttpError(
          ErrorCode.VALIDATION_ERROR,
          errorMessage,
          errors, // 传递所有错误详情
        )
      }

      // 非 ZodError 的情况
      throw new HttpError(ErrorCode.VALIDATION_ERROR, '参数校验失败', err)
    }
  }
}
