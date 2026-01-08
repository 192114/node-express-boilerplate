import { Router } from 'express'

import {
  registerController,
  loginController,
  refreshTokenController,
} from '@/controllers/auth.controller.js'
import { validate } from '@/middlewares/validate.middleware.js'
import { strictLimiter } from '@/middlewares/security.middleware.js'
import { loginSchema, registerSchema } from '@/schemas/auth.schema.js'

const router = Router()

router.post('/register', strictLimiter, validate(registerSchema), registerController)
router.post('/login', strictLimiter, validate(loginSchema), loginController)
router.post('/refreshToken', strictLimiter, refreshTokenController)

export default router
