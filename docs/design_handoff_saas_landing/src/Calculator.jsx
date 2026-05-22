// Calculator.jsx — mid-page pricing estimator

function Calculator() {
  const [count, setCount] = React.useState(80);

  function calcPlan(c) {
    // Returns {plan, base, units, total, hint, blocked}
    if (c <= 50) {
      return {
        plan: 'Starter',
        base: 50000,
        units: c * 1000,
        total: 50000 + c * 1000,
        hint: '소규모 시설에 적합합니다',
      };
    }
    if (c <= 200) {
      const t1 = 50 * 1000;
      const t2 = (c - 50) * 800;
      return {
        plan: 'Growth',
        base: 100000,
        units: t1 + t2,
        total: 100000 + t1 + t2,
        hint: '시설 수가 늘어날수록 단가가 낮아집니다',
      };
    }
    if (c <= 500) {
      const t1 = 50 * 1000;
      const t2 = 150 * 800;
      const t3 = (c - 200) * 600;
      return {
        plan: 'Pro',
        base: 150000,
        units: t1 + t2 + t3,
        total: 150000 + t1 + t2 + t3,
        hint: '대규모 시설 관리에 가장 적합합니다',
      };
    }
    return {
      plan: 'Pro · 별도 문의',
      base: 150000,
      units: null,
      total: null,
      hint: '500개소 초과 시 전담 매니저가 별도 견적을 안내드립니다',
      blocked: true,
    };
  }

  const r = calcPlan(count);
  const planColor =
    r.plan === 'Starter' ? '#0066FF' :
    r.plan.startsWith('Growth') ? '#5B37ED' : '#E846CD';

  return (
    <section
      id="calculator"
      data-bg="var(--semantic-primary-normal)"
      data-fg="light"
      style={{
        padding: '120px 32px',
        position: 'relative',
        color: '#fff',
        background: 'linear-gradient(135deg, var(--semantic-primary-heavy) 0%, var(--semantic-primary-normal) 50%, var(--semantic-primary-strong) 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Decorative pattern */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, opacity: .25, pointerEvents: 'none' }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="calc-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,.35)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#calc-grid)" />
        </svg>
      </div>
      <div aria-hidden="true" style={{
        position: 'absolute', right: -100, top: -100,
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,.18), transparent 60%)',
      }} />

      <div style={{
        position: 'relative',
        maxWidth: 1100, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center',
      }}>
        <div>
          <Reveal>
            <div style={{
              fontSize: 13, fontWeight: 600,
              letterSpacing: '.06em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,.7)', marginBottom: 16,
            }}>
              요금 계산기
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 style={{
              margin: '0 0 16px',
              fontSize: 'clamp(32px, 3.8vw, 48px)',
              lineHeight: 1.1, letterSpacing: '-.032em', fontWeight: 700,
              color: '#fff', textWrap: 'balance',
            }}>
              우리 기관의 예상 월 이용료를<br />
              바로 확인하세요
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p style={{
              margin: 0, fontSize: 16.5, lineHeight: 1.6,
              color: 'rgba(255,255,255,.78)', maxWidth: 440,
            }}>
              관리 시설 수에 따라 적합한 요금제와 예상 월 요금을 즉시 보여드립니다.
              누진 단가가 자동으로 반영됩니다.
            </p>
          </Reveal>
        </div>

        <Reveal delay={140} y={20}>
          <div style={{
            background: '#fff',
            color: 'var(--semantic-label-strong)',
            borderRadius: 20,
            padding: 32,
            boxShadow: '0 30px 80px rgba(0, 20, 60, .25), 0 8px 16px rgba(0,20,60,.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--semantic-label-strong)' }}>
                관리 시설 수
              </label>
              <div style={{
                fontSize: 28, fontWeight: 700, color: planColor,
                letterSpacing: '-.025em',
              }}>
                {count >= 500 ? '500+' : count}<span style={{ fontSize: 16, color: 'var(--semantic-label-alternative)', fontWeight: 500, marginLeft: 4 }}>개소</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="500"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              style={{
                width: '100%',
                accentColor: planColor,
                marginTop: 8,
              }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, color: 'var(--semantic-label-alternative)', marginTop: 6,
            }}>
              <span>1개소</span><span>50</span><span>200</span><span>500+</span>
            </div>

            {/* Result */}
            <div style={{
              marginTop: 24, padding: 20,
              background: 'var(--semantic-background-normal-alternative)',
              borderRadius: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  padding: '3px 10px', borderRadius: 999,
                  background: planColor, color: '#fff', letterSpacing: '.02em',
                }}>
                  추천 · {r.plan}
                </span>
                <span style={{ fontSize: 12, color: 'var(--semantic-label-neutral)' }}>{r.hint}</span>
              </div>

              {r.blocked ? (
                <div>
                  <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-.025em' }}>
                    별도 견적
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--semantic-label-neutral)', marginTop: 4 }}>
                    500개소 초과는 사용 패턴과 요구사항을 반영하여 안내드립니다.
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-.03em' }}>
                      {fmt(r.total)}
                    </span>
                    <span style={{ fontSize: 16, color: 'var(--semantic-label-alternative)' }}>원 / 월</span>
                  </div>
                  <div style={{
                    marginTop: 14, display: 'grid', gap: 4,
                    fontSize: 13, color: 'var(--semantic-label-neutral)',
                  }}>
                    <Row label="월 기본료" value={`${fmt(r.base)}원`} />
                    <Row label={`개소별 단가 (${count}개소)`} value={`${fmt(r.units)}원`} />
                  </div>
                </>
              )}

              <button
                style={{
                  width: '100%', marginTop: 16, height: 48,
                  background: 'var(--semantic-label-strong)', color: '#fff',
                  border: 0, borderRadius: 10,
                  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15,
                  letterSpacing: '-.01em', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                도입 상담 신청
                <Icon name="arrowRight" size={16} />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>{label}</span>
      <span style={{ color: 'var(--semantic-label-strong)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

window.Calculator = Calculator;
