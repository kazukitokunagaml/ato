/**
 * 環境変数ヘルパー
 */

export type AppEnv = 'development' | 'staging' | 'production'

/**
 * 現在の環境を取得
 */
export function getAppEnv(): AppEnv {
  const env = process.env.NEXT_PUBLIC_APP_ENV || 'development'
  if (env === 'staging' || env === 'production') {
    return env
  }
  return 'development'
}

/**
 * 開発環境かどうか
 */
export function isDevelopment(): boolean {
  return getAppEnv() === 'development'
}

/**
 * 本番環境かどうか
 */
export function isProduction(): boolean {
  return getAppEnv() === 'production'
}
