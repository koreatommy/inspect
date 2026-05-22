// HeroVideo.jsx — Hero "video": an animated mock of the inspection app
// running on a phone, with floating UI cards composed around it.

function HeroPhoneMock() {
  // Animation state cycles: 0=checklist filling, 1=photo upload, 2=signature, 3=PDF
  const [stage, setStage] = React.useState(0);
  const [checks, setChecks] = React.useState([false, false, false, false, false]);
  const [reduce, setReduce] = React.useState(false);

  React.useEffect(() => {
    setReduce(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false);
  }, []);

  React.useEffect(() => {
    if (reduce) {
      setChecks([true, true, true, true, false]);
      setStage(0);
      return;
    }
    let t = 0;
    let timers = [];
    function loop() {
      // Stage 0: progressively check items
      setStage(0);
      setChecks([false, false, false, false, false]);
      [0, 1, 2, 3, 4].forEach((i) => {
        timers.push(setTimeout(() => {
          setChecks((prev) => prev.map((v, idx) => (idx === i ? true : v)));
        }, 600 + i * 700));
      });
      // Stage 1: photo
      timers.push(setTimeout(() => setStage(1), 4400));
      // Stage 2: signature
      timers.push(setTimeout(() => setStage(2), 6800));
      // Stage 3: PDF generated
      timers.push(setTimeout(() => setStage(3), 9000));
      // Restart
      timers.push(setTimeout(loop, 11800));
    }
    loop();
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  const phoneW = 280;
  const phoneH = 580;

  return (
    <div
      style={{
        position: 'relative',
        width: phoneW,
        height: phoneH,
        filter: 'drop-shadow(0 30px 60px rgba(0, 36, 102, .18)) drop-shadow(0 10px 20px rgba(0, 36, 102, .08))',
      }}
    >
      {/* Device frame */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 44,
          background: '#0F0F10',
          padding: 9,
        }}
      >
        {/* Screen */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 36,
            background: '#F7F7F8',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Status bar */}
          <div
            style={{
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              fontSize: 13,
              fontWeight: 600,
              color: '#171719',
            }}
          >
            <span>9:41</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="16" height="10" viewBox="0 0 16 10"><path d="M0 7h2v3H0zm4-2h2v5H4zm4-2h2v7H8zm4-3h2v10h-2z" fill="#171719" /></svg>
              <svg width="22" height="10" viewBox="0 0 22 10"><rect x=".5" y="1" width="18" height="8" rx="2" fill="none" stroke="#171719" /><rect x="2" y="2.5" width="13" height="5" fill="#171719" /><rect x="19.5" y="3.5" width="1.5" height="3" fill="#171719" /></svg>
            </div>
          </div>

          {/* Notch */}
          <div style={{
            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
            width: 110, height: 30, background: '#0F0F10', borderRadius: 18,
          }} />

          {/* App header */}
          <div style={{ padding: '4px 18px 12px' }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--semantic-primary-normal)', letterSpacing: '.04em' }}>
              월점검 대장 · 2026.05
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#171719', marginTop: 4, letterSpacing: '-.02em' }}>
              햇살어린이공원 · 미끄럼틀
            </div>
            <div style={{ fontSize: 12, color: 'var(--semantic-label-alternative)', marginTop: 2 }}>
              시설번호 S-2024-0571
            </div>
          </div>

          {/* Content area — switches by stage */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {/* Stage 0: checklist */}
            <div
              style={{
                position: 'absolute', inset: 0, padding: '0 18px',
                opacity: stage === 0 ? 1 : 0,
                transform: stage === 0 ? 'translateY(0)' : 'translateY(-16px)',
                transition: 'opacity 360ms ease, transform 360ms ease',
              }}
            >
              <div style={{
                fontSize: 11, fontWeight: 600, color: 'var(--semantic-label-alternative)',
                letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 8,
              }}>
                체크리스트
              </div>
              {[
                '미끄럼판 균열·이탈',
                '손잡이 견고성',
                '바닥재 충격흡수',
                '연결부 고정 상태',
                '주변 안전영역',
              ].map((label, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', marginBottom: 6,
                    background: '#fff', borderRadius: 10,
                    border: '1px solid var(--semantic-line-normal-alternative)',
                  }}
                >
                  <div
                    style={{
                      width: 20, height: 20, borderRadius: 6,
                      background: checks[i] ? 'var(--semantic-primary-normal)' : '#fff',
                      border: checks[i] ? '1.5px solid var(--semantic-primary-normal)' : '1.5px solid var(--semantic-line-normal-normal)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 200ms ease, border-color 200ms ease',
                    }}
                  >
                    {checks[i] && (
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <path d="M2.5 6.5l2.5 2.5L9.5 3.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1, fontSize: 13.5, color: '#171719', fontWeight: 500 }}>
                    {label}
                  </div>
                  {checks[i] && (
                    <div style={{
                      fontSize: 10.5, fontWeight: 700, padding: '3px 7px', borderRadius: 999,
                      background: '#E2F8EA', color: '#009632',
                    }}>
                      양호
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Stage 1: photo upload */}
            <div
              style={{
                position: 'absolute', inset: 0, padding: '0 18px',
                opacity: stage === 1 ? 1 : 0,
                transform: stage === 1 ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 360ms ease, transform 360ms ease',
                pointerEvents: stage === 1 ? 'auto' : 'none',
              }}
            >
              <div style={{
                fontSize: 11, fontWeight: 600, color: 'var(--semantic-label-alternative)',
                letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 8,
              }}>
                현장 사진 · 위해요소
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      aspectRatio: '1 / 1',
                      borderRadius: 10,
                      background:
                        i === 0 ? 'linear-gradient(135deg, #FFB36B, #FF7A45)' :
                        i === 1 ? 'linear-gradient(135deg, #6DB1FF, #0066FF)' :
                        i === 2 ? 'linear-gradient(135deg, #98E6B5, #00BF40)' :
                                  'linear-gradient(135deg, #C0B0FF, #6541F2)',
                      position: 'relative',
                      overflow: 'hidden',
                      opacity: stage === 1 ? 1 : 0,
                      transform: stage === 1 ? 'scale(1)' : 'scale(.94)',
                      transition: `opacity 420ms ${i * 100}ms ease, transform 420ms ${i * 100}ms cubic-bezier(.2,.7,.2,1)`,
                    }}
                  >
                    {i === 0 && (
                      <div style={{
                        position: 'absolute', top: 6, right: 6, fontSize: 9,
                        fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: 'rgba(255,255,255,.95)', color: '#E52222',
                      }}>
                        수리 전
                      </div>
                    )}
                    {i === 1 && (
                      <div style={{
                        position: 'absolute', top: 6, right: 6, fontSize: 9,
                        fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: 'rgba(255,255,255,.95)', color: '#009632',
                      }}>
                        수리 후
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 12, padding: 12,
                  background: '#fff', borderRadius: 10,
                  border: '1px dashed var(--semantic-line-normal-normal)',
                  fontSize: 12, color: 'var(--semantic-label-neutral)',
                  textAlign: 'center',
                }}
              >
                <Icon name="camera" size={20} style={{ margin: '0 auto 4px', color: 'var(--semantic-primary-normal)' }} />
                사진 추가
              </div>
            </div>

            {/* Stage 2: signature */}
            <div
              style={{
                position: 'absolute', inset: 0, padding: '0 18px',
                opacity: stage === 2 ? 1 : 0,
                transform: stage === 2 ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 360ms ease, transform 360ms ease',
                pointerEvents: stage === 2 ? 'auto' : 'none',
              }}
            >
              <div style={{
                fontSize: 11, fontWeight: 600, color: 'var(--semantic-label-alternative)',
                letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 8,
              }}>
                안전관리자 서명
              </div>
              <div
                style={{
                  background: '#fff', borderRadius: 10,
                  border: '1px solid var(--semantic-line-normal-alternative)',
                  padding: 16, marginBottom: 10, position: 'relative', height: 130,
                }}
              >
                <svg width="100%" height="100%" viewBox="0 0 240 100" style={{ position: 'absolute', left: 16, top: 16, color: 'var(--semantic-primary-normal)' }}>
                  <path
                    d="M5 70 C 15 30, 30 80, 45 50 C 60 20, 80 70, 100 45 S 140 75, 160 40 S 200 55, 230 35"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                    strokeDasharray="500"
                    style={{
                      strokeDashoffset: stage === 2 ? 0 : 500,
                      transition: 'stroke-dashoffset 1400ms cubic-bezier(.5, .1, .3, 1)',
                    }}
                  />
                </svg>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 12, color: 'var(--semantic-label-neutral)',
              }}>
                <span>박지수 안전관리자</span>
                <span>2026.05.21 14:32</span>
              </div>
              <button style={{
                width: '100%', marginTop: 14, padding: '12px',
                background: 'var(--semantic-primary-normal)', color: '#fff',
                fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
                borderRadius: 10, border: 0, letterSpacing: '-.01em',
              }}>
                점검 완료 · PDF 생성
              </button>
            </div>

            {/* Stage 3: PDF generated */}
            <div
              style={{
                position: 'absolute', inset: 0, padding: '0 18px',
                opacity: stage === 3 ? 1 : 0,
                transform: stage === 3 ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 360ms ease, transform 360ms ease',
                pointerEvents: stage === 3 ? 'auto' : 'none',
              }}
            >
              <div
                style={{
                  background: '#fff', borderRadius: 12,
                  boxShadow: '0 12px 30px rgba(0, 30, 80, .12), 0 2px 6px rgba(0, 30, 80, .05)',
                  padding: 14, position: 'relative',
                  transform: stage === 3 ? 'scale(1) rotate(-1.5deg)' : 'scale(.92) rotate(0)',
                  transition: 'transform 520ms cubic-bezier(.2, .7, .2, 1)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--semantic-primary-normal)', letterSpacing: '.06em' }}>
                      월점검 대장
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#171719', marginTop: 2 }}>
                      햇살어린이공원
                    </div>
                  </div>
                  <div style={{ fontSize: 8, color: 'var(--semantic-label-alternative)' }}>2026.05</div>
                </div>
                {/* Rows */}
                {[1, 2, 3, 4].map((row) => (
                  <div key={row} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    <div style={{ width: 28, height: 7, background: 'var(--semantic-fill-strong)', borderRadius: 2 }} />
                    <div style={{ flex: 1, height: 7, background: 'var(--semantic-fill-normal)', borderRadius: 2 }} />
                    <div style={{ width: 18, height: 7, background: row === 3 ? '#E2F8EA' : 'var(--semantic-fill-normal)', borderRadius: 2 }} />
                  </div>
                ))}
                <div style={{ height: 32, marginTop: 8, borderTop: '1px dashed var(--semantic-line-normal-normal)', paddingTop: 8, color: 'var(--semantic-primary-normal)' }}>
                  <svg width="100%" height="20" viewBox="0 0 160 20">
                    <path d="M2 14 C 12 4, 22 18, 36 10 S 56 15, 76 6 S 110 18, 158 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              {/* Success */}
              <div
                style={{
                  marginTop: 16,
                  background: '#E2F8EA',
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 999,
                  background: '#00BF40',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                }}>
                  <Icon name="check" size={18} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#005A1F', lineHeight: 1.3 }}>
                  PDF 보고서가 생성되었습니다<br />
                  <span style={{ fontWeight: 500, color: '#009632', fontSize: 11 }}>2026-05-21_햇살어린이공원.pdf</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom tab bar */}
          <div
            style={{
              height: 52,
              borderTop: '1px solid var(--semantic-line-normal-alternative)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '0 12px',
              background: '#fff',
            }}
          >
            {[
              { name: 'building', label: '시설', i: 0 },
              { name: 'clipboard', label: '점검', i: 1 },
              { name: 'chart', label: '통계', i: 2 },
              { name: 'users', label: '관리', i: 3 },
            ].map((t) => (
              <div key={t.i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                color: t.i === 1 ? 'var(--semantic-primary-normal)' : 'var(--semantic-label-alternative)',
              }}>
                <Icon name={t.name} size={20} />
                <span style={{ fontSize: 10, fontWeight: 600 }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.HeroPhoneMock = HeroPhoneMock;
