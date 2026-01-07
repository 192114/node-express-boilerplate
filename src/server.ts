// 设置时区为东八区（在导入其他模块之前）
process.env.TZ = 'Asia/Shanghai'

import app from '@/app.js'
import { config } from '@/config/index.js'

const PORT = config.app.port

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📦 Environment: ${config.app.env}`)
})
