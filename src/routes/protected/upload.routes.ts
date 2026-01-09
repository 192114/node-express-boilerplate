import { Router } from 'express'

import { uploadMiddleware } from '@/middlewares/upload.middleware.js'
import { uploadMultipController, uploadSingleController } from '@/controllers/upload.controller.js'
import { validate } from '@/middlewares/validate.middleware.js'
import { uploadMultipleSchema, uploadSingleSchema } from '@/schemas/upload.schema.js'

const router = Router()

/**
 * 上传单个文件
 */
router.post(
  '/',
  uploadMiddleware.single('file'),
  validate(uploadSingleSchema),
  uploadSingleController,
)

/**
 * 上传多个文件
 */
router.post(
  '/multiple',
  uploadMiddleware.array('files'),
  validate(uploadMultipleSchema),
  uploadMultipController,
)

export default router
