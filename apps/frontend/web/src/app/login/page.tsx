'use client'

/**
 * ログイン画面（SC-01）
 *
 * - 本番/ステージング: Google OAuthログインボタン
 * - 開発環境: 開発ログインボタン + Google OAuthボタン（両方表示）
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/context'
import { useGoogleSignIn } from '@/features/auth/hooks/useGoogleSignIn'

export default function LoginPage() {
  const { status, login: devLogin, loginWithGoogle } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDev, setIsDev] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement>(null)

  // クライアントサイドで環境を判定
  useEffect(() => {
    // クライアントサイドでは NEXT_PUBLIC_APP_ENV を使用
    const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development'
    setIsDev(appEnv === 'development')
  }, [])

  // Google Client ID（環境変数から取得）
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

  /**
   * Google OAuth 成功時のコールバック
   */
  const handleGoogleSuccess = useCallback(
    async (idToken: string) => {
      setIsLoading(true)
      setError(null)

      try {
        await loginWithGoogle(idToken)
        router.replace('/')
      } catch (err) {
        console.error('Google login error:', err)
        setError('ログインに失敗しました。もう一度お試しください。')
      } finally {
        setIsLoading(false)
      }
    },
    [loginWithGoogle, router]
  )

  /**
   * Google OAuth エラー時のコールバック
   */
  const handleGoogleError = useCallback((err: Error) => {
    console.error('Google Sign-In error:', err)
    setError(err.message || 'Google ログインに失敗しました')
    setIsLoading(false)
  }, [])

  // Google Sign-In フック（renderButton 方式）
  const { isReady: isGoogleReady } = useGoogleSignIn({
    clientId: googleClientId,
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    buttonRef: googleButtonRef,
  })

  // 認証済みならメイン画面へ
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/')
    }
  }, [status, router])

  /**
   * 開発環境用ログイン
   */
  const handleDevLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await devLogin()
      router.replace('/')
    } catch (err) {
      setError('ログインに失敗しました')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // ローディング中（認証状態確認中）
  if (status === 'loading') {
    return (
      <main
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <p>Loading...</p>
      </main>
    )
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#f9fafb',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '48px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          minWidth: '320px',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#111827',
          }}
        >
          ato
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '32px',
          }}
        >
          シンプルなコードエディター
        </p>

        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px',
              color: '#dc2626',
              fontSize: '14px',
            }}
            data-testid="login-error"
          >
            {error}
          </div>
        )}

        {/* Google ログインボタン（GIS renderButton） */}
        {googleClientId && (
          <div
            ref={googleButtonRef}
            style={{
              display: 'flex',
              justifyContent: 'center',
              minHeight: '44px',
            }}
            data-testid="google-login-button"
          >
            {!isGoogleReady && (
              <span style={{ color: '#9ca3af', fontSize: '14px' }}>
                読み込み中...
              </span>
            )}
          </div>
        )}

        {/* 開発環境用ログインボタン */}
        {isDev && (
          <>
            {googleClientId && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '16px 0',
                  color: '#9ca3af',
                  fontSize: '12px',
                }}
              >
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
                <span style={{ padding: '0 12px' }}>または</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
              </div>
            )}
            <button
              type="button"
              onClick={handleDevLogin}
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
              }}
              data-testid="dev-login-button"
            >
              {isLoading ? 'ログイン中...' : '開発ログイン'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
