// FAQ.jsx — accordion section

function FAQItem({ q, a, open, onToggle }) {
  return (
    <div
      style={{
        borderBottom: '1px solid var(--semantic-line-normal-alternative)',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%', textAlign: 'left',
          padding: '24px 4px',
          background: 'transparent', border: 0, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'var(--font-sans)',
          color: 'var(--semantic-label-strong)',
        }}
      >
        <span style={{
          fontSize: 18, fontWeight: 600, letterSpacing: '-.018em',
          paddingRight: 24,
        }}>
          {q}
        </span>
        <span style={{
          flexShrink: 0,
          width: 32, height: 32, borderRadius: 999,
          background: open ? 'var(--semantic-label-strong)' : 'var(--semantic-background-normal-alternative)',
          color: open ? '#fff' : 'var(--semantic-label-strong)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 220ms ease, color 220ms ease, transform 220ms ease',
          transform: open ? 'rotate(45deg)' : 'rotate(0)',
        }}>
          <Icon name="plus" size={16} />
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? 400 : 0,
          opacity: open ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 360ms cubic-bezier(.2,.7,.2,1), opacity 240ms ease',
        }}
      >
        <p style={{
          margin: 0, padding: '0 4px 28px',
          fontSize: 15.5, lineHeight: 1.7,
          color: 'var(--semantic-label-neutral)', maxWidth: 720,
        }}>
          {a}
        </p>
      </div>
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = React.useState(0);
  const items = [
    {
      q: '어린이놀이시설 월점검은 꼭 해야 하나요?',
      a: '네. 어린이놀이시설 관리주체는 월 1회 자체 안전점검을 실시해야 합니다. 행정안전부 어린이놀이시설 안전관리시스템도 관리주체의 월 1회 자체 안전점검 의무를 안내하고 있습니다.',
    },
    {
      q: '점검대장은 PDF로 저장할 수 있나요?',
      a: '네. 월점검 대장을 작성한 뒤 PDF로 미리보기·다운로드할 수 있습니다. Starter, Growth, Pro 모든 요금제에서 월점검 대장 PDF 생성 기능을 제공합니다.',
    },
    {
      q: '사진 첨부 기능은 모든 요금제에서 제공되나요?',
      a: '아닙니다. 기구별 위해요소 사진 첨부는 Growth와 Pro에서 제공되며, Starter에는 포함되지 않습니다. Starter는 월점검 대장 자체에 사진 없이 텍스트 점검 결과만 기록합니다.',
    },
    {
      q: '수리이력 관리도 가능한가요?',
      a: '가능합니다. Growth에서는 부가기능으로 선택할 수 있으며, Pro에서는 기본 포함 기능으로 구성됩니다. 수리 전·후 사진, 조치 완료 여부, 시공사 정보까지 함께 관리할 수 있습니다.',
    },
    {
      q: '지자체나 공공기관도 사용할 수 있나요?',
      a: '네. 다수 시설을 관리하는 지자체, 교육청, 공공기관은 Growth 또는 Pro 요금제가 적합합니다. Pro에서는 API 연동 지원과 전담 고객 성공 매니저 기능까지 제공합니다.',
    },
    {
      q: '데이터 보관과 보안은 어떻게 되나요?',
      a: '국내 데이터센터에 암호화 저장되며, 점검 이력은 시설별 최소 5년 보관됩니다. 안전관리자·위탁점검자별 권한 분리, 감사 로그, 2단계 인증을 지원합니다.',
    },
  ];

  return (
    <section
      id="faq"
      data-bg="#ffffff"
      data-fg="dark"
      style={{ padding: '120px 32px', position: 'relative' }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 64 }}>
        <div>
          <Reveal>
            <div style={{
              fontSize: 13, fontWeight: 600, color: 'var(--semantic-primary-normal)',
              letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 16,
            }}>
              자주 묻는 질문
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 style={{
              margin: 0,
              fontSize: 'clamp(28px, 3.2vw, 40px)',
              lineHeight: 1.15, letterSpacing: '-.025em', fontWeight: 700,
              color: 'var(--semantic-label-strong)',
              textWrap: 'balance',
            }}>
              궁금한 점을<br />빠르게 풀어드립니다
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p style={{
              margin: '20px 0 0', fontSize: 15, lineHeight: 1.6,
              color: 'var(--semantic-label-neutral)',
            }}>
              여기에서 답을 찾지 못하셨나요? 도입 상담을 통해 기관 환경에 맞는 답변을 드립니다.
            </p>
          </Reveal>
        </div>

        <div>
          {items.map((it, i) => (
            <FAQItem
              key={it.q}
              q={it.q}
              a={it.a}
              open={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

window.FAQ = FAQ;
