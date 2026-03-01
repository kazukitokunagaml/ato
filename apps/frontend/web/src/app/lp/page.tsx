import Link from 'next/link'

const c = {
  white: '#fffffe',
  black: '#373737',
  lightGray: '#e4e5e6',
  darkGray: '#bdbebe',
  blue: '#38a1db',
}

const shippori = 'var(--font-shippori), serif'

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
    body: 'Markdownで書いて、ZIPで持ち出せる。独自形式のロックインも、サービス停止の不安もない。データは、あなたのもの。',
  },
  {
    num: '02',
    title: 'どこでも、途切れない',
    body: '電車でスマホに書いたものが、帰宅したらPCで続きから書ける。オフラインでも書いていた内容は、通信復帰後に自動で同期される。',
  },
  {
    num: '03',
    title: '機能は強力でも、勉強いらない',
    body: 'Gitを知らなくてもバージョン管理ができる。AIを使うのにプログラミングはいらない。執筆者が本当に必要な機能を、学習コストゼロで。',
  },
]

function CTAButton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <Link
        href="/login"
        style={{
          display: 'inline-block',
          backgroundColor: c.black,
          color: c.white,
          textDecoration: 'none',
          padding: '14px 40px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 700,
          letterSpacing: '0.05em',
        }}
      >
        無料で始める
      </Link>
      <span style={{ fontSize: '12px', color: c.darkGray }}>データはいつでも手元に。</span>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div style={{ color: c.black, backgroundColor: c.white, overflowX: 'hidden' }}>
      {/* Nav */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
          backgroundColor: `${c.white}e6`,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${c.lightGray}`,
        }}
      >
        <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: shippori }}>あと、</span>
        <Link
          href="/login"
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

      {/* Hero */}
      <section
        style={{
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '96px 32px 80px',
          textAlign: 'center',
          gap: '32px',
        }}
      >
        <p
          style={{
            fontSize: '13px',
            color: c.darkGray,
            letterSpacing: '0.08em',
            margin: 0,
          }}
        >
          noteで書いている人のための、下書き・思考整理エディタ。
        </p>

        <h1
          style={{
            fontFamily: shippori,
            fontSize: 'clamp(28px, 5vw, 56px)',
            fontWeight: 400,
            lineHeight: '150%',
            margin: 0,
            letterSpacing: '0.05em',
          }}
        >
          只々、自然に書くための
          <br />
          アプリ。
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: '#555',
            maxWidth: '480px',
            margin: 0,
            lineHeight: '190%',
          }}
        >
          スマホでMarkdownがスムーズに書けて、
          <br />
          AI機能もGitHub連携もPCとの連携も全て同期された、
          <br />
          デバイスも場所も選ばないエディタ。
        </p>

        <CTAButton />
      </section>

      {/* 4つの壁 */}
      <section
        style={{
          backgroundColor: c.lightGray,
          padding: '96px 32px',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '48px',
              textAlign: 'center',
              lineHeight: '160%',
            }}
          >
            書くことが、なぜこんなに不自由なのか。
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            {problems.map(({ label, text }) => (
              <div
                key={label}
                style={{
                  backgroundColor: c.white,
                  padding: '24px',
                  borderRadius: '8px',
                }}
              >
                <p
                  style={{
                    fontSize: '11px',
                    color: c.darkGray,
                    margin: '0 0 8px',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                  }}
                >
                  {label}
                </p>
                <p style={{ fontSize: '14px', margin: 0, lineHeight: '175%' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* あと、が違うこと */}
      <section style={{ padding: '96px 32px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '8px',
              textAlign: 'center',
            }}
          >
            あと、が違うこと。
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: c.darkGray,
              fontSize: '13px',
              marginBottom: '64px',
            }}
          >
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
                <span
                  style={{
                    fontSize: '11px',
                    color: c.darkGray,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    paddingTop: '4px',
                  }}
                >
                  {num}
                </span>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 12px' }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: '14px', margin: 0, lineHeight: '185%', color: '#555' }}>
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* noteとの関係 */}
      <section
        style={{
          backgroundColor: c.lightGray,
          padding: '96px 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '40px' }}>
            noteで書く人のための、相棒として。
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                backgroundColor: c.white,
                padding: '20px 28px',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: c.darkGray }}>下書き・思考整理</p>
              <span style={{ fontFamily: shippori, fontSize: '22px' }}>あと、</span>
            </div>

            <span style={{ fontSize: '20px', color: c.darkGray }}>→</span>

            <div
              style={{
                backgroundColor: c.white,
                padding: '20px 28px',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: c.darkGray }}>清書・公開</p>
              <span style={{ fontSize: '22px', fontWeight: 700 }}>note</span>
            </div>
          </div>

          <p
            style={{
              marginTop: '32px',
              fontSize: '14px',
              color: '#666',
              lineHeight: '185%',
            }}
          >
            noteは「書いた後の公開」に特化している。
            <br />「書く前・書いている最中」のツールとして、あと、がある。
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section
        style={{
          padding: '128px 32px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '40px',
        }}
      >
        <h2
          style={{
            fontFamily: shippori,
            fontSize: 'clamp(22px, 4vw, 40px)',
            fontWeight: 400,
            margin: 0,
            letterSpacing: '0.05em',
            lineHeight: '160%',
          }}
        >
          心が動いた時。アイデアを閃いた時。
          <br />
          その場で、そのまま書く。
        </h2>
        <CTAButton />
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${c.lightGray}`,
          padding: '24px 32px',
          textAlign: 'center',
          fontSize: '12px',
          color: c.darkGray,
        }}
      >
        <p style={{ margin: 0 }}>あと、 — 只々、自然に書くためのアプリ。</p>
      </footer>
    </div>
  )
}
