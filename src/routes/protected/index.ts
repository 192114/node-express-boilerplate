// 需要鉴权的接口
import { Router } from 'express'

import uploadRoutes from './upload.routes.js'

import { authMiddleware } from '@/middlewares/auth.middleware.js'

const router = Router()

// 添加鉴权中间件
router.use(authMiddleware)

router.use('/upload', uploadRoutes)

export default router
