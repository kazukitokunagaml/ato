'use client'

/**
 * 認証ガード
 *
 * 未認証ユーザーをログイン画面にリダイレクト
 */

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/context'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  // ローディング中
  if (status === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <p>Loading...</p>
      </div>
    )
  }

  // 未認証
  if (status === 'unauthenticated') {
    return null
  }

  return <>{children}</>
}
