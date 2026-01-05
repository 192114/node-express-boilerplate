import { z } from 'zod'

// 验证单个 URL 是否有效
function isValidOriginUrl(url: string): boolean {
  const trimmedUrl = url.trim()

  // 基本格式检查：必须以 http:// 或 https:// 开头
  if (!/^https?:\/\//.test(trimmedUrl)) {
    return false
  }

  // 使用 URL 构造函数进行严格验证
  try {
    const urlObj = new URL(trimmedUrl)
    // 只允许 http 和 https 协议
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return false
    }
    // 必须有 hostname
    if (!urlObj.hostname) {
      return false
    }
    return true
  } catch {
    return false
  }
}

// CORS_ORIGIN 验证器
const corsOriginSchema = z
  .string()
  .refine(
    (value) => {
      const trimmed = value.trim()

      // 允许 "*" 表示允许所有来源
      if (trimmed === '*') {
        return true
      }

      // 如果是逗号分隔的 URL 列表
      const origins = trimmed.split(',').map((origin) => origin.trim())

      // 检查是否至少有一个 URL
      if (origins.length === 0) {
        return false
      }

      // 验证每个 URL 都是有效的
      return origins.every(isValidOriginUrl)
    },
    {
      message:
        'CORS_ORIGIN 必须是 "*" 或者逗号分隔的有效 URL 列表（例如: http://localhost:3000,https://example.com）',
    },
  )
  .default('*')

export const envSchema = z.object({
  // 服务配置
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.string().regex(/^\d+$/).transform(Number).default(8090),
  API_PREFIX: z.string().default('/api'),

  // 数据库配置
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.string().regex(/^\d+$/).transform(Number).default(5432),
  POSTGRES_DB: z.string(),
  POSTGRES_APP_USER: z.string(),
  POSTGRES_APP_PASSWORD: z.string(),

  // JWT 配置
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Redis 配置
  REDIS_URL: z.url().optional(),

  // CORS 配置
  CORS_ORIGIN: corsOriginSchema,
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`)
      throw new Error(`环境变量验证失败：\n${missingVars.join('\n')}`)
    }

    throw error
  }
}
