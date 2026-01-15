'use client'

/**
 * セッション期限切れ警告
 *
 * セッション期限24時間前に警告を表示し、エクスポート導線を提供
 */

import { useAuth } from '@/features/auth/context'

export function SessionExpiryWarning() {
  const { sessionExpiryWarning, dismissSessionWarning } = useAuth()

  if (!sessionExpiryWarning) {
    return null
  }

  return (
    <div
      role="alert"
      data-testid="session-expiry-warning"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fef3c7',
        borderBottom: '1px solid #f59e0b',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '14px', color: '#92400e' }}>
          セッションがまもなく期限切れになります。データをエクスポートしてください。
        </span>
        <button
          type="button"
          style={{
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
          data-testid="export-button"
        >
          ZIPエクスポート
        </button>
      </div>
      <button
        type="button"
        onClick={dismissSessionWarning}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          fontSize: '18px',
          color: '#92400e',
        }}
        aria-label="閉じる"
        data-testid="dismiss-warning"
      >
        ×
      </button>
    </div>
  )
}
