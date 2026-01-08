import { Router } from 'express'

import { prisma } from '@/database/prisma.js'

const router = Router()

// 健康检查路由（判断程序是否存活）
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: Date.now(),
  })
})

//  判断程序是否准备好处理请求
router.get('/ready', async (_req, res) => {
  try {
    // 用 findFirst 检查数据库可用性
    await prisma.user.findFirst()

    // 数据库可访问，不管有没有数据，都返回 200
    res.status(200).json({
      status: 'ok',
      timestamp: Date.now(),
    })
  } catch (error: unknown) {
    res.status(503).json({
      // 注意 503 比 500 更符合 readiness semantics
      status: 'error',
      message: 'Service is not ready',
      reason: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

export default router
