import type { Response, NextFunction } from 'express'
import type { LoginBody, RegisterBody } from '@/schemas/auth.schema.ts'
import type { TypedRequest } from '@/types/request.ts'

import { successResponse } from '@/utils/response.js'
import { loginService, refreshTokenService, registerService } from '@/services/auth.service.js'
import config from '@/config/index.js'

// 注册
export const registerController = async (
  req: TypedRequest<{ body: RegisterBody }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    await registerService(req.body)
    successResponse(res, null, '注册成功')
  } catch (error) {
    next(error)
  }
}

// 登录
export const loginController = async (
  req: TypedRequest<{ body: LoginBody }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body
    const meta = req.meta
    const { refreshToken, accessToken } = await loginService(body, meta)
    // 采用rt写到cookie access_token 返回给客户端
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax', // 宽松模式 跨站 GET 请求会携带，POST/PUT/DELETE 不会
      secure: config.app.isProduction,
    })
    successResponse(res, { accessToken }, '登录成功')
  } catch (error) {
    next(error)
  }
}

// 刷新token
export const refreshTokenController = async (
  req: TypedRequest<{}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.cookies

    const { accessToken } = await refreshTokenService(refreshToken)

    successResponse(res, { accessToken }, '刷新Token成功')
  } catch (error) {
    next(error)
  }
}
