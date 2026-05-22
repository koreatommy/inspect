// Comparison.jsx — before/after impact section

function Comparison() {
  const rows = [
    { before: '종이 점검대장 수기 작성', after: '모바일·웹 기반 점검 입력' },
    { before: '사진 파일 별도 보관', after: '시설·기구별 사진 자동 분류' },
    { before: '서명 누락 발생', after: '안전관리자·위탁점검자 디지털 서명' },
    { before: '보고서 수작업 작성', after: 'PDF 보고서 자동 생성' },
    { before: '점검 이력 확인 어려움', after: '시설별 월별 점검 이력 관리' },
    { before: '수리 조치 추적 어려움', after: '수리 전·후 사진과 조치 이력' },
    { before: '법적 의무사항 별도 확인', after: '검사·교육·보험 통합 확인' },
  ];

  return (
    <section
      id="comparison"
      data-bg="#FBFCFE"
      data-fg="dark"
      style={{ padding: '140px 32px', position: 'relative' }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <Reveal>
            <div style={{
              fontSize: 13, fontWeight: 600, color: 'var(--semantic-primary-normal)',
              letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 16,
            }}>
              도입 효과
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 style={{
              margin: 0,
              fontSize: 'clamp(32px, 3.8vw, 48px)',
              lineHeight: 1.1, letterSpacing: '-.03em', fontWeight: 700,
              color: 'var(--semantic-label-strong)',
            }}>
              도입 후 달라지는 것들
            </h2>
          </Reveal>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid var(--semantic-line-normal-alternative)',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(23,23,23,.02)',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto 1fr',
            padding: '16px 24px',
            background: 'var(--semantic-background-normal-alternative)',
            borderBottom: '1px solid var(--semantic-line-normal-alternative)',
            fontSize: 12.5, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase',
            color: 'var(--semantic-label-alternative)',
            alignItems: 'center', gap: 16,
          }}>
            <span>도입 전</span>
            <span style={{ width: 24 }} />
            <span style={{ color: 'var(--semantic-primary-normal)' }}>도입 후</span>
          </div>

          {rows.map((r, i) => (
            <Reveal key={r.before} delay={i * 50} y={12}>
              <div
                style={{
                  display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                  padding: '20px 24px',
                  borderBottom: i < rows.length - 1 ? '1px solid var(--semantic-line-normal-alternative)' : 'none',
                  alignItems: 'center', gap: 16,
                }}
              >
                <div style={{
                  fontSize: 15, color: 'var(--semantic-label-neutral)',
                  textDecoration: 'line-through', textDecorationColor: 'var(--semantic-label-assistive)',
                }}>
                  {r.before}
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: 999,
                  background: 'rgba(0,102,255,.10)',
                  color: 'var(--semantic-primary-normal)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="arrowRight" size={14} />
                </div>
                <div style={{
                  fontSize: 15.5, fontWeight: 600,
                  color: 'var(--semantic-label-strong)', letterSpacing: '-.01em',
                }}>
                  {r.after}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

window.Comparison = Comparison;
