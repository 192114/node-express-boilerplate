// 错误码枚举
export enum ErrorCode {
  // 通用错误码 (1000-1999)
  VALIDATION_ERROR = 1001,
  UNAUTHORIZED = 1002,
  FORBIDDEN = 1003,
  NOT_FOUND = 1004,
  TOO_MANY_REQUESTS = 1005,

  // 认证相关错误码 (2000-2999)
  INVALID_TOKEN = 2001,
  TOKEN_EXPIRED = 2002,
  INVALID_CREDENTIALS = 2003,
  SESSION_REVOKED = 2004, // refresh token 已被吊销 踢出情况

  // 业务逻辑错误码 (3000-3999)
  // 可以在这里添加更多业务错误码
  EMAIL_ALREADY_EXISTS = 3001,

  // 系统错误 (9000-9999)
  INTERNAL_SERVER_ERROR = 9000,
}

const HTTP_STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.SESSION_REVOKED]: 401,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,
  [ErrorCode.EMAIL_ALREADY_EXISTS]: 429,
}

export class HttpError extends Error {
  // 业务错误码
  readonly code: ErrorCode
  // http 状态码
  readonly status: number
  // 错误信息
  readonly details?: unknown

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message)
    this.code = code
    this.name = 'HttpError'
    this.status = HTTP_STATUS_MAP[code] ?? 500
    this.details = details

    //
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
