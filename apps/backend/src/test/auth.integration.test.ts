/**
 * 認証API結合テスト
 *
 * テスト設計書 IT-API-01〜07 に準拠
 */

import { describe, it, expect, beforeEach, beforeAll, vi, afterEach } from 'vitest'
import { getTestDb, clearTables } from './helpers'
import * as schema from '../db/schema'

// テスト用のRS256キーペア（テスト環境でのみ使用）
const TEST_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCVXdZlXnaxFqwi
zhJ1vQUPWW8Kd9neEdAEw3YM9sLE296D5gjS3A7YyKYLqF+a/Pu/wuZxvAT9em4c
CmaPJz08XL3lf7fR+MrdXgAApqhyu2RfjGufNA2BIZcYN/5MC3sRaEF3iNWutbOR
/MJ6yV3maOdX3qLVQCzDeNlMEFXwZPiKOBOOV50YbtCMmR+zNs6Q5WggKPUB4qfY
RVGQOZUzu/yWVvyh6YN+xgN3Nnie/a3Zd2K63iXV8DxgfQp8FynGxmvJfjjXLoC/
+gHOfY+l4m+2RREc64tyB+cf0nukHx40qqjD4CaNoLD3draz0mCEzn1+aMoEvzt9
MLebH54TAgMBAAECggEAAWkZjITrJ22SSMfcA8TTs4GBzqSZtM+qDVZDmwhV7lVk
BHUOxN/M7uSO/atkfIqCd1A7X3wwXeAJaML7LsOAZnDUkdv2NYm21lO8Oau/o0m8
WNMMjYkImzbg5IEodrmUoXInGbf7yjXid4pebQA4a0pQhcab9tovmG75Olv2VWbs
nANZYoG/jRqlfoc5W2hdl2zcHiX42U7Q2mWlWmp1INgkgpCKiMC2690IDb3TDI5U
KkwoqTkh+xLDUig/zU3U6uOatgggRXFDFvYNw0fVBeg6ig+lIBa3wrCnKyDHG48P
YTaQKTMzdWXUHDxbPXerkgPRjuzppQISCNSUaPQKQQKBgQDFR0Ho+XI/JcFuOzIU
Lri7Lzs1tyGVaqpWjlq8cHXls2MUe+cvOP3cfpv8Z4h5911YvP+0bkQZZuIwTJQK
WmXPtQlqpzneY9rFg3UbL4jrvPPvFFvLyVSg9oPMt9zadmnZVlH41QCuQ5svBJze
ERfWui/47BTHlAM2K2y2BhCuQQKBgQDB06tB7dB0TdgH3bNd+9FCKuteSzWzsQES
XoQP/Xgts4a3FZN1WVj8wbl4SO+kkp9p6AIkcQEgFD5SLlADVgECaTansMp+nYuu
5oGKXZpiFYAVYW6CSFyyY9mzqp5g94jz2R3rja8XanS7NfTod9SKVdqhYkaJkShL
GYFPqc1fUwKBgGYzpFGt6SINzUfuIuOR0OIodeQ+G4fs2pI87YTyPiHh7VKPXhV4
0QuKDAWXHX0SSanPQCmZdm4yfrvG8GrsqhIRF+/I8pHj6VKp5+FNnwGBwl35jhTl
GJLLIzzLg/8pmWye65idwNyG6b5SBXKGKHN1waSTqbA7Xe6SUJ98ROgBAoGBAI/o
KhTPDp/rU+OzNQMofdtUpl/iE0MQviz3Q7HjjSDRU8oHGO5dofY3lw65iEN2ISmu
eji4Ng+tOAAoJnvzlNhHaa7jUdTj/9uhhLhIeuEr+WbmafgM5dYE0JPWr7Rq1KHH
p7FGBqOqBHUiwG0A2yrCR4revmRRA8uOajXNao/FAoGAI41h/Y0mQYkRFQ7dezTH
wnVVRqlw4ENY/+22XsrmDUmFVbDzRzAtoLy9JjVLGDMDEcndLKjlXR/5lVTm6Rxz
s9SoSyZhCqu1g4oMXHBGexEv2BndDFsXmqRYrgt6e47T0SbWpUUYlwPZ35/SRX11
RE5WSsFP2jRc6Pjmw0K8bV4=
-----END PRIVATE KEY-----`

const TEST_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlV3WZV52sRasIs4Sdb0F
D1lvCnfZ3hHQBMN2DPbCxNveg+YI0twO2MimC6hfmvz7v8LmcbwE/XpuHApmjyc9
PFy95X+30fjK3V4AAKaocrtkX4xrnzQNgSGXGDf+TAt7EWhBd4jVrrWzkfzCesld
5mjnV96i1UAsw3jZTBBV8GT4ijgTjledGG7QjJkfszbOkOVoICj1AeKn2EVRkDmV
M7v8llb8oemDfsYDdzZ4nv2t2Xdiut4l1fA8YH0KfBcpxsZryX441y6Av/oBzn2P
peJvtkURHOuLcgfnH9J7pB8eNKqow+AmjaCw93a2s9JghM59fmjKBL87fTC3mx+e
EwIDAQAB
-----END PUBLIC KEY-----`

/**
 * Set-Cookieヘッダーから指定されたCookieの値のみを抽出する
 * Set-Cookieの形式: "name=value; Path=/api; HttpOnly; ..."
 * @param setCookieHeader Set-Cookieヘッダーの値（複数Cookieはカンマ区切り）
 * @param cookieName 抽出するCookie名
 * @returns Cookie値（"name=value"形式）またはnull
 */
function extractCookie(setCookieHeader: string | null, cookieName: string): string | null {
  if (!setCookieHeader) return null

  // Set-Cookieヘッダーは複数のCookieがカンマで区切られている場合がある
  // ただし、Expiresの日付にもカンマが含まれるため注意が必要
  // Honoは複数のSet-Cookieを1つの文字列にまとめる
  const cookies = setCookieHeader.split(/,(?=[^;]*=)/)

  for (const cookie of cookies) {
    const parts = cookie.trim().split(';')
    const nameValue = parts[0]?.trim()
    if (!nameValue) continue
    const [name] = nameValue.split('=')
    if (name === cookieName) {
      return nameValue // "name=value"形式で返す
    }
  }
  return null
}

// テスト用のアプリケーションを作成
async function createTestApp() {
  // 動的インポートでアプリを取得
  const { default: app } = await import('../index')
  return app
}

describe('認証API結合テスト', () => {
  let db: ReturnType<typeof getTestDb>

  beforeAll(async () => {
    db = getTestDb()
  })

  beforeEach(async () => {
    await clearTables(db)
  })

  describe('IT-API-01: POST /api/auth/dev-login', () => {
    it('開発環境で200とトークン発行、Cookie設定', async () => {
      // テストユーザーを作成（dev-loginが期待するgoogleId形式で作成）
      await db.insert(schema.users).values({
        id: '00000001-0001-4000-8000-000000000001',
        googleId: 'dev-test@example.com', // dev-login が生成する形式: `dev-${email}`
        email: 'test@example.com',
        name: 'Test User',
      })

      const app = await createTestApp()

      const res = await app.request('/api/auth/dev-login', {
        method: 'POST',
      }, {
        APP_ENV: 'development',
        DEV_USER_EMAIL: 'test@example.com',
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        JWT_PUBLIC_KEY: TEST_PUBLIC_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(200)

      const json = await res.json() as { data: { user: { id: string; email: string } } }
      expect(json).toHaveProperty('data')
      expect(json.data).toHaveProperty('user')
      expect(json.data.user).toHaveProperty('id')
      expect(json.data.user).toHaveProperty('email')

      // Cookieの確認
      const cookies = res.headers.get('set-cookie')
      expect(cookies).toBeTruthy()
    })
  })

  describe('IT-API-02: POST /api/auth/dev-login in production', () => {
    it('本番環境では404を返す', async () => {
      const app = await createTestApp()

      const res = await app.request('/api/auth/dev-login', {
        method: 'POST',
      }, {
        APP_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(404)
    })
  })

  describe('IT-API-03: POST /api/auth/logout', () => {
    it('ログアウトで204とCookie削除', async () => {
      const app = await createTestApp()

      const res = await app.request('/api/auth/logout', {
        method: 'POST',
      }, {
        APP_ENV: 'development',
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(204)

      // Cookie削除の確認（max-age=0またはexpires=past）
      const cookies = res.headers.get('set-cookie')
      // Cookieがセットされる（削除用）
      expect(cookies).toBeTruthy()
    })
  })

  describe('IT-API-04: POST /api/auth/refresh with valid token', () => {
    it('有効なリフレッシュトークンで200と新トークンペア（トークンローテーション）', async () => {
      const app = await createTestApp()
      const env = {
        APP_ENV: 'development',
        DEV_USER_EMAIL: 'refresh-test@example.com',
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        JWT_PUBLIC_KEY: TEST_PUBLIC_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      }

      // 1. まずdev-loginでトークンを取得
      const loginRes = await app.request('/api/auth/dev-login', {
        method: 'POST',
      }, env)

      expect(loginRes.status).toBe(200)
      const loginSetCookie = loginRes.headers.get('set-cookie')
      expect(loginSetCookie).toBeTruthy()

      // リフレッシュトークンを抽出
      const refreshToken = extractCookie(loginSetCookie, 'refresh_token')
      expect(refreshToken).toBeTruthy()

      // 2. リフレッシュトークンで新しいトークンを取得
      const res = await app.request('/api/auth/refresh', {
        method: 'POST',
        headers: {
          Cookie: refreshToken!,
        },
      }, env)

      expect(res.status).toBe(200)

      // 新しいトークンがセットされている
      const newSetCookie = res.headers.get('set-cookie')
      expect(newSetCookie).toBeTruthy()

      // 新しいアクセストークンとリフレッシュトークンが発行されている
      const newAccessToken = extractCookie(newSetCookie, 'access_token')
      const newRefreshToken = extractCookie(newSetCookie, 'refresh_token')
      expect(newAccessToken).toBeTruthy()
      expect(newRefreshToken).toBeTruthy()

      // レスポンスボディ（refreshは空のdataを返す）
      const json = await res.json() as { data: Record<string, never> }
      expect(json).toHaveProperty('data')
    })
  })

  describe('IT-API-05: POST /api/auth/refresh with invalid token', () => {
    it('無効なリフレッシュトークンで401', async () => {
      const app = await createTestApp()

      const res = await app.request('/api/auth/refresh', {
        method: 'POST',
        headers: {
          Cookie: 'refresh_token=invalid-token',
        },
      }, {
        APP_ENV: 'development',
        JWT_PUBLIC_KEY: TEST_PUBLIC_KEY,
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(401)
    })
  })

  describe('IT-API-06: GET /api/auth/me with authenticated user', () => {
    it('認証済みユーザーで200とユーザー情報', async () => {
      const app = await createTestApp()
      const env = {
        APP_ENV: 'development',
        DEV_USER_EMAIL: 'me-test@example.com',
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        JWT_PUBLIC_KEY: TEST_PUBLIC_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      }

      // 1. まずdev-loginでトークンを取得
      const loginRes = await app.request('/api/auth/dev-login', {
        method: 'POST',
      }, env)

      expect(loginRes.status).toBe(200)

      // Set-Cookieヘッダーからアクセストークンを抽出（属性を除去）
      const setCookieHeader = loginRes.headers.get('set-cookie')
      expect(setCookieHeader).toBeTruthy()

      // アクセストークンのみを抽出してCookieヘッダー形式に変換
      const accessToken = extractCookie(setCookieHeader, 'access_token')
      expect(accessToken).toBeTruthy()

      // 2. 取得したCookieで/api/auth/meを呼ぶ
      const res = await app.request('/api/auth/me', {
        method: 'GET',
        headers: {
          Cookie: accessToken!,
        },
      }, env)

      expect(res.status).toBe(200)

      const json = await res.json() as { data: { id: string; email: string } }
      expect(json).toHaveProperty('data')
      expect(json.data).toHaveProperty('id')
      expect(json.data).toHaveProperty('email')
      expect(json.data.email).toBe('me-test@example.com')
    })
  })

  describe('IT-API-07: GET /api/auth/me without authentication', () => {
    it('未認証で401', async () => {
      const app = await createTestApp()

      const res = await app.request('/api/auth/me', {
        method: 'GET',
      }, {
        APP_ENV: 'development',
        JWT_PUBLIC_KEY: TEST_PUBLIC_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(401)
    })
  })

  describe('IT-API-08: dev-login初回ユーザー作成フロー', () => {
    it('新規ユーザーの場合、ユーザー・プロジェクト・file_tree_docsが自動作成される', async () => {
      const app = await createTestApp()
      const newUserEmail = 'brand-new-user@example.com'

      const env = {
        APP_ENV: 'development',
        DEV_USER_EMAIL: newUserEmail,
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        JWT_PUBLIC_KEY: TEST_PUBLIC_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      }

      // DBに該当ユーザーがいないことを確認
      const allUsersBefore = await db.select().from(schema.users)
      const userExistsBefore = allUsersBefore.some(u => u.email === newUserEmail)
      expect(userExistsBefore).toBe(false)

      // dev-loginを実行
      const res = await app.request('/api/auth/dev-login', {
        method: 'POST',
      }, env)

      expect(res.status).toBe(200)

      // ユーザーが作成されたことを確認
      const allUsersAfter = await db.select().from(schema.users)
      const createdUser = allUsersAfter.find(u => u.email === newUserEmail)
      expect(createdUser).toBeDefined()

      // プロジェクトが作成されたことを確認
      const projects = await db.select().from(schema.projects)
      const userProject = projects.find(p => p.ownerId === createdUser!.id)
      expect(userProject).toBeDefined()

      // file_tree_docsが作成されたことを確認
      const fileTreeDocs = await db.select().from(schema.fileTreeDocs)
      const projectFileTree = fileTreeDocs.find(f => f.projectId === userProject!.id)
      expect(projectFileTree).toBeDefined()
    })
  })

  // ========================================
  // エラーケース・環境別テスト
  // ========================================

  describe('dev-login エラーケース', () => {
    it('APP_ENV=staging で 404', async () => {
      const app = await createTestApp()

      const res = await app.request('/api/auth/dev-login', {
        method: 'POST',
      }, {
        APP_ENV: 'staging',
        DEV_USER_EMAIL: 'test@example.com',
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(404)
    })

    it('DEV_USER_EMAIL 未設定で 500', async () => {
      const app = await createTestApp()

      const res = await app.request('/api/auth/dev-login', {
        method: 'POST',
      }, {
        APP_ENV: 'development',
        // DEV_USER_EMAIL: 未設定
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(500)
    })

    it('JWT_PRIVATE_KEY 未設定で 500', async () => {
      const app = await createTestApp()

      const res = await app.request('/api/auth/dev-login', {
        method: 'POST',
      }, {
        APP_ENV: 'development',
        DEV_USER_EMAIL: 'test@example.com',
        // JWT_PRIVATE_KEY: 未設定
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(500)
    })
  })

  describe('refresh エラーケース', () => {
    it('JWT_PUBLIC_KEY 未設定で 500', async () => {
      const app = await createTestApp()

      const res = await app.request('/api/auth/refresh', {
        method: 'POST',
        headers: {
          Cookie: 'refresh_token=some-token',
        },
      }, {
        APP_ENV: 'development',
        // JWT_PUBLIC_KEY: 未設定
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(500)
    })

    it('JWT_PRIVATE_KEY 未設定で 500', async () => {
      const app = await createTestApp()
      const env = {
        APP_ENV: 'development',
        DEV_USER_EMAIL: 'refresh-error-test@example.com',
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        JWT_PUBLIC_KEY: TEST_PUBLIC_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      }

      // まずログインしてトークンを取得
      const loginRes = await app.request('/api/auth/dev-login', {
        method: 'POST',
      }, env)
      const refreshToken = extractCookie(loginRes.headers.get('set-cookie'), 'refresh_token')

      // JWT_PRIVATE_KEY 未設定でリフレッシュ
      const res = await app.request('/api/auth/refresh', {
        method: 'POST',
        headers: {
          Cookie: refreshToken!,
        },
      }, {
        APP_ENV: 'development',
        JWT_PUBLIC_KEY: TEST_PUBLIC_KEY,
        // JWT_PRIVATE_KEY: 未設定
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(500)
    })

    it('トークン有効だがユーザー不在で 401', async () => {
      const app = await createTestApp()
      const env = {
        APP_ENV: 'development',
        DEV_USER_EMAIL: 'will-be-deleted@example.com',
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        JWT_PUBLIC_KEY: TEST_PUBLIC_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      }

      // ログインしてトークンを取得
      const loginRes = await app.request('/api/auth/dev-login', {
        method: 'POST',
      }, env)
      const refreshToken = extractCookie(loginRes.headers.get('set-cookie'), 'refresh_token')

      // ユーザーをDBから削除
      await db.delete(schema.projects) // 外部キー制約のため先にprojectsを削除
      await db.delete(schema.users)

      // トークンは有効だがユーザーが存在しない
      const res = await app.request('/api/auth/refresh', {
        method: 'POST',
        headers: {
          Cookie: refreshToken!,
        },
      }, env)

      expect(res.status).toBe(401)
    })
  })

  describe('/api/auth/me エラーケース', () => {
    it('JWT_PUBLIC_KEY 未設定で 500', async () => {
      const app = await createTestApp()

      const res = await app.request('/api/auth/me', {
        method: 'GET',
        headers: {
          Cookie: 'access_token=some-token',
        },
      }, {
        APP_ENV: 'development',
        // JWT_PUBLIC_KEY: 未設定
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(500)
    })

    it('無効アクセストークン（署名不一致）で 401', async () => {
      const app = await createTestApp()

      // 別の鍵で署名されたトークンを使う（ここでは単純に不正なトークンで代用）
      const res = await app.request('/api/auth/me', {
        method: 'GET',
        headers: {
          Cookie: 'access_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInR5cGUiOiJhY2Nlc3MiLCJqdGkiOiJ0ZXN0LWp0aSIsImlhdCI6MTcwNDA2NzIwMCwiZXhwIjoxNzA0MDcwODAwfQ.invalid-signature',
        },
      }, {
        APP_ENV: 'development',
        JWT_PUBLIC_KEY: TEST_PUBLIC_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(401)
    })

    it('改ざんされたトークンで 401', async () => {
      const app = await createTestApp()
      const env = {
        APP_ENV: 'development',
        DEV_USER_EMAIL: 'tamper-test@example.com',
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        JWT_PUBLIC_KEY: TEST_PUBLIC_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      }

      // 正常にログイン
      const loginRes = await app.request('/api/auth/dev-login', {
        method: 'POST',
      }, env)
      const accessToken = extractCookie(loginRes.headers.get('set-cookie'), 'access_token')!

      // トークンを改ざん（payloadの一部を変更）
      const [header, payload, signature] = accessToken.replace('access_token=', '').split('.')
      const tamperedToken = `access_token=${header}.${payload}x.${signature}`

      const res = await app.request('/api/auth/me', {
        method: 'GET',
        headers: {
          Cookie: tamperedToken,
        },
      }, env)

      expect(res.status).toBe(401)
    })
  })

  // ========================================
  // /api/auth/login (Google OAuth) テスト
  // ========================================

  describe('/api/auth/login (Google OAuth)', () => {
    // fetch のオリジナルを保存
    const originalFetch = global.fetch

    afterEach(() => {
      // 各テスト後にfetchを復元
      global.fetch = originalFetch
      vi.restoreAllMocks()
    })

    it('APP_ENV=development で GOOGLE_CLIENT_ID 未設定の場合 404', async () => {
      const app = await createTestApp()

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: 'some-id-token' }),
      }, {
        APP_ENV: 'development',
        // GOOGLE_CLIENT_ID: 未設定
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(404)
    })

    it('APP_ENV=development で GOOGLE_CLIENT_ID 設定済みの場合は認証フローを実行', async () => {
      const app = await createTestApp()

      // GOOGLE_CLIENT_IDが設定されていれば開発環境でもGoogle認証が有効
      // この場合、IDトークン検証で失敗するため500になる（404ではない）
      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: 'invalid-id-token' }),
      }, {
        APP_ENV: 'development',
        GOOGLE_CLIENT_ID: 'test-client-id',
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      })

      // 404ではなく、認証フローが実行される（トークン検証失敗で500）
      expect(res.status).not.toBe(404)
    })

    it('GOOGLE_CLIENT_ID 未設定で 500', async () => {
      const app = await createTestApp()

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: 'some-id-token' }),
      }, {
        APP_ENV: 'staging',
        // GOOGLE_CLIENT_ID: 未設定
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(500)
    })

    it('JWT_PRIVATE_KEY 未設定で 500', async () => {
      const app = await createTestApp()

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: 'some-id-token' }),
      }, {
        APP_ENV: 'staging',
        GOOGLE_CLIENT_ID: 'test-client-id',
        // JWT_PRIVATE_KEY: 未設定
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(500)
    })

    it('idToken 無効（Google API エラー）で 401', async () => {
      // Google API がエラーを返すケースをモック
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid token' }),
      })

      const app = await createTestApp()

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: 'invalid-id-token' }),
      }, {
        APP_ENV: 'staging',
        GOOGLE_CLIENT_ID: 'test-client-id',
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(401)
    })

    it('aud 不一致で 401', async () => {
      // aud が異なるレスポンスをモック
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          aud: 'wrong-client-id',
          sub: 'google-user-123',
          email: 'oauth-user@example.com',
          name: 'OAuth User',
        }),
      })

      const app = await createTestApp()

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: 'valid-token-wrong-aud' }),
      }, {
        APP_ENV: 'staging',
        GOOGLE_CLIENT_ID: 'correct-client-id',
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(401)
    })

    it('正常なOAuthログイン（既存ユーザー）で 200', async () => {
      // 既存ユーザーを作成
      await db.insert(schema.users).values({
        id: '00000001-0001-4000-8000-000000000099',
        googleId: 'google-existing-123',
        email: 'existing-oauth@example.com',
        name: 'Existing OAuth User',
      })

      // Google API 成功レスポンスをモック
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          aud: 'test-client-id',
          sub: 'google-existing-123',
          email: 'existing-oauth@example.com',
          name: 'Existing OAuth User',
        }),
      })

      const app = await createTestApp()

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: 'valid-google-token' }),
      }, {
        APP_ENV: 'staging',
        GOOGLE_CLIENT_ID: 'test-client-id',
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        JWT_PUBLIC_KEY: TEST_PUBLIC_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(200)

      const json = await res.json() as { data: { user: { id: string; email: string } } }
      expect(json.data.user.email).toBe('existing-oauth@example.com')

      // Cookieが設定されている
      const cookies = res.headers.get('set-cookie')
      expect(cookies).toBeTruthy()
      expect(extractCookie(cookies, 'access_token')).toBeTruthy()
      expect(extractCookie(cookies, 'refresh_token')).toBeTruthy()
    })

    it('初回OAuthログイン（新規ユーザー）でユーザー・プロジェクト・file_tree_docs 作成', async () => {
      // Google API 成功レスポンスをモック
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          aud: 'test-client-id',
          sub: 'google-new-user-456',
          email: 'new-oauth-user@example.com',
          name: 'New OAuth User',
        }),
      })

      // DBにこのgoogleIdのユーザーがいないことを確認
      const usersBefore = await db.select().from(schema.users)
      expect(usersBefore.some(u => u.googleId === 'google-new-user-456')).toBe(false)

      const app = await createTestApp()

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: 'valid-google-token-for-new-user' }),
      }, {
        APP_ENV: 'staging',
        GOOGLE_CLIENT_ID: 'test-client-id',
        JWT_PRIVATE_KEY: TEST_PRIVATE_KEY,
        JWT_PUBLIC_KEY: TEST_PUBLIC_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
      })

      expect(res.status).toBe(200)

      const json = await res.json() as { data: { user: { id: string; email: string } } }
      expect(json.data.user.email).toBe('new-oauth-user@example.com')

      // ユーザーが作成されたことを確認
      const usersAfter = await db.select().from(schema.users)
      const createdUser = usersAfter.find(u => u.googleId === 'google-new-user-456')
      expect(createdUser).toBeDefined()
      expect(createdUser!.email).toBe('new-oauth-user@example.com')
      expect(createdUser!.name).toBe('New OAuth User')

      // プロジェクトが作成されたことを確認
      const projects = await db.select().from(schema.projects)
      const userProject = projects.find(p => p.ownerId === createdUser!.id)
      expect(userProject).toBeDefined()
      expect(userProject!.name).toBe('My First Project')

      // file_tree_docsが作成されたことを確認
      const fileTreeDocs = await db.select().from(schema.fileTreeDocs)
      const projectFileTree = fileTreeDocs.find(f => f.projectId === userProject!.id)
      expect(projectFileTree).toBeDefined()
    })
  })
})
