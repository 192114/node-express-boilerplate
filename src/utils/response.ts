import type { Response } from 'express'
import type { ApiResponse } from '@/types/response.ts'

import { SuccessCode } from '@/types/response.js'

export const successResponse = <T>(
  res: Response<ApiResponse<T>>,
  data: T,
  message: string = 'Success',
  code: SuccessCode = SuccessCode.SUCCESS,
) => {
  const response: ApiResponse<T> = {
    code,
    data,
    message,
  }
  return res.status(200).json(response)
}
