/**
 * レート制限ミドルウェア
 *
 * セキュリティ設計書の仕様に準拠:
 * - /api/auth/login: 5回/分/IP
 * - /api/auth/signup: 3回/分/IP（現在使用していないが将来用）
 * - /api/auth/refresh: 10回/分/ユーザー
 * - /api/sync/*: 60回/分/ユーザー
 * - その他API: 100回/分/ユーザー
 *
 * 注意: Cloudflare Workersはステートレスのため、
 * 本番環境ではCloudflare Rate LimitingやDurable Objectsを使用すべき。
 * このミドルウェアは開発環境およびフォールバック用。
 */

import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import type { AppEnv } from '../types'
import { getClientIp } from '../lib/logger'
import { authLogger } from '../lib/logger'

// レート制限の設定
export interface RateLimitConfig {
  windowMs: number // ウィンドウ期間（ミリ秒）
  maxRequests: number // 最大リクエスト数
  keyType: 'ip' | 'user' // 識別子の種類
}

// エンドポイント別のレート制限設定
const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  '/api/auth/login': { windowMs: 60000, maxRequests: 5, keyType: 'ip' },
  '/api/auth/dev-login': { windowMs: 60000, maxRequests: 5, keyType: 'ip' },
  '/api/auth/refresh': { windowMs: 60000, maxRequests: 10, keyType: 'user' },
  '/api/sync': { windowMs: 60000, maxRequests: 60, keyType: 'user' },
}

// デフォルトのレート制限（その他API）
const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60000,
  maxRequests: 100,
  keyType: 'user',
}

// インメモリストア（開発環境用）
// 注意: Workersのインスタンス間で共有されない
interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// 最後にクリーンアップした時刻
let lastCleanup = 0

/**
 * レートリミットストアをクリア（テスト用）
 * @internal
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear()
  lastCleanup = 0
}

// ストアをクリーンアップ（リクエスト時に呼び出し）
function cleanupStoreIfNeeded() {
  const now = Date.now()
  // 30秒以上経過していたらクリーンアップ
  if (now - lastCleanup < 30000) return
  lastCleanup = now

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * レート制限をチェック
 * @internal テスト用にexport
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  let entry = rateLimitStore.get(key)

  // エントリがないか期限切れの場合は新規作成
  if (!entry || entry.resetAt <= now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    }
  }

  // カウントを増加
  entry.count++
  rateLimitStore.set(key, entry)

  const remaining = Math.max(0, config.maxRequests - entry.count)
  const allowed = entry.count <= config.maxRequests

  return { allowed, remaining, resetAt: entry.resetAt }
}

/**
 * エンドポイントに対応するレート制限設定を取得
 * @internal テスト用にexport
 */
export function getConfigForPath(path: string): RateLimitConfig {
  // 完全一致
  if (RATE_LIMIT_CONFIGS[path]) {
    return RATE_LIMIT_CONFIGS[path]
  }

  // プレフィックスマッチ（/api/sync/*）
  for (const [prefix, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
    if (path.startsWith(prefix)) {
      return config
    }
  }

  return DEFAULT_RATE_LIMIT
}

/**
 * レート制限ミドルウェア
 */
export const rateLimitMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  // 定期的にストアをクリーンアップ
  cleanupStoreIfNeeded()

  const path = c.req.path
  const config = getConfigForPath(path)
  const requestId = c.get('requestId')

  // 識別子を決定
  let identifier: string
  if (config.keyType === 'ip') {
    const ip = getClientIp(c.req.raw.headers) || 'unknown'
    identifier = `ip:${ip}:${path}`
  } else {
    // ユーザー識別子（認証済みの場合はuserId、そうでなければIP）
    const userId = c.get('userId')
    if (userId) {
      identifier = `user:${userId}:${path}`
    } else {
      const ip = getClientIp(c.req.raw.headers) || 'unknown'
      identifier = `ip:${ip}:${path}`
    }
  }

  // レート制限をチェック
  const result = checkRateLimit(identifier, config)

  // レスポンスヘッダーに残り回数を設定
  c.header('X-RateLimit-Limit', config.maxRequests.toString())
  c.header('X-RateLimit-Remaining', result.remaining.toString())
  c.header('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000).toString())

  if (!result.allowed) {
    // レート制限超過をログ
    const entry = rateLimitStore.get(identifier)
    authLogger.rateLimitExceeded(identifier, path, entry?.count || 0, requestId)

    // Retry-Afterヘッダーを設定
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000)
    c.header('Retry-After', retryAfter.toString())

    throw new HTTPException(429, { message: 'Too many requests' })
  }

  await next()
})

/**
 * アカウントロック用のストア
 * 10回失敗で30分ロック
 */
interface AccountLockEntry {
  failCount: number
  lockedUntil: number | null
}

const accountLockStore = new Map<string, AccountLockEntry>()

const ACCOUNT_LOCK_CONFIG = {
  maxFailures: 10,
  lockDurationMs: 30 * 60 * 1000, // 30分
}

/**
 * ログイン失敗を記録
 */
export function recordLoginFailure(identifier: string): {
  isLocked: boolean
  failCount: number
  lockedUntil: number | null
} {
  const now = Date.now()
  let entry = accountLockStore.get(identifier)

  // ロック中かチェック
  if (entry?.lockedUntil && entry.lockedUntil > now) {
    return { isLocked: true, failCount: entry.failCount, lockedUntil: entry.lockedUntil }
  }

  // エントリがないか、ロック解除済みの場合
  if (!entry || (entry.lockedUntil && entry.lockedUntil <= now)) {
    entry = { failCount: 0, lockedUntil: null }
  }

  // 失敗カウントを増加
  entry.failCount++

  // ロック閾値に達した場合
  if (entry.failCount >= ACCOUNT_LOCK_CONFIG.maxFailures) {
    entry.lockedUntil = now + ACCOUNT_LOCK_CONFIG.lockDurationMs
  }

  accountLockStore.set(identifier, entry)

  return {
    isLocked: entry.lockedUntil !== null,
    failCount: entry.failCount,
    lockedUntil: entry.lockedUntil,
  }
}

/**
 * ログイン成功時にカウントをリセット
 */
export function resetLoginFailures(identifier: string): void {
  accountLockStore.delete(identifier)
}

/**
 * アカウントがロックされているかチェック
 */
export function isAccountLocked(identifier: string): boolean {
  const entry = accountLockStore.get(identifier)
  if (!entry?.lockedUntil) return false
  return entry.lockedUntil > Date.now()
}
