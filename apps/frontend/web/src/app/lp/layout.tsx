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
    'noteで書いている人のための、下書き・思考整理エディタ。スマホでもPCでも、デバイスを選ばずMarkdownで書き続けられる。',
}

export default function LPLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${bizUD.variable} ${shippori.variable}`}
      style={{ fontFamily: 'var(--font-biz-ud), sans-serif' }}
    >
      {children}
    </div>
  )
}
