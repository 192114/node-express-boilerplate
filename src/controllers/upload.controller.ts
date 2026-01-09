import type { NextFunction, Response } from 'express'
import type { TypedRequest } from '@/types/request.js'

import { uploadMultipleService, uploadSingleService } from '@/services/upload.service.js'
import { successResponse } from '@/utils/response.js'

export const uploadSingleController = async (
  req: TypedRequest<{}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file
    const uploadResult = await uploadSingleService(file)
    successResponse(res, uploadResult)
  } catch (error) {
    next(error)
  }
}

export const uploadMultipController = async (
  req: TypedRequest<{}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined
    const uploadResult = await uploadMultipleService(files)
    successResponse(res, uploadResult)
  } catch (error) {
    next(error)
  }
}
