import Link from 'next/link'

// ─── デザイントークン ─────────────────────────────────────────────────────────
const c = {
  white: '#fffffe',   // 白
  black: '#373737',   // 墨
  light: '#e4e5e6',   // 白金
  muted: '#bdbebe',   // 薄墨
  blue: '#38a1db',    // 露草
}

const font = {
  gothic: 'var(--font-biz-ud), "BIZ UDGothic", sans-serif',
  mincho: 'var(--font-shippori), "Shippori Mincho", serif',
}

// ─── データ ───────────────────────────────────────────────────────────────────
const problems = [
  {
    label: '場所の壁',
    text: 'スマホ版では機能が制限される。デバイスが変わるたびに、思考が途切れる。',
  },
  {
    label: '疲れるという壁',
    text: '使いこなすのに勉強が必要。UIが複雑で、気がつけば書くより操作に消耗している。',
  },
  {
    label: 'サービスの壁',
    text: '独自形式にロックインされ、外に出せない。データが、自分のものでなくなっている。',
  },
  {
    label: '機能の壁',
    text: 'AI連携やバージョン管理を使うには、エンジニアの知識が必要だと思い込んでいた。',
  },
]

const features = [
  {
    num: '01',
    title: 'データの自由',
    body: 'Markdownで書いて、ZIPで持ち出せる。独自形式のロックインも、サービス停止の不安もない。あなたのデータは、あなたのもの。',
  },
  {
    num: '02',
    title: 'どこでも、途切れない',
    body: '電車でスマホに書いたものが、帰宅したらPCで続きから書ける。オフライン中も書けて、通信が戻れば自動で同期される。',
  },
  {
    num: '03',
    title: '機能は強力でも、勉強いらない',
    body: 'Gitを知らなくてもバージョン管理ができる。AIを使うのにプログラミングはいらない。執筆者に必要な機能を、学習コストゼロで。',
  },
]

// ─── コンポーネント ────────────────────────────────────────────────────────────
function StartButton({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const isMd = size === 'md'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <Link
        href="https://app.ato.so/login"
        style={{
          display: 'inline-block',
          backgroundColor: c.black,
          color: c.white,
          textDecoration: 'none',
          padding: isMd ? '14px 40px' : '10px 28px',
          borderRadius: '8px',
          fontSize: isMd ? '16px' : '14px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          fontFamily: font.gothic,
        }}
      >
        無料で始める
      </Link>
      <span style={{ fontSize: '12px', color: c.muted, fontFamily: font.gothic }}>
        データはいつでも手元に。
      </span>
    </div>
  )
}

// ─── ページ ───────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ color: c.black, backgroundColor: c.white, fontFamily: font.gothic, overflowX: 'hidden' }}>

      {/* ── Nav ── */}
      <nav style={{
        position: 'fixed',
        inset: '0 0 auto 0',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        backgroundColor: `${c.white}e6`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${c.light}`,
      }}>
        <span style={{ fontSize: '22px', fontWeight: 400, fontFamily: font.mincho, letterSpacing: '0.05em' }}>
          あと、
        </span>
        <Link
          href="https://app.ato.so/login"
          style={{
            color: c.black,
            textDecoration: 'none',
            fontSize: '14px',
            borderBottom: `1px solid ${c.black}`,
            paddingBottom: '1px',
          }}
        >
          始める
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '96px 32px 80px',
        gap: '32px',
      }}>
        {/* タグ */}
        <p style={{
          fontSize: '13px',
          color: c.muted,
          letterSpacing: '0.1em',
          margin: 0,
        }}>
          noteで書いている人のための、下書き・思考整理エディタ。
        </p>

        {/* キャッチコピー */}
        <h1 style={{
          fontFamily: font.mincho,
          fontSize: 'clamp(28px, 5vw, 56px)',
          fontWeight: 400,
          lineHeight: '155%',
          margin: 0,
          letterSpacing: '0.05em',
        }}>
          只々、自然に書くための
          <br />
          アプリ。
        </h1>

        {/* 差別化メッセージ */}
        <p style={{
          fontSize: '15px',
          color: '#555',
          maxWidth: '480px',
          margin: 0,
          lineHeight: '195%',
        }}>
          スマホでMarkdownがスムーズに書けて、
          <br />
          AI機能もGitHub連携もPCとの連携も全て同期された、
          <br />
          デバイスも場所も選ばないエディタ。
        </p>

        <StartButton />
      </section>

      {/* ── 4つの壁（問題提起） ── */}
      <section style={{ backgroundColor: c.light, padding: '96px 32px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            marginBottom: '48px',
            textAlign: 'center',
            lineHeight: '165%',
          }}>
            書くことが、なぜこんなに不自由なのか。
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(256px, 1fr))',
            gap: '16px',
          }}>
            {problems.map(({ label, text }) => (
              <div
                key={label}
                style={{
                  backgroundColor: c.white,
                  padding: '24px',
                  borderRadius: '8px',
                }}
              >
                <p style={{
                  fontSize: '11px',
                  color: c.muted,
                  margin: '0 0 8px',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                }}>
                  {label}
                </p>
                <p style={{ fontSize: '14px', margin: 0, lineHeight: '180%' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── あと、が違うこと（解決策） ── */}
      <section style={{ padding: '96px 32px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            margin: '0 0 8px',
            textAlign: 'center',
          }}>
            あと、が違うこと。
          </h2>
          <p style={{
            textAlign: 'center',
            color: c.muted,
            fontSize: '13px',
            margin: '0 0 64px',
          }}>
            4つの壁を、ひとつのエディタで。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {features.map(({ num, title, body }) => (
              <div
                key={num}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr',
                  gap: '24px',
                  alignItems: 'start',
                }}
              >
                <span style={{
                  fontSize: '11px',
                  color: c.muted,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  paddingTop: '3px',
                }}>
                  {num}
                </span>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 12px' }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: '14px', margin: 0, lineHeight: '190%', color: '#555' }}>
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── noteとの関係（ポジショニング） ── */}
      <section style={{
        backgroundColor: c.light,
        padding: '96px 32px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 40px' }}>
            noteで書く人のための、相棒として。
          </h2>

          {/* フロー図 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            <div style={{
              backgroundColor: c.white,
              padding: '20px 28px',
              borderRadius: '8px',
              textAlign: 'center',
              minWidth: '120px',
            }}>
              <p style={{ margin: '0 0 6px', fontSize: '11px', color: c.muted, letterSpacing: '0.08em' }}>
                下書き・思考整理
              </p>
              <span style={{ fontFamily: font.mincho, fontSize: '22px', letterSpacing: '0.05em' }}>
                あと、
              </span>
            </div>

            <span style={{ fontSize: '18px', color: c.muted }}>→</span>

            <div style={{
              backgroundColor: c.white,
              padding: '20px 28px',
              borderRadius: '8px',
              textAlign: 'center',
              minWidth: '120px',
            }}>
              <p style={{ margin: '0 0 6px', fontSize: '11px', color: c.muted, letterSpacing: '0.08em' }}>
                清書・公開
              </p>
              <span style={{ fontSize: '22px', fontWeight: 700 }}>note</span>
            </div>
          </div>

          <p style={{
            marginTop: '32px',
            fontSize: '14px',
            color: '#666',
            lineHeight: '190%',
          }}>
            noteは「書いた後の公開」に特化している。
            <br />「書く前・書いている最中」のツールとして、あと、がある。
          </p>
        </div>
      </section>

      {/* ── コンセプト（情緒・ブランドの深み） ── */}
      <section style={{ padding: '96px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <p style={{
            fontSize: '11px',
            color: c.muted,
            letterSpacing: '0.15em',
            margin: '0 0 24px',
          }}>
            CONCEPT
          </p>
          <blockquote style={{
            fontFamily: font.mincho,
            fontSize: 'clamp(18px, 3vw, 26px)',
            fontWeight: 400,
            lineHeight: '185%',
            margin: '0 0 32px',
            letterSpacing: '0.05em',
            color: c.black,
          }}>
            心が動いた時。
            <br />
            アイデアを閃いた時。
            <br />
            その場で、そのまま書く。
          </blockquote>
          <p style={{
            fontSize: '13px',
            color: '#666',
            lineHeight: '195%',
            margin: 0,
          }}>
            道教の「無為自然」を指針に。
            <br />
            紙とペンのように、あるがままに書ける道具。
            <br />
            それが「あと、」のコンセプト。
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{
        backgroundColor: c.light,
        padding: '96px 32px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px',
      }}>
        <h2 style={{
          fontFamily: font.mincho,
          fontSize: 'clamp(22px, 4vw, 36px)',
          fontWeight: 400,
          margin: 0,
          letterSpacing: '0.05em',
          lineHeight: '160%',
        }}>
          只々、自然に書くためのアプリ。
        </h2>
        <StartButton />
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: `1px solid ${c.light}`,
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '12px',
        color: c.muted,
        fontFamily: font.gothic,
      }}>
        <span style={{ fontFamily: font.mincho, fontSize: '14px' }}>あと、</span>
        <span>© 2026 ato. All rights reserved.</span>
      </footer>

    </div>
  )
}
