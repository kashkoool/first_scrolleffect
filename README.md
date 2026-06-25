# VANTA AERO·9 — scroll-driven sneaker storefront

A marketing demo storefront for a fictional running shoe, **VANTA AERO·9**. A
151-frame product render lives on a **fixed canvas behind the whole page** — as you
scroll, the shoe rotates and travels across the screen while the store content
(buy module, tech, specs, reviews, drop signup) floats over it.

**Live demo:** _(deployed on Vercel)_

## Features

- **Whole-page scroll sequence** — one fixed `<canvas>` scrubs 151 frames by total
  scroll position; the shoe is posed to dodge each section's copy.
- **Product configurator** — four colorways retint the shoe live (CSS filters) and
  re-theme the whole UI; size selector with sold-out states; quantity; add-to-bag
  with a live cart count, toast, and a sticky mobile buy bar.
- **Store sections** — hero, buy module, technology, spec sheet, reviews, drop
  signup, full footer.

## Engineering

- **Performance** — frame draws only when the rendered state changes; render loop
  pauses when the tab is hidden; capped device-pixel-ratio; debounced resize;
  immutable caching on frames.
- **Accessibility** — semantic landmarks, ARIA radio groups for size/color, visible
  focus, `prefers-reduced-motion` respected.
- **SEO/marketing** — Open Graph + Twitter cards and Product JSON-LD for rich results.
- **Security** — strict CSP (`script-src 'self'`), HSTS, `nosniff`, frame-deny,
  referrer and permissions policies (see `vercel.json`).

Vanilla HTML/CSS/JS, no build step, no dependencies beyond Google Fonts.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Markup + structured data |
| `styles.css` | Design system + layout |
| `app.js` | Sequence engine + store interactions |
| `vercel.json` | Security headers + caching |
| `assets/frames/` | 151 product render frames |

## Run locally

```bash
python -m http.server 8000
# open http://localhost:8000
```

> Serve over HTTP — opening `index.html` directly via `file://` won't load the frames.
