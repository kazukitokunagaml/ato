/**
 * API クライアント
 *
 * @ato/shared の型定義を使用してバックエンドと型を同期
 */

import type {
  DevLoginResponse,
  LoginRequest,
  LoginResponse,
  MeResponse,
  RefreshResponse,
} from '@ato/shared'

export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

/**
 * API レスポンスをパースして返す
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text().catch(() => 'Unknown error')
    throw new ApiClientError(response.status, message)
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

/**
 * 開発用ログイン
 */
export async function devLogin(): Promise<DevLoginResponse> {
  const response = await fetch('/api/auth/dev-login', {
    method: 'POST',
    credentials: 'include',
  })
  return handleResponse(response)
}

/**
 * Google OAuth ログイン
 */
export async function login(idToken: LoginRequest['idToken']): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  })
  return handleResponse(response)
}

/**
 * ログアウト
 */
export async function logout(): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })
  return handleResponse(response)
}

/**
 * トークンリフレッシュ
 */
export async function refresh(): Promise<RefreshResponse> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })
  return handleResponse(response)
}

/**
 * 現在のユーザー情報を取得
 */
export async function getMe(): Promise<MeResponse> {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
  })
  return handleResponse(response)
}
