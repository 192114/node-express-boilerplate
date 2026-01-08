import { Router } from 'express'

// 公开不需要鉴权
import publicRoutes from './public/index.js'
// 需要鉴权的
import protectedRoutes from './protected/index.js'
const router = Router()

router.use(publicRoutes)
router.use(protectedRoutes)

export default router
