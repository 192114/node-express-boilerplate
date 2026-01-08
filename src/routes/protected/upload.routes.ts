import { Router } from 'express'

import { uploadMiddleware } from '@/middlewares/upload.middleware.js'

const router = Router()

/**
 * 上传单个文件
 */
router.post('/', uploadMiddleware.single('file'))

/**
 * 上传多个文件
 */
router.post('/multiple', uploadMiddleware.array('files'))

export default router
