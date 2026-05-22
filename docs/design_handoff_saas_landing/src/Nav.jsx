// Nav.jsx — sticky top navigation, transparent → white on scroll

function Nav({ onCtaClick }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { id: 'features', label: '기능' },
    { id: 'customers', label: '도입 대상' },
    { id: 'pricing', label: '요금제' },
    { id: 'calculator', label: '요금 계산' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,0)',
        backdropFilter: scrolled ? 'saturate(180%) blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--semantic-line-normal-alternative)' : '1px solid transparent',
        transition: 'background 280ms ease, border-color 280ms ease, backdrop-filter 280ms ease',
      }}
    >
      <nav
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          height: 64,
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 32,
        }}
      >
        <a
          href="#top"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <BrandLogo size={20} />
        </a>

        <ul
          style={{
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            gap: 4,
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                onClick={(e) => { e.preventDefault(); scrollToId(l.id); }}
                style={{
                  display: 'inline-flex',
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 14.5,
                  fontWeight: 500,
                  letterSpacing: '-.01em',
                  color: 'var(--semantic-label-neutral)',
                  textDecoration: 'none',
                  transition: 'color 160ms ease, background 160ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--semantic-label-strong)';
                  e.currentTarget.style.background = 'var(--semantic-fill-normal)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--semantic-label-neutral)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a
            href="#login"
            style={{
              padding: '9px 16px',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--semantic-label-neutral)',
              textDecoration: 'none',
              borderRadius: 8,
            }}
          >
            로그인
          </a>
          <button
            onClick={onCtaClick}
            style={{
              height: 38,
              padding: '0 18px',
              borderRadius: 10,
              border: 0,
              background: 'var(--semantic-label-strong)',
              color: '#fff',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '-.005em',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background 160ms ease, transform 160ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#000'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--semantic-label-strong)'; }}
          >
            무료 상담 신청
            <Icon name="arrowRight" size={16} />
          </button>
        </div>
      </nav>
    </div>
  );
}

window.Nav = Nav;
