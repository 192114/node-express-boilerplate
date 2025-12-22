import type { ErrorCode } from '@/utils/httpError.js'

export enum SuccessCode {
  SUCCESS = 200,
}

export type ResponseCode = SuccessCode | ErrorCode

export interface ApiResponse<T = unknown> {
  message: string
  code: ResponseCode
  data: T | null
  details?: unknown
}
