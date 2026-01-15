'use client'

/**
 * 認証コンテキスト
 *
 * 認証状態の管理とセッション期限警告を提供
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import * as api from '@/infrastructure/api/client'

export interface User {
  id: string
  email: string
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  /** 開発環境用ログイン */
  login: () => Promise<void>
  /** Google OAuth ログイン */
  loginWithGoogle: (idToken: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  sessionExpiryWarning: boolean
  dismissSessionWarning: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// セッション期限警告を表示する閾値（24時間 = 86400000ms）
const SESSION_WARNING_THRESHOLD_MS = 24 * 60 * 60 * 1000
// リフレッシュトークンの有効期限（7日 = 604800000ms）
const REFRESH_TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000
// ローカルストレージキー
const AUTH_TIMESTAMP_KEY = 'ato:auth_timestamp'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [sessionExpiryWarning, setSessionExpiryWarning] = useState(false)
  const [warningDismissed, setWarningDismissed] = useState(false)

  /**
   * 認証状態を確認
   */
  const checkAuth = useCallback(async () => {
    try {
      const response = await api.getMe()
      setUser(response.data)
      setStatus('authenticated')
    } catch (error) {
      if (error instanceof api.ApiClientError && error.status === 401) {
        // 401の場合はリフレッシュを試みる
        try {
          await api.refresh()
          const response = await api.getMe()
          setUser(response.data)
          setStatus('authenticated')
        } catch {
          setUser(null)
          setStatus('unauthenticated')
          localStorage.removeItem(AUTH_TIMESTAMP_KEY)
        }
      } else {
        setUser(null)
        setStatus('unauthenticated')
      }
    }
  }, [])

  /**
   * ログイン処理（開発環境用）
   */
  const login = useCallback(async () => {
    const response = await api.devLogin()
    setUser(response.data.user)
    setStatus('authenticated')
    // 認証タイムスタンプを保存（セッション期限警告用）
    localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString())
    setWarningDismissed(false)
  }, [])

  /**
   * Google OAuth ログイン処理
   */
  const loginWithGoogle = useCallback(async (idToken: string) => {
    const response = await api.login(idToken)
    setUser(response.data.user)
    setStatus('authenticated')
    // 認証タイムスタンプを保存（セッション期限警告用）
    localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString())
    setWarningDismissed(false)
  }, [])

  /**
   * ログアウト処理
   */
  const logout = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      // ログアウトAPIが失敗してもローカル状態はクリア
    }
    setUser(null)
    setStatus('unauthenticated')
    localStorage.removeItem(AUTH_TIMESTAMP_KEY)
    setSessionExpiryWarning(false)
  }, [])

  /**
   * セッション警告を閉じる
   */
  const dismissSessionWarning = useCallback(() => {
    setWarningDismissed(true)
    setSessionExpiryWarning(false)
  }, [])

  /**
   * セッション期限をチェック
   */
  const checkSessionExpiry = useCallback(() => {
    if (warningDismissed) return

    const authTimestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY)
    if (!authTimestamp) return

    const authTime = parseInt(authTimestamp, 10)
    const expiryTime = authTime + REFRESH_TOKEN_LIFETIME_MS
    const timeUntilExpiry = expiryTime - Date.now()

    if (timeUntilExpiry <= SESSION_WARNING_THRESHOLD_MS && timeUntilExpiry > 0) {
      setSessionExpiryWarning(true)
    }
  }, [warningDismissed])

  // 初期認証チェック
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // セッション期限を定期的にチェック（1分ごと）
  useEffect(() => {
    if (status !== 'authenticated') return

    checkSessionExpiry()
    const interval = setInterval(checkSessionExpiry, 60000)

    return () => clearInterval(interval)
  }, [status, checkSessionExpiry])

  const value: AuthContextValue = {
    user,
    status,
    login,
    loginWithGoogle,
    logout,
    checkAuth,
    sessionExpiryWarning,
    dismissSessionWarning,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
