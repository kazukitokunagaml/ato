/**
 * 認証API
 *
 * POST /api/auth/dev-login - 開発環境用ログイン
 * POST /api/auth/login - Google OAuthログイン
 * POST /api/auth/logout - ログアウト
 * POST /api/auth/refresh - トークンリフレッシュ
 * GET /api/auth/me - 現在のユーザー情報取得
 */

import { Hono } from 'hono'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { describeRoute, resolver, validator } from 'hono-openapi'
import { eq } from 'drizzle-orm'
import {
  devLoginResponseSchema,
  loginRequestSchema,
  loginResponseSchema,
  refreshResponseSchema,
  meResponseSchema,
} from '@ato/shared'
import type { AppEnv } from '../types'
import { createDb } from '../db/client'
import { users, projects, fileTreeDocs } from '../db/schema'
import {
  signTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  getDeleteCookieOptions,
} from '../lib/jwt'
import { authLogger, getClientIp } from '../lib/logger'

const auth = new Hono<AppEnv>()

// ダミーCRDTデータ（空のYjsドキュメント相当）
const EMPTY_CRDT_DOC = new Uint8Array([0, 0])

/**
 * POST /api/auth/dev-login
 * 開発環境専用のログインエンドポイント
 */
auth.post(
  '/dev-login',
  describeRoute({
    tags: ['認証'],
    summary: '開発環境用ログイン',
    description: '開発環境専用。DEV_USER_EMAILで指定されたユーザーで自動認証する。',
    responses: {
      200: {
        description: 'ログイン成功',
        content: { 'application/json': { schema: resolver(devLoginResponseSchema) } },
      },
      404: { description: '開発環境以外ではエンドポイント無効' },
    },
  }),
  async (c) => {
    const appEnv = c.env.APP_ENV || 'development'
    const requestId = c.get('requestId')
    const ip = getClientIp(c.req.raw.headers)
    const userAgent = c.req.header('user-agent')

    // 開発環境以外では404を返す
    if (appEnv !== 'development') {
      authLogger.loginFailure(undefined, 'dev-login in non-development', ip, userAgent, requestId)
      throw new HTTPException(404, { message: 'Not Found' })
    }

    const devEmail = c.env.DEV_USER_EMAIL
    if (!devEmail) {
      authLogger.loginFailure(undefined, 'DEV_USER_EMAIL not configured', ip, userAgent, requestId)
      throw new HTTPException(500, { message: 'DEV_USER_EMAIL is not configured' })
    }

    const privateKey = c.env.JWT_PRIVATE_KEY
    if (!privateKey) {
      throw new HTTPException(500, { message: 'JWT_PRIVATE_KEY is not configured' })
    }

    const db = createDb(c.env.DATABASE_URL!)

    // ユーザーを検索（存在しない場合はエラー）
    const existingUsers = await db.select().from(users).where(eq(users.email, devEmail)).limit(1)

    let user = existingUsers[0]

    if (!user) {
      // 開発環境でユーザーが存在しない場合は自動作成
      const newUsers = await db
        .insert(users)
        .values({
          googleId: `dev-${devEmail}`,
          email: devEmail,
          name: devEmail.split('@')[0] || 'Developer',
        })
        .returning()
      const createdUser = newUsers[0]
      if (!createdUser) {
        throw new HTTPException(500, { message: 'Failed to create user' })
      }
      user = createdUser

      // 初回ユーザー: 新規プロジェクトを自動作成
      const newProjects = await db
        .insert(projects)
        .values({
          ownerId: user.id,
          name: 'My First Project',
        })
        .returning()
      const project = newProjects[0]
      if (!project) {
        throw new HTTPException(500, { message: 'Failed to create project' })
      }

      // FileTreeDocを作成
      await db.insert(fileTreeDocs).values({
        projectId: project.id,
        doc: EMPTY_CRDT_DOC,
      })
    }

    // トークンペアを発行
    const tokenPair = await signTokenPair(user.id, user.email, privateKey)
    const isProduction = appEnv !== 'development'

    // Cookieを設定
    setCookie(c, 'access_token', tokenPair.accessToken, getAccessTokenCookieOptions(isProduction))
    setCookie(c, 'refresh_token', tokenPair.refreshToken, getRefreshTokenCookieOptions(isProduction))

    authLogger.loginSuccess(user.id, 'dev-login', ip, userAgent, requestId)

    return c.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
      },
    })
  }
)

/**
 * POST /api/auth/login
 * Google OAuthログイン
 */
auth.post(
  '/login',
  describeRoute({
    tags: ['認証'],
    summary: 'Google OAuthログイン',
    description: 'Google IDトークンを使用してログインする。ステージング/本番環境のみ。',
    responses: {
      200: {
        description: 'ログイン成功',
        content: { 'application/json': { schema: resolver(loginResponseSchema) } },
      },
      401: { description: '認証失敗' },
      404: { description: '開発環境ではエンドポイント無効' },
    },
  }),
  validator('json', loginRequestSchema),
  async (c) => {
    const appEnv = c.env.APP_ENV || 'development'
    const requestId = c.get('requestId')
    const ip = getClientIp(c.req.raw.headers)
    const userAgent = c.req.header('user-agent')

    // 開発環境でもGOOGLE_CLIENT_IDが設定されていればGoogle OAuthを許可
    // （設定がない場合のみ404を返す）
    const googleClientId = c.env.GOOGLE_CLIENT_ID
    if (appEnv === 'development' && !googleClientId) {
      authLogger.loginFailure(undefined, 'google-oauth in development without config', ip, userAgent, requestId)
      throw new HTTPException(404, { message: 'Not Found' })
    }

    const { idToken } = c.req.valid('json')
    const privateKey = c.env.JWT_PRIVATE_KEY

    if (!googleClientId || !privateKey) {
      throw new HTTPException(500, { message: 'OAuth configuration is missing' })
    }

    // Google IDトークンを検証
    let googleUser: { sub: string; email: string; name: string }
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      )
      if (!response.ok) {
        throw new Error('Invalid ID token')
      }
      const tokenInfo = (await response.json()) as {
        aud: string
        sub: string
        email: string
        name?: string
      }

      // クライアントIDの検証
      if (tokenInfo.aud !== googleClientId) {
        throw new Error('Invalid audience')
      }

      googleUser = {
        sub: tokenInfo.sub,
        email: tokenInfo.email,
        name: tokenInfo.name || tokenInfo.email.split('@')[0] || 'User',
      }
    } catch {
      authLogger.loginFailure(undefined, 'invalid-google-token', ip, userAgent, requestId)
      throw new HTTPException(401, { message: 'Invalid ID token' })
    }

    const db = createDb(c.env.DATABASE_URL!)

    // ユーザーを検索または作成
    let existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.googleId, googleUser.sub))
      .limit(1)

    let user = existingUsers[0]

    if (!user) {
      // 新規ユーザー作成
      const newUsers = await db
        .insert(users)
        .values({
          googleId: googleUser.sub,
          email: googleUser.email,
          name: googleUser.name,
        })
        .returning()
      const createdUser = newUsers[0]
      if (!createdUser) {
        throw new HTTPException(500, { message: 'Failed to create user' })
      }
      user = createdUser

      // 初回ユーザー: 新規プロジェクトを自動作成
      const newProjects = await db
        .insert(projects)
        .values({
          ownerId: user.id,
          name: 'My First Project',
        })
        .returning()
      const project = newProjects[0]
      if (!project) {
        throw new HTTPException(500, { message: 'Failed to create project' })
      }

      // FileTreeDocを作成
      await db.insert(fileTreeDocs).values({
        projectId: project.id,
        doc: EMPTY_CRDT_DOC,
      })
    }

    // トークンペアを発行
    const tokenPair = await signTokenPair(user.id, user.email, privateKey)
    const isProduction = appEnv === 'production'

    // Cookieを設定
    setCookie(c, 'access_token', tokenPair.accessToken, getAccessTokenCookieOptions(isProduction))
    setCookie(c, 'refresh_token', tokenPair.refreshToken, getRefreshTokenCookieOptions(isProduction))

    authLogger.loginSuccess(user.id, 'google-oauth', ip, userAgent, requestId)

    return c.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
      },
    })
  }
)

/**
 * POST /api/auth/logout
 * ログアウト
 */
auth.post(
  '/logout',
  describeRoute({
    tags: ['認証'],
    summary: 'ログアウト',
    description: 'セッションを終了し、Cookieを削除する。',
    responses: {
      204: { description: 'ログアウト成功' },
    },
  }),
  async (c) => {
    const appEnv = c.env.APP_ENV || 'development'
    const isProduction = appEnv === 'production'
    const requestId = c.get('requestId')

    // ユーザーIDを取得（ログのため）
    const accessToken = getCookie(c, 'access_token')
    let userId: string | undefined
    if (accessToken && c.env.JWT_PUBLIC_KEY) {
      try {
        const payload = await verifyAccessToken(accessToken, c.env.JWT_PUBLIC_KEY)
        userId = payload.sub
      } catch {
        // トークン検証失敗は無視（ログアウト処理は続行）
      }
    }

    // Cookieを削除
    deleteCookie(c, 'access_token', getDeleteCookieOptions(isProduction))
    deleteCookie(c, 'refresh_token', getDeleteCookieOptions(isProduction))

    if (userId) {
      authLogger.logout(userId, requestId)
    }

    return c.body(null, 204)
  }
)

/**
 * POST /api/auth/refresh
 * トークンリフレッシュ
 */
auth.post(
  '/refresh',
  describeRoute({
    tags: ['認証'],
    summary: 'トークンリフレッシュ',
    description: 'リフレッシュトークンを使用してアクセストークンを更新する。',
    responses: {
      200: {
        description: 'リフレッシュ成功',
        content: { 'application/json': { schema: resolver(refreshResponseSchema) } },
      },
      401: { description: '無効なリフレッシュトークン' },
    },
  }),
  async (c) => {
    const appEnv = c.env.APP_ENV || 'development'
    const requestId = c.get('requestId')
    const ip = getClientIp(c.req.raw.headers)
    const userAgent = c.req.header('user-agent')

    const refreshToken = getCookie(c, 'refresh_token')
    if (!refreshToken) {
      authLogger.invalidToken(ip, userAgent, 'missing refresh token', requestId)
      throw new HTTPException(401, { message: 'Refresh token required' })
    }

    const publicKey = c.env.JWT_PUBLIC_KEY
    const privateKey = c.env.JWT_PRIVATE_KEY
    if (!publicKey || !privateKey) {
      throw new HTTPException(500, { message: 'JWT configuration is missing' })
    }

    // リフレッシュトークンを検証
    let payload
    try {
      payload = await verifyRefreshToken(refreshToken, publicKey)
    } catch {
      authLogger.invalidToken(ip, userAgent, 'invalid refresh token', requestId)
      throw new HTTPException(401, { message: 'Invalid refresh token' })
    }

    const db = createDb(c.env.DATABASE_URL!)

    // ユーザーを取得
    const existingUsers = await db.select().from(users).where(eq(users.id, payload.sub!)).limit(1)
    const user = existingUsers[0]

    if (!user) {
      authLogger.invalidToken(ip, userAgent, 'user not found', requestId)
      throw new HTTPException(401, { message: 'User not found' })
    }

    // 新しいトークンペアを発行（ローテーション）
    const tokenPair = await signTokenPair(user.id, user.email, privateKey)
    const isProduction = appEnv === 'production'

    // Cookieを更新
    setCookie(c, 'access_token', tokenPair.accessToken, getAccessTokenCookieOptions(isProduction))
    setCookie(c, 'refresh_token', tokenPair.refreshToken, getRefreshTokenCookieOptions(isProduction))

    authLogger.tokenRefresh(user.id, requestId)

    return c.json({
      data: {},
    })
  }
)

/**
 * GET /api/auth/me
 * 現在のユーザー情報取得
 */
auth.get(
  '/me',
  describeRoute({
    tags: ['認証'],
    summary: '現在のユーザー情報取得',
    description: '認証済みユーザーの情報を取得する。',
    responses: {
      200: {
        description: 'ユーザー情報取得成功',
        content: { 'application/json': { schema: resolver(meResponseSchema) } },
      },
      401: { description: '未認証' },
    },
  }),
  async (c) => {
    const requestId = c.get('requestId')
    const ip = getClientIp(c.req.raw.headers)
    const userAgent = c.req.header('user-agent')

    const accessToken = getCookie(c, 'access_token')
    if (!accessToken) {
      authLogger.invalidToken(ip, userAgent, 'missing access token', requestId)
      throw new HTTPException(401, { message: 'Authentication required' })
    }

    const publicKey = c.env.JWT_PUBLIC_KEY
    if (!publicKey) {
      throw new HTTPException(500, { message: 'JWT configuration is missing' })
    }

    // アクセストークンを検証
    let payload
    try {
      payload = await verifyAccessToken(accessToken, publicKey)
    } catch {
      authLogger.invalidToken(ip, userAgent, 'invalid access token', requestId)
      throw new HTTPException(401, { message: 'Invalid access token' })
    }

    const db = createDb(c.env.DATABASE_URL!)

    // ユーザーを取得
    const existingUsers = await db.select().from(users).where(eq(users.id, payload.sub!)).limit(1)
    const user = existingUsers[0]

    if (!user) {
      authLogger.invalidToken(ip, userAgent, 'user not found', requestId)
      throw new HTTPException(401, { message: 'User not found' })
    }

    return c.json({
      data: {
        id: user.id,
        email: user.email,
      },
    })
  }
)

export default auth
