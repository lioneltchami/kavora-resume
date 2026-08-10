# Design — Kavora Resume

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

## Genre

modern-minimal

## Macrostructure family

- Marketing pages: Marquee Hero (fold = brand statement only; CTA + proof below a thick rule). Feature sections as typographic lists, never equal icon-card grids.
- App pages: Workbench (dense tool chrome, hairline rules, left-bias headers, no marketing enrichment).
- Content pages: Long Document (privacy, terms).

## Theme

- `--color-paper` oklch(97.5% 0.006 250)
- `--color-paper-2` oklch(94.5% 0.008 250)
- `--color-ink` oklch(24% 0.028 250)
- `--color-ink-2` oklch(42% 0.02 250)
- `--color-rule` oklch(88% 0.01 250)
- `--color-accent` oklch(62% 0.09 75)
- `--color-focus` oklch(55% 0.12 250)

Legacy aliases (keep for existing Tailwind classes):

- `--color-bg` = paper · `--color-navy` = ink · `--color-gold` = accent
- `--color-text` = ink · `--color-text-muted` = ink-2 · `--color-border` = rule

## Typography

- Display: Cormorant Garamond, weight 600, style normal (roman headers only)
- Body: DM Sans, weight 400–600
- Mono: ui-monospace system stack
- Display tracking: -0.02em
- Type scale anchor: `--text-display` = clamp(2.75rem, 8vw, 5.5rem)

## Spacing

4-point named scale in `tokens.css`. Pages use named tokens, never raw magic numbers for major rhythm.

## Motion

- Easings: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`
- Reveal: marketing hero static; one below-fold opacity ≤ 220ms max. App pages: none.
- Reduced-motion: opacity-only ≤ 150ms.

## Microinteractions stance

- silent success
- hover delay 800ms on tooltips · focus delay 0ms
- no bounce, no card lift, no shimmer sweeps on primary CTAs

## CTA voice

- Primary: solid ink fill, 2px radius, white text, no shadow glow
- Secondary: hairline border or text link with accent underline on hover

## Per-page allowances

- Marketing pages MAY use Tier-A CSS proof frames (resume URL mock as type, no fake browser chrome).
- App pages MUST NOT use enrichment.
- Content pages: typography only.

## What pages MUST share

- Kavora wordmark + logo
- Accent ≤ 5% of viewport (rules, focus, sparse highlights)
- Cormorant + DM Sans
- CTA voice (2px radius, ink fill)
- N9 edge-aligned nav on marketing; Workbench top bar on app
- Ft5 statement footer on marketing

## What pages MAY differ on

- Macrostructure within family only
- Hero archetype within Marquee allowances
- Enrichment — marketing only, Tier-A

## Exports

### tokens.css

See project-root `tokens.css`.

### Tailwind v4 `@theme`

Mirrored in `src/app/globals.css` `@theme` block — keep in sync with `tokens.css`.
