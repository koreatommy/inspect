// app.jsx — top-level composition + tweaks wiring

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#0066FF",
  "highlightedPlan": "growth",
  "scrollEffects": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply primary colour to the root token so the entire system shifts.
  // We override BOTH the CSS custom property AND a hard-coded fallback list
  // (because many inline styles use the literal #0066FF or rgba(0,102,255,…)).
  React.useEffect(() => {
    const root = document.documentElement;
    const c = t.primaryColor || '#0066FF';
    root.style.setProperty('--semantic-primary-normal', c);
    root.style.setProperty('--semantic-primary-strong', shade(c, -0.06));
    root.style.setProperty('--semantic-primary-heavy', shade(c, -0.12));
    // Expose rgb triplet for places that need rgba() tints
    const rgb = hexToRgb(c);
    if (rgb) {
      root.style.setProperty('--brand-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
  }, [t.primaryColor]);

  // Smooth background transitions across the page
  useBackgroundTransition();

  // Optional reduced-motion override via Tweaks
  React.useEffect(() => {
    if (!t.scrollEffects) {
      document.documentElement.classList.add('no-scroll-fx');
    } else {
      document.documentElement.classList.remove('no-scroll-fx');
    }
  }, [t.scrollEffects]);

  return (
    <>
      <Nav onCtaClick={() => scrollToId('cta')} />
      <main>
        <Hero
          onPrimary={() => scrollToId('cta')}
          onSecondary={() => scrollToId('features-intro')}
        />
        <TrustStrip />
        <Problem />
        <CoreValue />
        <Features />
        <Customers />
        <PricingPlans highlighted={t.highlightedPlan} />
        <Calculator />
        <Comparison />
        <FAQ />
        <FinalCTA />
        <Footer />
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="브랜드 컬러">
          <TweakColor
            label="Primary"
            value={t.primaryColor}
            options={['#0066FF', '#5B37ED', '#009632', '#FF5E00', '#0F0F10']}
            onChange={(v) => setTweak('primaryColor', v)}
          />
        </TweakSection>

        <TweakSection label="요금제 강조">
          <TweakRadio
            label="추천 표시"
            value={t.highlightedPlan}
            options={[
              { label: 'Starter', value: 'starter' },
              { label: 'Growth', value: 'growth' },
              { label: 'Pro', value: 'pro' },
            ]}
            onChange={(v) => setTweak('highlightedPlan', v)}
          />
        </TweakSection>

        <TweakSection label="스크롤 효과">
          <TweakToggle
            label="배경 전환 · Reveal"
            value={t.scrollEffects}
            onChange={(v) => setTweak('scrollEffects', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

// Simple HSL shading helper
function shade(hex, amt) {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const mix = (c) => Math.max(0, Math.min(255, Math.round(c + amt * 255)));
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return '#' + toHex(mix(r)) + toHex(mix(g)) + toHex(mix(b));
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  if (h.length !== 6) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
