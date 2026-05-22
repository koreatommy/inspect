// Problem.jsx — "Still managing this way?" section with comparison table

function Problem() {
  const rows = [
    { old: '종이 점검대장 작성', issue: '분실, 누락, 보관 불편', icon: 'doc' },
    { old: '엑셀 수기 관리', issue: '시설 수가 늘어나면 이력 추적 어려움', icon: 'chart' },
    { old: '사진 별도 저장', issue: '어떤 시설·기구의 사진인지 확인 어려움', icon: 'camera' },
    { old: '안전관리자 서명 수기', issue: '위탁점검자·관리자 확인 절차 비효율', icon: 'signature' },
    { old: '법적 의무사항 별도 확인', issue: '설치검사·교육·보험 만료일 누락 위험', icon: 'shield' },
    { old: '보고서 수작업 작성', issue: 'PDF 변환, 제출용 문서 정리에 시간 소요', icon: 'clipboard' },
  ];

  return (
    <section
      id="problem"
      data-bg="#1B1C1E"
      data-fg="light"
      style={{
        padding: '140px 32px',
        position: 'relative',
        color: '#F7F7F8',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 999,
            border: '1px solid rgba(255,255,255,.16)',
            background: 'rgba(255,255,255,.05)',
            fontSize: 13, fontWeight: 500,
            color: '#9EC5FF',
            marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: '#FF6363', display: 'inline-block' }} />
            현장 이슈
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(34px, 4.4vw, 56px)',
            lineHeight: 1.1,
            letterSpacing: '-.032em',
            fontWeight: 700,
            color: '#fff',
            textWrap: 'balance',
            maxWidth: 800,
          }}>
            아직도 엑셀, 종이대장, 수기 서명으로<br />
            <span style={{ color: '#9EC5FF' }}>관리하고 계신가요?</span>
          </h2>
        </Reveal>

        <Reveal delay={160}>
          <p style={{
            margin: '24px 0 0', maxWidth: 720,
            fontSize: 18, lineHeight: 1.6,
            color: 'rgba(247,247,248,.7)',
            letterSpacing: '-.005em',
          }}>
            어린이놀이시설 안전점검은 단순한 기록이 아닙니다.
            법적 의무사항을 놓치지 않아야 하고, 점검 결과를 보관해야 하며,
            지도점검·민원 대응 자료로 즉시 제출할 수 있어야 합니다.
          </p>
        </Reveal>

        <div
          style={{
            marginTop: 72,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 16,
          }}
        >
          {rows.map((r, i) => (
            <Reveal key={r.old} delay={i * 60} y={32}>
              <div
                style={{
                  position: 'relative',
                  padding: '24px 24px 22px',
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: 16,
                  transition: 'background 220ms ease, border-color 220ms ease, transform 220ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.07)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,.16)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(255,99,99,.14)', color: '#FF9090',
                  marginBottom: 18,
                }}>
                  <Icon name={r.icon} size={22} />
                </div>
                <div style={{
                  fontSize: 17, fontWeight: 700,
                  color: '#fff', letterSpacing: '-.015em', marginBottom: 6,
                }}>
                  {r.old}
                </div>
                <div style={{ fontSize: 14.5, lineHeight: 1.5, color: 'rgba(247,247,248,.62)' }}>
                  {r.issue}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bottom callout */}
        <Reveal delay={120}>
          <div
            style={{
              marginTop: 56, padding: '20px 24px',
              background: 'rgba(255,146,0,.08)',
              border: '1px solid rgba(255,146,0,.24)',
              borderRadius: 14,
              display: 'flex', gap: 16, alignItems: 'center',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(255,146,0,.18)', color: '#FFC06E',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name="bell" size={22} />
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.5, color: 'rgba(247,247,248,.85)' }}>
              <strong style={{ color: '#fff', fontWeight: 600 }}>안전점검 미실시·결과 미보관·안전교육 미이수</strong>는
              행정안전부 어린이놀이시설 안전관리시스템 기준 <strong style={{ color: '#FFC06E' }}>과태료 부과 대상</strong>입니다.
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

window.Problem = Problem;
