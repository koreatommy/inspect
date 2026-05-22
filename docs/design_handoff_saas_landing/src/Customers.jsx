// Customers.jsx — target customer segments

function Customers() {
  const list = [
    { icon: 'school', label: '어린이집 · 유치원', desc: '월점검 대장, 보험, 안전교육 이력 관리' },
    { icon: 'building', label: '학교 · 교육청', desc: '다수 시설의 점검 현황 통합 관리' },
    { icon: 'building', label: '아파트 관리사무소', desc: '단지 내 놀이시설 안전점검 기록 보관' },
    { icon: 'tree', label: '도시공원 · 공공시설', desc: '시설별 점검·보수 이력 관리' },
    { icon: 'shieldCheck', label: '지자체', desc: '관내 어린이놀이시설 관리 현황 파악' },
    { icon: 'clipboard', label: '위탁점검기관', desc: '다수 고객 시설 점검·서명·보고서 발행' },
  ];

  return (
    <section
      id="customers"
      data-bg="#F4F6FA"
      data-fg="dark"
      style={{ padding: '120px 32px', position: 'relative' }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <Reveal>
            <div style={{
              fontSize: 13, fontWeight: 600, color: 'var(--semantic-primary-normal)',
              letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 16,
            }}>
              도입 대상
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 style={{
              margin: 0,
              fontSize: 'clamp(32px, 3.8vw, 48px)',
              lineHeight: 1.1, letterSpacing: '-.03em', fontWeight: 700,
              color: 'var(--semantic-label-strong)',
            }}>
              이런 기관과 관리자를 위한 서비스입니다
            </h2>
          </Reveal>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 12,
        }}>
          {list.map((c, i) => (
            <Reveal key={c.label} delay={i * 50} y={20}>
              <div style={{
                padding: '24px 22px',
                background: '#fff',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                transition: 'transform 220ms ease, box-shadow 220ms ease',
                height: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,36,102,.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(0,102,255,.08)',
                  color: 'var(--semantic-primary-normal)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon name={c.icon} size={22} />
                </div>
                <div>
                  <div style={{
                    fontSize: 16, fontWeight: 700, color: 'var(--semantic-label-strong)',
                    letterSpacing: '-.015em',
                  }}>{c.label}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--semantic-label-neutral)', marginTop: 2, lineHeight: 1.4 }}>
                    {c.desc}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

window.Customers = Customers;
