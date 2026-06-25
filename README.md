# VANTA · AERO·9 — Scroll-Driven Image-Sequence Hero

A cinematic, scroll-driven product hero for a fictional sneaker, **VANTA AERO·9**.
Scrolling scrubs through a **151-frame** pre-rendered image sequence while the shoe
travels across the page and shifts colorway section by section.

**Live demo:** _(deployed on Vercel)_

## How it works

- **Image-sequence scrubbing** — 151 JPG frames (`assets/frames/`) flipped by scroll
  position on a `<canvas>` (the "Apple AirPods" technique), eased for smooth motion.
- **Scroll choreography** — per-section rest poses (position / scale / colorway)
  interpolated with smoothstep + lerp, plus a fly-in entrance on load.
- **Live colorway tinting** — CSS `hue-rotate` / `saturate` / `brightness` filters
  recolor the real render; the UI accent re-themes to match.
- **Art direction** — brutalist sport-tech: condensed display type, monospace HUD
  telemetry, SVG film-grain + vignette overlays.

Single self-contained `index.html` (inline CSS + JS), no build step, no dependencies
beyond Google Fonts. Pure static site.

## Run locally

```bash
python -m http.server 8000
# open http://localhost:8000
```

> Must be served over HTTP — opening `index.html` directly via `file://` won't
> render the sequence.
