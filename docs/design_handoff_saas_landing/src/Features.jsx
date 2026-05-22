// Features.jsx — 6 feature cards in a grid

function Features() {
  const list = [
    {
      icon: 'building',
      title: '시설 검색 및 기본정보',
      desc: '시설번호·시설명 검색, 관리 시설 목록화, 시설별 점검 현황과 법적 의무사항을 한 화면에서 확인합니다.',
      tags: ['시설번호 검색', '의무사항 표기', '관리 시설 목록'],
      accent: { fg: '#0066FF', bg: 'rgba(0,102,255,.10)' },
    },
    {
      icon: 'doc',
      title: '월점검 대장 작성',
      desc: '월별 점검대장 직접 입력, 안전관리자·위탁점검자 디지털 서명, PDF 미리보기 및 다운로드를 지원합니다.',
      tags: ['디지털 서명', 'PDF 생성', '미리보기'],
      accent: { fg: '#5B37ED', bg: 'rgba(101,65,242,.10)' },
    },
    {
      icon: 'clipboard',
      title: '기구별 체크리스트 점검',
      desc: '놀이기구별 체크리스트와 직접 위해요인 입력, 기구별 사진 첨부와 점검 상태 분류까지 한 번에.',
      tags: ['체크리스트', '위해요소 기록', '상태 분류'],
      accent: { fg: '#009632', bg: 'rgba(0,191,64,.10)' },
    },
    {
      icon: 'wrench',
      title: '수리이력 관리',
      desc: '수리 요청 이력, 수리 전·후 사진, 조치 완료 여부를 시설 단위로 관리합니다. 수리이력 대장 PDF로 출력 가능합니다.',
      tags: ['수리 전후 사진', '조치 추적', '이력 PDF'],
      accent: { fg: '#D17600', bg: 'rgba(255,146,0,.12)' },
    },
    {
      icon: 'chart',
      title: '통계 및 분석 대시보드',
      desc: '양호·요주의·요수리·이용금지 현황, 월별 점검 추이, 미조치 시설을 분석하여 관리 우선순위를 도출합니다.',
      tags: ['상태 분포', '월별 추이', '우선순위'],
      accent: { fg: '#0098B2', bg: 'rgba(0,189,222,.12)' },
    },
    {
      icon: 'users',
      title: '사용자 및 점검자 관리',
      desc: '안전관리자·위탁점검자 등록, 휴대폰 서명, 점검자별 권한 관리. 기관 규모에 맞춰 인원을 늘릴 수 있습니다.',
      tags: ['권한 관리', '휴대폰 서명', '점검자 등록'],
      accent: { fg: '#E846CD', bg: 'rgba(232,70,205,.12)' },
    },
  ];

  return (
    <section
      id="features"
      data-bg="#ffffff"
      data-fg="dark"
      style={{ padding: '140px 32px', position: 'relative' }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 64 }}>
          <div style={{ maxWidth: 720 }}>
            <Reveal>
              <div style={{
                fontSize: 13, fontWeight: 600, color: 'var(--semantic-primary-normal)',
                letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 16,
              }}>
                주요 기능
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h2 style={{
                margin: 0,
                fontSize: 'clamp(34px, 4vw, 52px)',
                lineHeight: 1.1, letterSpacing: '-.032em', fontWeight: 700,
                color: 'var(--semantic-label-strong)', textWrap: 'balance',
              }}>
                안전관리에 필요한 모든 기능을<br />
                <span style={{ color: 'var(--semantic-label-alternative)' }}>하나로 통합했습니다</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={160} style={{ minWidth: 240, maxWidth: 380 }}>
            <p style={{
              margin: 0, fontSize: 16, lineHeight: 1.6,
              color: 'var(--semantic-label-neutral)',
            }}>
              현장 점검과 행정 보고가 분리되지 않습니다.
              모든 기능은 시설 단위 데이터로 연결되어 있습니다.
            </p>
          </Reveal>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}>
          {list.map((f, i) => (
            <Reveal key={f.title} delay={i * 50} y={28}>
              <article
                style={{
                  padding: 28,
                  background: '#fff',
                  border: '1px solid var(--semantic-line-normal-alternative)',
                  borderRadius: 18,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'box-shadow 240ms ease, transform 240ms ease, border-color 240ms ease',
                  cursor: 'default',
                  height: '100%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 18px 36px rgba(0,36,102,.10), 0 4px 8px rgba(0,36,102,.04)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--semantic-line-normal-alternative)';
                }}
              >
                {/* Numbered corner */}
                <div style={{
                  position: 'absolute', top: 20, right: 24,
                  fontSize: 11, fontWeight: 700,
                  color: 'var(--semantic-label-assistive)', letterSpacing: '.06em',
                }}>
                  0{i + 1}
                </div>

                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: f.accent.bg, color: f.accent.fg,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <Icon name={f.icon} size={24} />
                </div>

                <h3 style={{
                  margin: '0 0 8px', fontSize: 19, lineHeight: 1.3,
                  fontWeight: 700, letterSpacing: '-.018em',
                  color: 'var(--semantic-label-strong)',
                }}>
                  {f.title}
                </h3>
                <p style={{
                  margin: 0, fontSize: 14.5, lineHeight: 1.6,
                  color: 'var(--semantic-label-neutral)',
                }}>
                  {f.desc}
                </p>

                <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {f.tags.map((t) => (
                    <span key={t} style={{
                      fontSize: 12, fontWeight: 500,
                      padding: '4px 10px',
                      background: 'var(--semantic-background-normal-alternative)',
                      color: 'var(--semantic-label-neutral)',
                      borderRadius: 999,
                    }}>{t}</span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

window.Features = Features;
