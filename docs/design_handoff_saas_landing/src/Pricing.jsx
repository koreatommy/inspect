// Pricing.jsx — 3 tier pricing cards

function PricingPlans({ highlighted = 'growth' }) {
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      tagline: '소규모 시설 관리자용',
      monthly: 50000,
      unitTier: '1~50개소 · 개소당 1,000원',
      cap: '최대 50개소',
      features: [
        '시설번호·시설명 검색',
        '법적 의무사항 표기',
        '월점검 대장 직접 입력',
        '안전관리자·위탁점검자 디지털 서명',
        '월점검 대장 PDF 생성·미리보기·다운로드',
        '점검자 1명 등록',
        '기본 사진 저장 용량 5GB',
      ],
      recommended: ['어린이집', '유치원', '소규모 관리사무소'],
    },
    {
      id: 'growth',
      name: 'Growth',
      tagline: '지자체 · 교육기관 · 다중시설 관리자용',
      monthly: 100000,
      unitTier: '1~50개소 1,000원 · 51~200개소 800원',
      cap: '최대 200개소',
      features: [
        'Starter 전체 기능 포함',
        '체크리스트 또는 직접 위해요인 입력',
        '기구별 위해요소 사진 첨부',
        '점검자 등록·수정·삭제 최대 5명',
        '점검자 휴대폰 서명',
        '기본 사진 저장 용량 10GB',
      ],
      addons: ['수리이력 관리 대장', '월 점검 통계 분석', '추가 점검자', '저장 용량 추가'],
      recommended: ['지자체', '교육청', '학교', '중소 규모 위탁점검기관'],
    },
    {
      id: 'pro',
      name: 'Pro',
      tagline: '전문 위탁점검기관 · 대규모 시설용',
      monthly: 150000,
      unitTier: '구간 누진 · 500개소 초과 별도 문의',
      cap: '500개소, 초과 시 별도 문의',
      features: [
        'Growth 전체 기능 포함',
        '수리이력 관리 대장 기본 포함',
        '수리 전·후 사진 관리',
        '월 점검 통계 분석 기본 포함',
        '점검자 무제한 등록',
        '사진 저장 100GB',
        '전담 고객 성공 매니저',
        'API 연동 지원',
        'AI 안전점검 보고 및 지도점검 연계',
      ],
      recommended: ['전문 위탁점검기관', '공공기관', '전국 단위 시설관리 조직'],
    },
  ];

  return (
    <section
      id="pricing"
      data-bg="#ffffff"
      data-fg="dark"
      style={{ padding: '140px 32px 100px', position: 'relative' }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <Reveal>
            <div style={{
              fontSize: 13, fontWeight: 600, color: 'var(--semantic-primary-normal)',
              letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 16,
            }}>
              요금제
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 style={{
              margin: '0 0 16px',
              fontSize: 'clamp(34px, 4vw, 52px)',
              lineHeight: 1.1, letterSpacing: '-.032em', fontWeight: 700,
              color: 'var(--semantic-label-strong)', textWrap: 'balance',
            }}>
              관리 시설 수에 따라 합리적으로
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p style={{
              margin: '0 auto', maxWidth: 560,
              fontSize: 17, lineHeight: 1.6,
              color: 'var(--semantic-label-neutral)',
            }}>
              월 기본료 + 관리 개소별 단가 방식이며, 시설 수가 많을수록 구간별 단가가 낮아지는 누진 구조입니다.
            </p>
          </Reveal>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
          alignItems: 'stretch',
        }}>
          {plans.map((p, i) => {
            const isHi = p.id === highlighted;
            return (
              <Reveal key={p.id} delay={i * 80} y={28}>
                <PlanCard plan={p} highlighted={isHi} />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PlanCard({ plan, highlighted }) {
  const bg = highlighted ? '#0F0F10' : '#fff';
  const fg = highlighted ? '#fff' : 'var(--semantic-label-strong)';
  const muted = highlighted ? 'rgba(247,247,248,.65)' : 'var(--semantic-label-neutral)';
  const border = highlighted ? 'transparent' : 'var(--semantic-line-normal-alternative)';

  return (
    <div
      style={{
        position: 'relative',
        background: bg,
        color: fg,
        border: `1px solid ${border}`,
        borderRadius: 20,
        padding: '32px 28px 28px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: highlighted ? '0 30px 60px rgba(0, 36, 102, .25), 0 8px 20px rgba(0, 36, 102, .15)' : '0 1px 2px rgba(23,23,23,.02)',
      }}
    >
      {highlighted && (
        <div style={{
          position: 'absolute', top: -12, left: '50%',
          transform: 'translateX(-50%)',
          padding: '5px 12px',
          background: 'var(--semantic-primary-normal)',
          color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '.02em',
          borderRadius: 999,
        }}>
          가장 인기 있는 요금제
        </div>
      )}

      <div style={{
        fontSize: 22, fontWeight: 700, letterSpacing: '-.022em',
        color: fg,
      }}>
        {plan.name}
      </div>
      <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>
        {plan.tagline}
      </div>

      <div style={{ margin: '24px 0 8px', display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: muted }}>월</span>
        <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1 }}>
          {fmt(plan.monthly)}
        </span>
        <span style={{ fontSize: 14, fontWeight: 500, color: muted }}>원~</span>
      </div>
      <div style={{ fontSize: 12.5, color: muted, marginBottom: 18 }}>
        {plan.unitTier}
      </div>
      <div style={{
        padding: '8px 12px', borderRadius: 8,
        background: highlighted ? 'rgba(255,255,255,.07)' : 'var(--semantic-background-normal-alternative)',
        fontSize: 12.5, color: highlighted ? 'rgba(247,247,248,.8)' : 'var(--semantic-label-neutral)',
        marginBottom: 24,
      }}>
        관리 한도 · <strong style={{ color: fg, fontWeight: 600 }}>{plan.cap}</strong>
      </div>

      <button
        style={{
          width: '100%', height: 48,
          background: highlighted ? '#fff' : 'var(--semantic-label-strong)',
          color: highlighted ? '#0F0F10' : '#fff',
          border: 0, borderRadius: 10,
          fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15,
          letterSpacing: '-.01em', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          marginBottom: 28,
          transition: 'opacity 160ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '.88'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        {plan.id === 'pro' ? '도입 상담 신청' : '시작하기'}
        <Icon name="arrowRight" size={16} />
      </button>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
        {plan.features.map((f) => (
          <li key={f} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.4, color: fg }}>
            <span style={{
              flexShrink: 0,
              width: 18, height: 18, borderRadius: 999,
              background: highlighted ? 'rgba(0,191,64,.18)' : 'rgba(0,191,64,.12)',
              color: highlighted ? '#7DF5A5' : '#009632',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 2,
            }}>
              <Icon name="check" size={11} />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {plan.addons && (
        <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${highlighted ? 'rgba(255,255,255,.12)' : 'var(--semantic-line-normal-alternative)'}` }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: muted, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 8 }}>
            선택 부가기능
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {plan.addons.map((a) => (
              <span key={a} style={{
                fontSize: 11.5, fontWeight: 500,
                padding: '4px 10px', borderRadius: 999,
                background: highlighted ? 'rgba(255,255,255,.08)' : 'var(--semantic-background-normal-alternative)',
                color: highlighted ? 'rgba(247,247,248,.85)' : 'var(--semantic-label-neutral)',
              }}>{a}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 20 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: muted, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 6 }}>
          추천 대상
        </div>
        <div style={{ fontSize: 13, color: muted, lineHeight: 1.5 }}>
          {plan.recommended.join(' · ')}
        </div>
      </div>
    </div>
  );
}

window.PricingPlans = PricingPlans;
