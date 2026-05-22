// Hero.jsx — main hero section with animated background + phone mock

function Hero({ onPrimary, onSecondary }) {
  const wrapRef = React.useRef(null);
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    function onScroll() { setScrollY(window.scrollY); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Parallax intensities
  const py1 = scrollY * 0.18;
  const py2 = scrollY * 0.10;
  const py3 = scrollY * 0.28;
  const fade = Math.max(0, 1 - scrollY / 600);

  return (
    <section
      ref={wrapRef}
      id="top"
      data-bg="#FBFCFE"
      data-fg="dark"
      style={{
        position: 'relative',
        minHeight: '100vh',
        paddingTop: 120,
        paddingBottom: 80,
        overflow: 'hidden',
      }}
    >
      {/* Animated background blobs */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -120, left: -160, width: 540, height: 540,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,102,255,.16) 0%, rgba(0,102,255,0) 65%)',
          transform: `translate3d(${py1 * .3}px, ${py1}px, 0)`,
          willChange: 'transform',
        }} />
        <div style={{
          position: 'absolute', top: 80, right: -120, width: 620, height: 620,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,191,64,.10) 0%, rgba(0,191,64,0) 65%)',
          transform: `translate3d(${-py2 * .3}px, ${-py2}px, 0)`,
          willChange: 'transform',
        }} />
        <div style={{
          position: 'absolute', bottom: -180, left: '30%', width: 700, height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,146,0,.07) 0%, rgba(255,146,0,0) 65%)',
          transform: `translate3d(${py2 * .2}px, ${py3 * .6}px, 0)`,
          willChange: 'transform',
        }} />
        {/* Grid pattern */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: .35 }}>
          <defs>
            <pattern id="hero-grid" width="44" height="44" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="rgba(112,115,124,.18)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div
        style={{
          position: 'relative',
          maxWidth: 1240,
          margin: '0 auto',
          padding: '0 32px',
          display: 'grid',
          gridTemplateColumns: '1.05fr .95fr',
          gap: 56,
          alignItems: 'center',
        }}
      >
        {/* Left: copy */}
        <div style={{ opacity: fade, transition: 'opacity 200ms ease' }}>
          <Reveal y={16}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px 6px 8px',
                background: '#fff',
                border: '1px solid var(--semantic-line-normal-normal)',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--semantic-label-neutral)',
                boxShadow: '0 1px 2px rgba(23,23,23,.04)',
              }}
            >
              <span style={{
                display: 'inline-block', width: 18, height: 18, borderRadius: 999,
                background: 'var(--semantic-primary-normal)', color: '#fff',
                fontSize: 10, fontWeight: 700, lineHeight: '18px', textAlign: 'center',
              }}>
                N
              </span>
              <span style={{ color: 'var(--semantic-label-strong)' }}>행정안전부 기준</span>
              <span>·</span>
              <span>안전관리 항목 전체 반영</span>
            </div>
          </Reveal>

          <Reveal y={24} delay={80}>
            <h1
              style={{
                margin: '20px 0 0',
                fontSize: 'clamp(40px, 5.6vw, 76px)',
                lineHeight: 1.05,
                letterSpacing: '-.035em',
                fontWeight: 700,
                color: 'var(--semantic-label-strong)',
                textWrap: 'balance',
              }}
            >
              안전한 놀이터,<br />
              <span style={{ color: 'var(--semantic-primary-normal)' }}>한 번의 점검</span>으로<br />
              완성됩니다
            </h1>
          </Reveal>

          <Reveal y={20} delay={180}>
            <p
              style={{
                margin: '24px 0 0',
                maxWidth: 520,
                fontSize: 18.5,
                lineHeight: 1.55,
                color: 'var(--semantic-label-neutral)',
                letterSpacing: '-.005em',
              }}
            >
              월 1회 안전점검부터 법적 의무사항 확인, 전자서명, PDF 보고서까지.
              복잡한 어린이놀이시설 안전관리를 하나의 플랫폼에서 처리하세요.
            </p>
          </Reveal>

          <Reveal y={16} delay={260}>
            <div style={{ display: 'flex', gap: 10, marginTop: 32, flexWrap: 'wrap' }}>
              <button
                onClick={onPrimary}
                style={{
                  height: 54,
                  padding: '0 28px',
                  background: 'var(--semantic-label-strong)',
                  color: '#fff',
                  border: 0,
                  borderRadius: 12,
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 16,
                  letterSpacing: '-.01em',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'background 160ms ease, transform 160ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#000'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--semantic-label-strong)'; }}
              >
                무료 상담 신청
                <Icon name="arrowRight" size={18} />
              </button>
              <button
                onClick={onSecondary}
                style={{
                  height: 54,
                  padding: '0 24px',
                  background: '#fff',
                  color: 'var(--semantic-label-strong)',
                  borderRadius: 12,
                  border: '1px solid var(--semantic-line-normal-normal)',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 16,
                  letterSpacing: '-.01em',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'background 160ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--semantic-fill-normal)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
              >
                <Icon name="play" size={14} />
                3분 데모 보기
              </button>
            </div>
          </Reveal>

          <Reveal y={12} delay={360}>
            <div style={{
              display: 'flex', gap: 20, marginTop: 40, paddingTop: 28,
              borderTop: '1px solid var(--semantic-line-normal-alternative)',
              flexWrap: 'wrap',
            }}>
              {[
                { k: '2,400+', v: '관리 시설' },
                { k: '128', v: '도입 기관' },
                { k: '99.2%', v: '점검 누락률 0%' },
              ].map((s) => (
                <div key={s.v} style={{ minWidth: 100 }}>
                  <div style={{
                    fontSize: 28, fontWeight: 700, letterSpacing: '-.025em',
                    color: 'var(--semantic-label-strong)',
                  }}>{s.k}</div>
                  <div style={{
                    fontSize: 13, color: 'var(--semantic-label-alternative)', marginTop: 2,
                  }}>{s.v}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Right: phone mock with floating cards */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', minHeight: 600 }}>
          {/* Decorative floating cards */}
          <FloatingCard
            style={{
              left: '-20px', top: '40px',
              transform: `translate3d(${-py2 * .3}px, ${py2 * .2}px, 0)`,
            }}
            delay={400}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(0,191,64,.12)',
                color: '#009632',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="shieldCheck" size={20} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--semantic-label-alternative)', fontWeight: 500 }}>
                  안전점검 상태
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#171719' }}>
                  양호 · 5건 완료
                </div>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard
            style={{
              right: '-30px', top: '160px',
              transform: `translate3d(${py2 * .3}px, ${-py2 * .2}px, 0)`,
            }}
            delay={550}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(0,102,255,.10)',
                color: 'var(--semantic-primary-normal)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="doc" size={20} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--semantic-label-alternative)', fontWeight: 500 }}>
                  점검대장
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#171719' }}>
                  PDF 자동 생성
                </div>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard
            style={{
              right: '-10px', bottom: '60px',
              transform: `translate3d(${py3 * .2}px, ${py3 * .15}px, 0)`,
            }}
            delay={700}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Sparkline />
              <div>
                <div style={{ fontSize: 11, color: 'var(--semantic-label-alternative)', fontWeight: 500 }}>
                  점검 완료율
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#171719', letterSpacing: '-.02em' }}>
                  98.4% <span style={{ fontSize: 11, color: '#009632', marginLeft: 4 }}>▲ 12.3%p</span>
                </div>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard
            style={{
              left: '-10px', bottom: '110px',
              transform: `translate3d(${-py3 * .2}px, ${-py3 * .12}px, 0)`,
            }}
            delay={850}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,146,0,.12)',
                color: '#D17600',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="bell" size={20} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--semantic-label-alternative)', fontWeight: 500 }}>
                  정기검사 만료
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#171719' }}>
                  D-37 · 자동 알림
                </div>
              </div>
            </div>
          </FloatingCard>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <HeroPhoneMock />
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          color: 'var(--semantic-label-alternative)',
          opacity: fade,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>
          Scroll
        </span>
        <div style={{
          width: 1, height: 28,
          background: 'linear-gradient(to bottom, transparent, var(--semantic-label-alternative))',
          animation: 'scrollCue 2s infinite ease-in-out',
        }} />
      </div>

      <style>{`
        @keyframes scrollCue {
          0%, 100% { opacity: .25; transform: translateY(-4px); }
          50% { opacity: 1; transform: translateY(4px); }
        }
      `}</style>
    </section>
  );
}

function FloatingCard({ children, style = {}, delay = 0 }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{
        position: 'absolute',
        padding: '12px 14px',
        background: 'rgba(255,255,255,.92)',
        backdropFilter: 'saturate(180%) blur(12px)',
        WebkitBackdropFilter: 'saturate(180%) blur(12px)',
        border: '1px solid rgba(255,255,255,.8)',
        borderRadius: 14,
        boxShadow: '0 18px 40px rgba(0, 28, 80, .12), 0 4px 12px rgba(0, 28, 80, .06)',
        zIndex: 3,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 600ms ease, transform 600ms cubic-bezier(.2,.7,.2,1)',
        animation: mounted ? 'floatY 4.5s ease-in-out infinite' : 'none',
        ...style,
      }}
    >
      {children}
      <style>{`
        @keyframes floatY {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -6px; }
        }
      `}</style>
    </div>
  );
}

function Sparkline() {
  return (
    <svg width="56" height="36" viewBox="0 0 56 36" style={{ color: 'var(--semantic-primary-normal)' }}>
      <defs>
        <linearGradient id="spark-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity=".25" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M2 28 L 10 22 L 18 24 L 26 16 L 34 18 L 42 10 L 54 6 L 54 34 L 2 34 Z" fill="url(#spark-g)" />
      <path d="M2 28 L 10 22 L 18 24 L 26 16 L 34 18 L 42 10 L 54 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="54" cy="6" r="3" fill="#fff" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

window.Hero = Hero;
