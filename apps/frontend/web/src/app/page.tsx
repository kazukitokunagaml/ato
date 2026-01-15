'use client'

import { AuthGuard } from '@/components/auth'
import { useAuth } from '@/features/auth/context'

function MainContent() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'white',
        }}
      >
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>ato</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }} data-testid="user-email">
            {user?.email}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #d1d5db',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              color: '#374151',
            }}
            data-testid="logout-button"
          >
            ログアウト
          </button>
        </div>
      </header>
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f9fafb',
        }}
      >
        <p style={{ color: '#9ca3af' }}>エディター（未実装）</p>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <AuthGuard>
      <MainContent />
    </AuthGuard>
  )
}
