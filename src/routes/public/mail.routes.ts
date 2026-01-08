import { Router } from 'express'

import { validate } from '@/middlewares/validate.middleware.js'
import { strictLimiter } from '@/middlewares/security.middleware.js'
import { sendEmailCodeController } from '@/controllers/mail.controller.js'
import { sendEmailCodeSchema } from '@/schemas/mail.schema.js'

const router = Router()

/**
 * 发送验证码
 */
router.get('/code', strictLimiter, validate(sendEmailCodeSchema), sendEmailCodeController)

export default router
