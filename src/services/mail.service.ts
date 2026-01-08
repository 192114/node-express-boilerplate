import crypto from 'node:crypto'

import * as argon2 from 'argon2'
import nodemailer from 'nodemailer'

import type { SendEmailCodeQuery } from '@/schemas/mail.schema.js'

import { prisma } from '@/database/prisma.js'
import { config } from '@/config/index.js'
import { HttpError, ErrorCode } from '@/utils/httpError.js'

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
})

// 验证码配置
const CODE_CONFIG = {
  LENGTH: 6, // 验证码长度
  EXPIRE_MINUTES: 5, // 过期时间（分钟）
  MIN_SEND_INTERVAL_SECONDS: 60, // 最小发送间隔（秒）
  MAX_ATTEMPTS: 5, // 最大尝试次数
}

function generateCode(length = 6): string {
  const max = Math.pow(10, length)
  const num = crypto.randomInt(0, max)
  return num.toString().padStart(length, '0')
}

// 在 mail.service.ts 中添加这个函数
function generateVerificationEmailHtml(code: string): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>邮箱验证码</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">邮箱验证码</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">您好，</p>
              
              <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                您正在进行邮箱验证，请使用以下验证码完成验证：
              </p>
              
              <!-- Verification Code Box -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <div style="display: inline-block; padding: 20px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                      <div style="font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${code}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Tips -->
              <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 4px;">
                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                  <strong style="color: #333333;">温馨提示：</strong><br>
                  • 验证码有效期为 <strong style="color: #667eea;">5 分钟</strong><br>
                  • 请勿将验证码告知他人<br>
                  • 如非本人操作，请忽略此邮件
                </p>
              </div>
              
              <p style="margin: 30px 0 0; color: #999999; font-size: 13px; line-height: 1.6;">
                此邮件由系统自动发送，请勿回复。
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} Your Company. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// 然后在 sendEmailCodeService 中使用
export const sendEmailCodeService = async (query: SendEmailCodeQuery) => {
  const { email, type } = query

  // 查询库里最新的验证码
  const now = new Date()
  const existingVerification = await prisma.emailVerification.findFirst({
    where: {
      email,
      used: false,
      type,
      expiresAt: {
        gt: now,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // 如果存在则不允许发送 并给出提示
  if (existingVerification) {
    const nowTime = now.getTime()
    const timeSinceLastSend = (nowTime - existingVerification.createdAt.getTime()) / 1000

    if (timeSinceLastSend < CODE_CONFIG.MIN_SEND_INTERVAL_SECONDS) {
      // 可发送的剩余时间
      const remainingSeconds = Math.ceil(CODE_CONFIG.MIN_SEND_INTERVAL_SECONDS - timeSinceLastSend)

      throw new HttpError(
        ErrorCode.TOO_MANY_REQUESTS,
        `验证码发送过于频繁，请 ${remainingSeconds} 秒后重试`,
      )
    }

    // 如果已发送 并且没有过期给出提示
    throw new HttpError(ErrorCode.TOO_MANY_REQUESTS, '验证码已发送，请查看邮箱')
  }

  // 生成新的验证码
  const verificationCode = generateCode()
  const verificationCodeHash = await argon2.hash(verificationCode)
  const expiresAt = new Date(now.getTime() + CODE_CONFIG.EXPIRE_MINUTES * 60 * 1000)

  // 插入数据库
  const codeRow = await prisma.emailVerification.create({
    data: {
      email,
      codeHash: verificationCodeHash,
      type,
      expiresAt,
      used: false,
      attempts: 0,
    },
  })

  // 发送邮件
  try {
    await transporter.sendMail({
      from: '"Shadow 🥸" <sunhaibao23@126.com>',
      to: email,
      subject: '邮箱验证码',
      html: generateVerificationEmailHtml(verificationCode),
    })
  } catch (err) {
    // 删除存入的数据
    await prisma.emailVerification.delete({
      where: {
        id: codeRow.id,
      },
    })
    throw new HttpError(ErrorCode.INTERNAL_SERVER_ERROR, '验证码发送失败，请稍后重试')
  }
}

// 验证验证码是否正确
export const verifyEmailCode = async (
  email: string,
  code: string,
  type: 'REGISTER' | 'RESET_PASSWORD',
) => {
  const now = new Date()

  const existingVerification = await prisma.emailVerification.findFirst({
    where: {
      email,
      type,
      used: false,
      expiresAt: {
        gt: now,
      },
    },
    orderBy: {
      type: 'desc',
    },
  })

  // 如果验证码不存在
  if (!existingVerification) {
    throw new HttpError(ErrorCode.VALIDATION_ERROR, '验证码不存在或已过期')
  }

  const { codeHash, id, attempts } = existingVerification

  const isValidate = await argon2.verify(codeHash, code)

  // 校验不通过
  if (!isValidate) {
    const nextAttempts = attempts + 1
    const isExceed = nextAttempts >= CODE_CONFIG.MAX_ATTEMPTS
    // 更新验证次数
    await prisma.emailVerification.update({
      where: {
        id,
      },
      data: {
        attempts: { increment: 1 },
        used: isExceed,
      },
    })

    const remainingAttempts = CODE_CONFIG.MAX_ATTEMPTS - nextAttempts

    const errMessage = isExceed
      ? '验证码使用次数过多，请重新获取'
      : `验证码有误，还可以尝试${remainingAttempts}次`

    throw new HttpError(ErrorCode.VALIDATION_ERROR, errMessage)
  }

  // 校验通过 更新验证码状态
  await prisma.emailVerification.update({
    where: {
      id,
    },
    data: {
      used: true,
    },
  })

  return existingVerification
}
