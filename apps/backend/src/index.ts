import './lib/openapi' // Zod を OpenAPI 対応に拡張（副作用 import）
import { Hono } from 'hono'
import { openAPIRouteHandler } from 'hono-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { auth, projects, sync } from './routes'
import { errorMiddleware, requestIdMiddleware } from './middleware'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

// グローバルミドルウェア
app.use('*', requestIdMiddleware)
app.use('*', errorMiddleware)

// ヘルスチェック
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

// APIルート
app.route('/api/auth', auth)
app.route('/api/projects', projects)
app.route('/api/sync', sync)

// OpenAPI ドキュメント（開発環境のみ）
app.get('/api/doc', async (c, next) => {
  if (c.env.APP_ENV !== 'development') {
    return c.notFound()
  }
  await next()
}, openAPIRouteHandler(app, {
  documentation: {
    openapi: '3.1.0',
    info: {
      title: 'ato API',
      version: '1.0.0',
      description: 'ato エディターのバックエンドAPI',
    },
    servers: [{ url: 'http://localhost:8787', description: '開発環境' }],
  },
}))

// API Reference UI（開発環境のみ）
app.get('/api/reference', async (c, next) => {
  if (c.env.APP_ENV !== 'development') {
    return c.notFound()
  }
  await next()
}, Scalar({ url: '/api/doc' }))

export default app
