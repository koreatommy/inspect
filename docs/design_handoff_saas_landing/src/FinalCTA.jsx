// FinalCTA.jsx — closing call to action + Footer

function FinalCTA() {
  return (
    <section
      id="cta"
      data-bg="#0F0F10"
      data-fg="light"
      style={{
        padding: '140px 32px',
        position: 'relative',
        color: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Decorative gradient orb */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 900, height: 900, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,102,255,.28), rgba(0,102,255,0) 55%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 999,
            border: '1px solid rgba(255,255,255,.18)',
            fontSize: 13, fontWeight: 500,
            color: 'rgba(255,255,255,.85)',
            marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: '#00BF40', display: 'inline-block' }} />
            14일 무료 체험 가능
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(40px, 5vw, 64px)',
            lineHeight: 1.05, letterSpacing: '-.035em', fontWeight: 700,
            color: '#fff', textWrap: 'balance',
          }}>
            어린이놀이시설 안전관리,<br />
            이제 <span style={{
              background: 'linear-gradient(115deg, #69A5FF, #C0B0FF, #FF8EBD)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>시스템으로</span> 전환하세요
          </h2>
        </Reveal>

        <Reveal delay={160}>
          <p style={{
            margin: '24px auto 0', maxWidth: 620,
            fontSize: 18, lineHeight: 1.6,
            color: 'rgba(255,255,255,.7)',
          }}>
            월점검 대장 작성부터 PDF 보고서, 사진 기록, 수리이력, 통계 분석까지.
            기관 환경에 맞춰 적합한 요금제를 제안드립니다.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div style={{ display: 'flex', gap: 10, marginTop: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              style={{
                height: 56, padding: '0 30px',
                background: '#fff', color: '#0F0F10',
                border: 0, borderRadius: 12,
                fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 16,
                letterSpacing: '-.01em', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'opacity 160ms ease, transform 160ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              무료 도입 상담 신청
              <Icon name="arrowRight" size={18} />
            </button>
            <button
              style={{
                height: 56, padding: '0 26px',
                background: 'transparent', color: '#fff',
                border: '1px solid rgba(255,255,255,.22)', borderRadius: 12,
                fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 16,
                letterSpacing: '-.01em', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'background 160ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              서비스 데모 요청
            </button>
          </div>
        </Reveal>

        <Reveal delay={320}>
          <div style={{
            marginTop: 56,
            display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap',
            fontSize: 13.5, color: 'rgba(255,255,255,.55)',
          }}>
            {['신용카드 등록 불필요', '14일 무료 체험', '도입 컨설팅 제공', '데이터 마이그레이션 지원'].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="check" size={14} color="#7DF5A5" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      data-bg="#0F0F10"
      data-fg="light"
      style={{
        padding: '64px 32px 40px',
        background: '#0F0F10',
        color: 'rgba(247,247,248,.6)',
        borderTop: '1px solid rgba(255,255,255,.06)',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 32,
          paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,.06)',
        }}>
          <div>
            <BrandLogoDark />
            <p style={{
              margin: '16px 0 0', fontSize: 13.5, lineHeight: 1.6,
              color: 'rgba(247,247,248,.5)', maxWidth: 320,
            }}>
              어린이놀이시설 안전관리 SaaS · 행정안전부 안전관리 항목 기준
            </p>
            <p style={{
              margin: '16px 0 0', fontSize: 12.5, lineHeight: 1.6,
              color: 'rgba(247,247,248,.4)',
            }}>
              (주)놀이지킴 · 대표 김민지<br />
              사업자등록번호 123-45-67890<br />
              서울특별시 강남구 테헤란로 152, 12층
            </p>
          </div>
          <FooterCol title="제품" links={['기능', '요금제', '요금 계산기', 'API 문서', '업데이트']} />
          <FooterCol title="회사" links={['서비스 소개', '도입 사례', '공지사항', '채용', '문의']} />
          <FooterCol title="지원" links={['도움말 센터', '도입 가이드', '약관·정책', '개인정보처리방침', '보안 공지']} />
        </div>

        <div style={{
          paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16,
          fontSize: 12.5,
        }}>
          <div>© 2026 놀이지킴 Inc. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="#" style={{ color: 'rgba(247,247,248,.6)', textDecoration: 'none' }}>이용약관</a>
            <a href="#" style={{ color: 'rgba(247,247,248,.6)', textDecoration: 'none' }}>개인정보처리방침</a>
            <a href="#" style={{ color: 'rgba(247,247,248,.6)', textDecoration: 'none' }}>위치정보 이용약관</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <div style={{
        fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
        color: '#fff', marginBottom: 16,
      }}>
        {title}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
        {links.map((l) => (
          <li key={l}>
            <a href="#" style={{
              fontSize: 13.5, color: 'rgba(247,247,248,.6)',
              textDecoration: 'none', transition: 'color 160ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(247,247,248,.6)'; }}
            >{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BrandLogoDark() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <BrandMark size={28} />
      <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-.02em', color: '#fff' }}>
        놀이지킴
      </span>
    </div>
  );
}

Object.assign(window, { FinalCTA, Footer });
