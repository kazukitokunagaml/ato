/**
 * 監査ログユーティリティ
 *
 * セキュリティ設計書の仕様に準拠:
 * - 構造化JSONをstdoutに出力
 * - Cloudflareダッシュボードで確認
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  event: string
  user_id?: string
  ip?: string
  user_agent?: string
  request_id?: string
  metadata?: Record<string, unknown>
}

/**
 * IPアドレスを取得（Cloudflare Workersの場合はCF-Connecting-IP）
 */
export function getClientIp(headers: Headers): string | undefined {
  return (
    headers.get('cf-connecting-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    undefined
  )
}

/**
 * ログエントリを構造化JSONで出力
 */
function log(level: LogLevel, event: string, data?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'event'>>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...data,
  }

  const output = JSON.stringify(entry)

  switch (level) {
    case 'ERROR':
      console.error(output)
      break
    case 'WARN':
      console.warn(output)
      break
    default:
      console.log(output)
  }
}

/**
 * ロガーオブジェクト
 */
export const logger = {
  debug: (event: string, data?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'event'>>) =>
    log('DEBUG', event, data),
  info: (event: string, data?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'event'>>) =>
    log('INFO', event, data),
  warn: (event: string, data?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'event'>>) =>
    log('WARN', event, data),
  error: (event: string, data?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'event'>>) =>
    log('ERROR', event, data),
}

// 認証イベント用ヘルパー
export const authLogger = {
  loginSuccess: (userId: string, provider: string, ip?: string, userAgent?: string, requestId?: string) => {
    logger.info('auth.login.success', {
      user_id: userId,
      ip,
      user_agent: userAgent,
      request_id: requestId,
      metadata: { provider },
    })
  },

  loginFailure: (emailHash: string | undefined, reason: string, ip?: string, userAgent?: string, requestId?: string) => {
    logger.warn('auth.login.failure', {
      ip,
      user_agent: userAgent,
      request_id: requestId,
      metadata: { email_hash: emailHash, reason },
    })
  },

  logout: (userId: string, requestId?: string) => {
    logger.info('auth.logout', {
      user_id: userId,
      request_id: requestId,
    })
  },

  tokenRefresh: (userId: string, requestId?: string) => {
    logger.debug('auth.token.refresh', {
      user_id: userId,
      request_id: requestId,
    })
  },

  accountLock: (userId: string, reason: string, requestId?: string) => {
    logger.warn('auth.account.lock', {
      user_id: userId,
      request_id: requestId,
      metadata: { reason },
    })
  },

  invalidToken: (ip?: string, userAgent?: string, errorDetail?: string, requestId?: string) => {
    logger.warn('auth.token.invalid', {
      ip,
      user_agent: userAgent,
      request_id: requestId,
      metadata: { error: errorDetail },
    })
  },

  rateLimitExceeded: (identifier: string, endpoint: string, count: number, requestId?: string) => {
    logger.warn('security.ratelimit.exceeded', {
      request_id: requestId,
      metadata: { identifier, endpoint, count },
    })
  },
}
