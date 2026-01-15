// エラーコード定義
export const ErrorCode = {
  // バリデーションエラー (400)
  VALIDATION_INVALID_INPUT: 'VALIDATION_INVALID_INPUT',
  VALIDATION_INVALID_TARGET: 'VALIDATION_INVALID_TARGET',
  VALIDATION_INVALID_UUID: 'VALIDATION_INVALID_UUID',

  // 認証エラー (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // 認可エラー (403)
  FORBIDDEN: 'FORBIDDEN',

  // リソース不存在 (404)
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',

  // 競合 (409)
  CONFLICT: 'CONFLICT',

  // レート制限 (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // サーバーエラー (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',

  // サービス停止 (503)
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

// エラーコードからHTTPステータスへのマッピング
export const errorCodeToStatus: Record<ErrorCode, number> = {
  [ErrorCode.VALIDATION_INVALID_INPUT]: 400,
  [ErrorCode.VALIDATION_INVALID_TARGET]: 400,
  [ErrorCode.VALIDATION_INVALID_UUID]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.TOKEN_INVALID]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.PROJECT_NOT_FOUND]: 404,
  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.FILE_NOT_FOUND]: 404,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
}

// 5xxエラーはリトライ可能
export function isRetryable(code: ErrorCode): boolean {
  const status = errorCodeToStatus[code]
  return status >= 500
}
