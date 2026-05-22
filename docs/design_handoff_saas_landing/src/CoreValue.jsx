// CoreValue.jsx — sticky-scroll section: phone on left pins,
// content on right cycles through 5 key values as the user scrolls.

function CoreValue() {
  const wrapRef = React.useRef(null);
  const progress = useScrollProgress(wrapRef);

  const steps = [
    {
      kicker: '01 · 표준화',
      title: '월 1회 안전점검 업무 표준화',
      desc: '시설별 점검 항목을 디지털화하여 누락 없는 점검을 지원합니다. 행정안전부 안전관리 항목이 그대로 반영되어 있어, 점검자가 바뀌어도 동일한 기준으로 진행됩니다.',
      tone: { fg: '#005EEB', bg: 'rgba(0,102,255,.10)', label: '체크리스트' },
    },
    {
      kicker: '02 · 의무사항',
      title: '법적 의무사항 한눈에 확인',
      desc: '설치검사, 정기시설검사, 안전교육, 보험가입 등 시설별 의무사항과 만료일을 통합 관리합니다. D-30 시점부터 자동으로 알림을 보내드립니다.',
      tone: { fg: '#D17600', bg: 'rgba(255,146,0,.10)', label: '의무사항' },
    },
    {
      kicker: '03 · 자동화',
      title: '점검대장 PDF 자동 생성',
      desc: '현장에서 입력한 점검 결과와 사진, 디지털 서명이 곧바로 월점검 대장으로 변환됩니다. 별도 문서 편집 없이 제출 가능한 형태로 미리보기·다운로드할 수 있습니다.',
      tone: { fg: '#009632', bg: 'rgba(0,191,64,.10)', label: 'PDF 생성' },
    },
    {
      kicker: '04 · 추적성',
      title: '시설 단위 사진·수리 이력',
      desc: '기구별 위해요소와 수리 전·후 사진, 조치 이력을 시설 단위로 묶어서 관리합니다. 어떤 시설의, 어떤 기구의 사진인지 한 번에 추적할 수 있습니다.',
      tone: { fg: '#5B37ED', bg: 'rgba(101,65,242,.10)', label: '이력 관리' },
    },
    {
      kicker: '05 · 인사이트',
      title: '통계로 보는 시설 관리 우선순위',
      desc: '양호·요주의·요수리·이용금지 상태를 월별로 분석합니다. 가장 위험한 시설, 미조치 시설을 한눈에 파악하여 관리 우선순위를 결정할 수 있습니다.',
      tone: { fg: '#E846CD', bg: 'rgba(232,70,205,.10)', label: '통계 분석' },
    },
  ];

  const stepsCount = steps.length;
  // Map scroll progress (0..1) into step index with smooth zone in middle
  const activeFloat = Math.min(Math.max(progress * stepsCount, 0), stepsCount - 0.0001);
  const active = Math.floor(activeFloat);

  return (
    <section
      id="features-intro"
      ref={wrapRef}
      data-bg="#FBFCFE"
      data-fg="dark"
      style={{
        position: 'relative',
        height: `${stepsCount * 80}vh`,
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient overlay shifts by active step */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at ${20 + active * 16}% ${30 + active * 10}%, ${steps[active].tone.bg}, transparent 55%)`,
            transition: 'background 800ms ease',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            padding: '0 32px',
            display: 'grid',
            gridTemplateColumns: '.95fr 1.05fr',
            gap: 80,
            alignItems: 'center',
            width: '100%',
            position: 'relative',
          }}
        >
          {/* Left: phone preview that changes per step */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CoreValuePreview step={active} steps={steps} />
          </div>

          {/* Right: stacked content with active highlighting */}
          <div>
            <div style={{
              fontSize: 13, fontWeight: 600,
              color: 'var(--semantic-primary-normal)',
              letterSpacing: '.06em', textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              핵심 가치
            </div>
            <h2 style={{
              margin: '0 0 56px',
              fontSize: 'clamp(32px, 3.6vw, 48px)',
              lineHeight: 1.1,
              letterSpacing: '-.03em',
              fontWeight: 700,
              color: 'var(--semantic-label-strong)',
              textWrap: 'balance',
              maxWidth: 540,
            }}>
              점검은 모바일로,<br />
              관리는 대시보드로,<br />
              보고서는 PDF로.
            </h2>

            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 4 }}>
              {steps.map((s, i) => {
                const isActive = i === active;
                return (
                  <li
                    key={i}
                    style={{
                      position: 'relative',
                      padding: '14px 0 14px 24px',
                      borderLeft: `2px solid ${isActive ? s.tone.fg : 'var(--semantic-line-normal-alternative)'}`,
                      transition: 'border-color 360ms ease',
                    }}
                  >
                    <div style={{
                      position: 'absolute', left: -7, top: 20,
                      width: 12, height: 12, borderRadius: 999,
                      background: isActive ? s.tone.fg : '#fff',
                      border: `2px solid ${isActive ? s.tone.fg : 'var(--semantic-line-normal-normal)'}`,
                      transition: 'background 360ms ease, border-color 360ms ease',
                    }} />
                    <div style={{
                      fontSize: 12, fontWeight: 600,
                      color: isActive ? s.tone.fg : 'var(--semantic-label-alternative)',
                      letterSpacing: '.04em', textTransform: 'uppercase',
                      transition: 'color 360ms ease',
                    }}>
                      {s.kicker}
                    </div>
                    <div style={{
                      fontSize: isActive ? 24 : 19,
                      fontWeight: 700,
                      letterSpacing: '-.022em',
                      color: isActive ? 'var(--semantic-label-strong)' : 'var(--semantic-label-alternative)',
                      marginTop: 4,
                      transition: 'all 360ms ease',
                      lineHeight: 1.25,
                    }}>
                      {s.title}
                    </div>
                    <div
                      style={{
                        maxHeight: isActive ? 200 : 0,
                        opacity: isActive ? 1 : 0,
                        overflow: 'hidden',
                        transition: 'all 400ms cubic-bezier(.2,.7,.2,1)',
                      }}
                    >
                      <p style={{
                        margin: '10px 0 0',
                        fontSize: 15.5, lineHeight: 1.6,
                        color: 'var(--semantic-label-neutral)', maxWidth: 540,
                      }}>
                        {s.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

// Visual preview for each step — a stacked card mock that changes content
function CoreValuePreview({ step, steps }) {
  const tone = steps[step].tone;

  return (
    <div
      style={{
        position: 'relative',
        width: 380, height: 480,
        borderRadius: 24,
        background: '#fff',
        boxShadow: '0 30px 60px rgba(0, 36, 102, .12), 0 8px 16px rgba(0, 36, 102, .06)',
        overflow: 'hidden',
        transition: 'transform 600ms cubic-bezier(.2,.7,.2,1)',
      }}
    >
      {/* Top bar */}
      <div style={{
        padding: '18px 22px',
        borderBottom: '1px solid var(--semantic-line-normal-alternative)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: tone.fg, letterSpacing: '.06em' }}>
            {tone.label}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#171719', marginTop: 2, letterSpacing: '-.015em' }}>
            햇살어린이공원
          </div>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 600,
          padding: '4px 10px', borderRadius: 999,
          background: tone.bg, color: tone.fg,
        }}>
          2026.05
        </div>
      </div>

      {/* Step content */}
      <div style={{ position: 'relative', height: 'calc(100% - 70px)' }}>
        {step === 0 && <PreviewChecklist tone={tone} />}
        {step === 1 && <PreviewObligations tone={tone} />}
        {step === 2 && <PreviewPdf tone={tone} />}
        {step === 3 && <PreviewRepair tone={tone} />}
        {step === 4 && <PreviewStats tone={tone} />}
      </div>
    </div>
  );
}

function PreviewChecklist({ tone }) {
  const items = [
    { label: '미끄럼판 균열·이탈', state: '양호' },
    { label: '손잡이 견고성', state: '양호' },
    { label: '바닥재 충격흡수', state: '요주의' },
    { label: '연결부 고정 상태', state: '양호' },
    { label: '주변 안전영역', state: '양호' },
    { label: '안전표지판', state: '양호' },
  ];
  const stateColor = (s) =>
    s === '양호' ? { bg: '#E2F8EA', fg: '#009632' } :
    s === '요주의' ? { bg: 'rgba(255,146,0,.14)', fg: '#D17600' } :
    { bg: 'rgba(255,66,66,.12)', fg: '#E52222' };
  return (
    <div style={{ padding: '14px 18px' }}>
      {items.map((it, i) => {
        const c = stateColor(it.state);
        return (
          <div
            key={it.label}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 0',
              borderBottom: i < items.length - 1 ? '1px solid var(--semantic-line-normal-alternative)' : 'none',
              animation: `fadeRowIn 420ms ${i * 60}ms ease both`,
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: 'var(--semantic-primary-normal)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path d="M2.5 6.5l2.5 2.5L9.5 3.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#171719' }}>
              {it.label}
            </div>
            <div style={{
              fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
              background: c.bg, color: c.fg,
            }}>
              {it.state}
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes fadeRowIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function PreviewObligations({ tone }) {
  const list = [
    { label: '설치검사', date: '2024.03.15 완료', remain: '유효', ok: true },
    { label: '정기시설검사', date: '2024.08.22 완료', remain: 'D-318', ok: true },
    { label: '안전교육', date: '2025.09.10 만료', remain: 'D-37', warn: true },
    { label: '보험가입', date: '2026.12.31 만료', remain: 'D-589', ok: true },
  ];
  return (
    <div style={{ padding: '14px 18px' }}>
      {list.map((it, i) => (
        <div
          key={it.label}
          style={{
            padding: '12px 14px', marginBottom: 8,
            background: it.warn ? 'rgba(255,146,0,.06)' : 'var(--semantic-background-normal-alternative)',
            border: `1px solid ${it.warn ? 'rgba(255,146,0,.30)' : 'var(--semantic-line-normal-alternative)'}`,
            borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 12,
            animation: `fadeRowIn 420ms ${i * 80}ms ease both`,
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: it.warn ? 'rgba(255,146,0,.16)' : 'rgba(0,191,64,.16)',
            color: it.warn ? '#D17600' : '#009632',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={it.warn ? 'bell' : 'shieldCheck'} size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#171719' }}>{it.label}</div>
            <div style={{ fontSize: 11.5, color: 'var(--semantic-label-alternative)', marginTop: 1 }}>{it.date}</div>
          </div>
          <div style={{
            fontSize: 12, fontWeight: 700,
            color: it.warn ? '#D17600' : '#009632',
          }}>
            {it.remain}
          </div>
        </div>
      ))}
    </div>
  );
}

function PreviewPdf({ tone }) {
  return (
    <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div
        style={{
          width: 200, height: 280,
          background: '#fff',
          boxShadow: '0 18px 38px rgba(0, 36, 102, .14), 0 4px 8px rgba(0,36,102,.06)',
          borderRadius: 8,
          padding: 16,
          transform: 'rotate(-3deg)',
          animation: 'pdfDrop 700ms cubic-bezier(.2,.7,.2,1) both',
          position: 'relative',
        }}
      >
        <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--semantic-primary-normal)', letterSpacing: '.06em' }}>
          월점검 대장
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#171719', marginTop: 2 }}>햇살어린이공원</div>
        <div style={{ height: 1, background: 'var(--semantic-line-normal-alternative)', margin: '8px 0 10px' }} />
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            <div style={{ width: 30, height: 5, background: 'var(--semantic-fill-strong)', borderRadius: 2 }} />
            <div style={{ flex: 1, height: 5, background: 'var(--semantic-fill-normal)', borderRadius: 2 }} />
            <div style={{ width: 20, height: 5, background: i % 3 === 0 ? '#E2F8EA' : 'var(--semantic-fill-normal)', borderRadius: 2 }} />
          </div>
        ))}
        <div style={{
          position: 'absolute', bottom: 16, left: 16, right: 16,
          fontSize: 8, color: 'var(--semantic-label-alternative)',
          borderTop: '1px dashed var(--semantic-line-normal-normal)',
          paddingTop: 6, display: 'flex', justifyContent: 'space-between',
        }}>
          <span>박지수 안전관리자</span>
          <span>(서명)</span>
        </div>
      </div>
      <div
        style={{
          position: 'absolute', right: 28, bottom: 28,
          padding: '10px 14px',
          background: '#fff', borderRadius: 12,
          border: '1px solid var(--semantic-line-normal-normal)',
          boxShadow: '0 12px 24px rgba(0,36,102,.12)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeRowIn 500ms 400ms ease both',
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(0,191,64,.16)', color: '#009632',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="check" size={16} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#171719' }}>PDF 생성 완료</div>
          <div style={{ fontSize: 9.5, color: 'var(--semantic-label-alternative)' }}>0.8MB · 4페이지</div>
        </div>
      </div>
      <style>{`
        @keyframes pdfDrop {
          from { opacity: 0; transform: translateY(-20px) rotate(0deg); }
          to { opacity: 1; transform: translateY(0) rotate(-3deg); }
        }
      `}</style>
    </div>
  );
}

function PreviewRepair({ tone }) {
  return (
    <div style={{ padding: '14px 18px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { label: '수리 전', g: 'linear-gradient(135deg, #FFB36B, #FF7A45)', tag: '#E52222' },
          { label: '수리 후', g: 'linear-gradient(135deg, #98E6B5, #00BF40)', tag: '#009632' },
        ].map((c, i) => (
          <div
            key={c.label}
            style={{
              aspectRatio: '1 / 1', borderRadius: 10, background: c.g,
              position: 'relative',
              animation: `fadeRowIn 480ms ${i * 120}ms ease both`,
            }}
          >
            <div style={{
              position: 'absolute', top: 8, left: 8,
              fontSize: 10, fontWeight: 700,
              padding: '3px 7px', borderRadius: 4,
              background: '#fff', color: c.tag,
            }}>{c.label}</div>
          </div>
        ))}
      </div>
      <div style={{
        padding: 12, background: 'var(--semantic-background-normal-alternative)',
        border: '1px solid var(--semantic-line-normal-alternative)',
        borderRadius: 10, animation: 'fadeRowIn 480ms 240ms ease both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: 'rgba(0,102,255,.10)', color: 'var(--semantic-primary-normal)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="wrench" size={14} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#171719' }}>
            미끄럼판 균열 보수
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--semantic-label-neutral)', lineHeight: 1.5 }}>
          요청 2026.05.03 · 완료 2026.05.18<br />
          담당 박지수 · 시공사 (주)안전놀이
        </div>
      </div>
      <div style={{
        marginTop: 10, padding: '10px 12px',
        background: 'rgba(0,191,64,.06)',
        border: '1px solid rgba(0,191,64,.20)',
        borderRadius: 10,
        fontSize: 12, fontWeight: 600, color: '#009632',
        display: 'flex', alignItems: 'center', gap: 8,
        animation: 'fadeRowIn 480ms 360ms ease both',
      }}>
        <Icon name="checkCircle" size={16} /> 조치 완료 · 사진 2장 첨부
      </div>
    </div>
  );
}

function PreviewStats({ tone }) {
  const segments = [
    { label: '양호', count: 38, color: '#00BF40' },
    { label: '요주의', count: 6, color: '#FF9200' },
    { label: '요수리', count: 3, color: '#FF5E00' },
    { label: '이용금지', count: 1, color: '#E52222' },
  ];
  const total = segments.reduce((a, b) => a + b.count, 0);
  return (
    <div style={{ padding: '16px 22px' }}>
      <div style={{
        fontSize: 12, fontWeight: 600, color: 'var(--semantic-label-alternative)',
        letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 12,
      }}>
        시설 상태 분포 (48개소)
      </div>
      {/* Stacked bar */}
      <div style={{
        display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden', marginBottom: 16,
      }}>
        {segments.map((s, i) => (
          <div
            key={s.label}
            style={{
              flexBasis: `${(s.count / total) * 100}%`,
              background: s.color,
              animation: `barIn 700ms ${i * 100}ms cubic-bezier(.2,.7,.2,1) both`,
              transformOrigin: 'left',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {segments.map((s, i) => (
          <div
            key={s.label}
            style={{
              padding: '10px 12px',
              background: 'var(--semantic-background-normal-alternative)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              animation: `fadeRowIn 420ms ${i * 80 + 240}ms ease both`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 8, height: 8, borderRadius: 999, background: s.color,
              }} />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#171719' }}>{s.label}</span>
            </div>
            <div style={{
              fontSize: 14, fontWeight: 700, color: '#171719', letterSpacing: '-.015em',
            }}>{s.count}건</div>
          </div>
        ))}
      </div>
      {/* Trend mini-chart */}
      <div style={{
        marginTop: 14, padding: 12,
        background: 'var(--semantic-background-normal-alternative)', borderRadius: 10,
        animation: 'fadeRowIn 420ms 540ms ease both',
      }}>
        <div style={{ fontSize: 11, color: 'var(--semantic-label-alternative)', marginBottom: 6 }}>월별 점검 추이</div>
        <svg width="100%" height="48" viewBox="0 0 280 48" style={{ color: 'var(--semantic-primary-normal)' }}>
          <defs>
            <linearGradient id="trend-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity=".25" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M5 38 L 40 30 L 75 32 L 110 22 L 145 24 L 180 16 L 215 14 L 250 6 L 275 8 L 275 46 L 5 46 Z" fill="url(#trend-g)" />
          <path d="M5 38 L 40 30 L 75 32 L 110 22 L 145 24 L 180 16 L 215 14 L 250 6 L 275 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <style>{`
        @keyframes barIn { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      `}</style>
    </div>
  );
}

window.CoreValue = CoreValue;
