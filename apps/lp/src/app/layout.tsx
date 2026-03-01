import type { Metadata } from 'next'
import { BIZ_UDGothic, Shippori_Mincho } from 'next/font/google'

const bizUD = BIZ_UDGothic({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-biz-ud',
})

const shippori = Shippori_Mincho({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-shippori',
})

export const metadata: Metadata = {
  title: 'あと、 — 只々、自然に書くためのアプリ。',
  description:
    'noteで書いている人のための、下書き・思考整理エディタ。スマホでも PCでも、デバイスを選ばずMarkdownで書き続けられる。',
  openGraph: {
    title: 'あと、 — 只々、自然に書くためのアプリ。',
    description: 'noteで書いている人のための、下書き・思考整理エディタ。',
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${bizUD.variable} ${shippori.variable}`}>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#fffffe' }}>
        {children}
      </body>
    </html>
  )
}
