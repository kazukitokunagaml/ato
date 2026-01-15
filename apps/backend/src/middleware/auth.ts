/**
 * 認証ミドルウェア
 * - JWT検証
 * - RLS設定（current_user_id()）
 */

import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import type { AppEnv } from '../types'
import { verifyAccessToken } from '../lib/jwt'
import { authLogger, getClientIp } from '../lib/logger'

/**
 * JWT検証ミドルウェア
 * - Cookieからaccess_tokenを取得
 * - JWT検証（署名、有効期限）
 * - c.set('userId', payload.sub)でユーザーIDを設定
 * - 失敗時は401エラー
 */
export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const requestId = c.get('requestId')
  const ip = getClientIp(c.req.raw.headers)
  const userAgent = c.req.header('user-agent')

  // Cookieからアクセストークンを取得
  const accessToken = getCookie(c, 'access_token')
  if (!accessToken) {
    authLogger.invalidToken(ip, userAgent, 'missing access token', requestId)
    throw new HTTPException(401, { message: 'Authentication required' })
  }

  // JWT公開鍵を取得
  const publicKey = c.env.JWT_PUBLIC_KEY
  if (!publicKey) {
    throw new HTTPException(500, { message: 'JWT configuration is missing' })
  }

  // JWT検証
  try {
    const payload = await verifyAccessToken(accessToken, publicKey)

    // ユーザーIDが存在することを確認
    if (!payload.sub) {
      throw new Error('Missing subject in token')
    }

    // コンテキストにユーザーIDを設定
    c.set('userId', payload.sub)
  } catch {
    authLogger.invalidToken(ip, userAgent, 'invalid access token', requestId)
    throw new HTTPException(401, { message: 'Invalid access token' })
  }

  await next()
})

/**
 * オプショナル認証ミドルウェア
 * トークンがあれば検証するが、なくてもエラーにしない
 */
export const optionalAuthMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const accessToken = getCookie(c, 'access_token')

  if (accessToken && c.env.JWT_PUBLIC_KEY) {
    try {
      const payload = await verifyAccessToken(accessToken, c.env.JWT_PUBLIC_KEY)
      if (payload.sub) {
        c.set('userId', payload.sub)
      }
    } catch {
      // トークン検証失敗は無視
    }
  }

  await next()
})
