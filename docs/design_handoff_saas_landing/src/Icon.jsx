// Icon.jsx — tiny SVG icon set + brand mark

const ICONS = {
  check: <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12.5l2.5 2.5L16 9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  arrowUpRight: <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  plus: <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  minus: <path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  chevronDown: <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  doc: (
    <>
      <path d="M7 3h7l4 4v14H7z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 3v4h4M9 13h6M9 17h6M9 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  shield: <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />,
  shieldCheck: (
    <>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m8.5 12 2.5 2.5L15.5 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  clipboard: (
    <>
      <rect x="6" y="4" width="12" height="17" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="2.5" width="6" height="3.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 11h6M9 14h6M9 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="13.5" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  wrench: (
    <>
      <path d="m14.5 4.5 3 3-3 3-2-2-7 7 2 2 7-7 2 2 3-3-3-3a4 4 0 0 0-5-2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 15v-3M12 15V8m4 7v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="9.5" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 19c.7-3 3.4-4.5 6-4.5s5.3 1.5 6 4.5M14.5 14.5c2 0 4.5 1 5.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  signature: <path d="M3 18s2-1 4-5 4 5 6 0 4 1 8-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  bell: <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5zM10 19a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />,
  calc: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7h8M8 12h2m3 0h3m-8 4h2m3 0h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V7l8-3 8 3v14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 11h2m2 0h2M9 14h2m2 0h2M9 17h2m2 0h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  school: (
    <>
      <path d="M3 10l9-4 9 4-9 4z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 12v5c2 1.5 8 1.5 10 0v-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M21 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  tree: (
    <>
      <path d="M12 3c-3 2-5 4.5-5 7a5 5 0 0 0 4 4.9V21h2v-6.1A5 5 0 0 0 17 10c0-2.5-2-5-5-7z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </>
  ),
  api: (
    <>
      <rect x="3" y="9" width="6" height="6" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="15" y="9" width="6" height="6" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 12h6M12 6v3m0 6v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 8c0 2.2 1.8 4 4 4-2.2 0-4 1.8-4 4 0-2.2-1.8-4-4-4 2.2 0 4-1.8 4-4z" fill="currentColor" />
    </>
  ),
  play: <path d="M7 5v14l12-7z" fill="currentColor" />,
  pause: <path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" />,
};

function Icon({ name, size = 24, color, style = {}, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ display: 'block', color: color || 'currentColor', ...style }}
      aria-hidden="true"
      {...rest}
    >
      {ICONS[name]}
    </svg>
  );
}

// Brand mark for our SaaS — a shield + check, in product blue
function BrandMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="bm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0B66FF" />
          <stop offset="1" stopColor="#3385FF" />
        </linearGradient>
      </defs>
      <path d="M16 2 4 6.5v9c0 7 5.2 11.5 12 14.5 6.8-3 12-7.5 12-14.5v-9z" fill="url(#bm-g)" />
      <path d="m10 16 4 4 8.5-9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BrandLogo({ size = 22 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <BrandMark size={size + 6} />
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: size * 0.78,
        letterSpacing: '-.02em',
        color: 'var(--semantic-label-strong)',
      }}>
        놀이지킴
      </span>
    </div>
  );
}

Object.assign(window, { Icon, BrandMark, BrandLogo });
