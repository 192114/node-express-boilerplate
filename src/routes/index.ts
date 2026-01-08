import { Router } from 'express'

// 公开不需要鉴权
import publicRoutes from './public.routes.js'
// 需要鉴权的
import protectedRoutes from './protected.routes.js'
const router = Router()

router.use(publicRoutes)
router.use(protectedRoutes)

export default router
