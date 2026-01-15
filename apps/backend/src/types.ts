/**
 * バックエンド共通の型定義
 */

// Cloudflare Workers 環境変数（Bindings）
export type Bindings = {
  APP_ENV?: 'development' | 'staging' | 'production'
  DATABASE_URL?: string
  // JWT関連
  JWT_PRIVATE_KEY?: string // RS256秘密鍵（PEM形式）
  JWT_PUBLIC_KEY?: string // RS256公開鍵（PEM形式）
  // 開発環境用
  DEV_USER_EMAIL?: string // dev-login用のメールアドレス
  // Google OAuth
  GOOGLE_CLIENT_ID?: string
}

// Context Variables（リクエストスコープの変数）
export type Variables = {
  userId: string // 認証済みユーザーID
  requestId: string // リクエスト追跡用ID
}

// Hono Context 型
export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}
