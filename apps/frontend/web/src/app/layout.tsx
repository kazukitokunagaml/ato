import type { Metadata } from 'next'
import { AuthProvider } from '@/features/auth/context'
import { SessionExpiryWarning } from '@/components/auth'

export const metadata: Metadata = {
  title: 'ato',
  description: 'ato editor',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0 }}>
        <AuthProvider>
          <SessionExpiryWarning />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
