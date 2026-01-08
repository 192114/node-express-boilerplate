// 不需要鉴权的接口
import { Router } from 'express'

import healthRoutes from './health.routes.js'
import authRoutes from './auth.routes.js'
import mailRoutes from './mail.routes.js'

const router = Router()

router.get('/health', healthRoutes)

router.use('/auth', authRoutes)

router.use('/mail', mailRoutes)

export default router
