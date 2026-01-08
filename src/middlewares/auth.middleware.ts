import type { Request, Response, NextFunction } from 'express'

import { HttpError, ErrorCode } from '@/utils/httpError.js'
import { verifyAccessToken } from '@/utils/jwt.js'

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers['authorization']
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/)?.[1]

  // 不存在accessToken
  if (!accessToken) {
    throw new HttpError(ErrorCode.UNAUTHORIZED, '未提供访问令牌')
  }

  const verificationResult = await verifyAccessToken(accessToken)

  if (verificationResult.code === 0) {
    req.user = verificationResult.data
    next()
  } else if (verificationResult.code === 1) {
    throw new HttpError(ErrorCode.UNAUTHORIZED, '访问令牌已过期')
  } else {
    throw new HttpError(ErrorCode.UNAUTHORIZED, '无效的访问令牌')
  }
}
