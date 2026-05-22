// utils.jsx — shared hooks + helpers

// IntersectionObserver-based reveal hook
function useReveal(options = {}) {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px', ...options }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

// Reveal wrapper — fades + translates child in
function Reveal({ children, delay = 0, y = 24, as = 'div', style = {}, ...rest }) {
  const [ref, visible] = useReveal();
  const Tag = as;
  return (
    <Tag
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0,0,0)' : `translate3d(0,${y}px,0)`,
        transition: `opacity 700ms cubic-bezier(.2,.7,.2,1) ${delay}ms, transform 800ms cubic-bezier(.2,.7,.2,1) ${delay}ms`,
        willChange: 'opacity, transform',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Sticky scroll progress within a wrapping element
function useScrollProgress(ref) {
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = rect.height - vh;
        if (total <= 0) {
          setP(0);
          return;
        }
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        setP(scrolled / total);
      });
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref]);
  return p;
}

// Section background colour transition — uses data-bg on section elements
function useBackgroundTransition() {
  React.useEffect(() => {
    const sections = Array.from(document.querySelectorAll('[data-bg]'));
    if (!sections.length) return;
    let raf = 0;
    function update() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // Find the section whose midpoint is closest to viewport centre
        const vc = window.innerHeight / 2;
        let active = sections[0];
        let bestD = Infinity;
        for (const s of sections) {
          const r = s.getBoundingClientRect();
          const mid = r.top + r.height / 2;
          const d = Math.abs(mid - vc);
          if (d < bestD) {
            bestD = d;
            active = s;
          }
        }
        const bg = active.getAttribute('data-bg');
        const fg = active.getAttribute('data-fg') || '';
        document.documentElement.style.setProperty('--page-bg', bg);
        document.documentElement.style.setProperty('--page-fg', fg);
      });
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
}

// Smooth scroll to id
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 64;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

// Number formatting
const fmt = (n) => n.toLocaleString('ko-KR');

Object.assign(window, { useReveal, Reveal, useScrollProgress, useBackgroundTransition, scrollToId, fmt });
