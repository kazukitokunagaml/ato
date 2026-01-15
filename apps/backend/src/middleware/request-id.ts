/**
 * リクエストIDミドルウェア
 * - X-Request-Idヘッダーがあればそれを使用
 * - なければ新規生成
 */

import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../types'

export const requestIdMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  // クライアントから送られたリクエストIDがあればそれを使用
  const clientRequestId = c.req.header('x-request-id')
  const requestId = clientRequestId || crypto.randomUUID()

  // コンテキストに設定
  c.set('requestId', requestId)

  // レスポンスヘッダーにも設定
  c.header('X-Request-Id', requestId)

  await next()
})
