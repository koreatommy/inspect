// TrustStrip.jsx — small section showing trusted organizations
// Uses text-based "logos" since we don't have real org marks.

function TrustStrip() {
  const orgs = [
    '서울특별시 교육청',
    '강남구청',
    '경기도교육청',
    '한국놀이시설관리원',
    'SK어린이집',
    '롯데월드 키즈',
    '한국공원녹지협회',
  ];
  return (
    <section
      data-bg="#F4F6FA"
      data-fg="dark"
      style={{
        padding: '64px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--semantic-label-alternative)',
            letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 28,
          }}>
            전국 128개 기관이 신뢰하고 있습니다
          </div>
        </Reveal>
        <div
          style={{
            display: 'flex',
            gap: 56,
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            opacity: .55,
          }}
        >
          {orgs.map((o) => (
            <div
              key={o}
              style={{
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '-.015em',
                color: 'var(--semantic-label-strong)',
                fontVariant: 'all-small-caps',
              }}
            >
              {o}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

window.TrustStrip = TrustStrip;
