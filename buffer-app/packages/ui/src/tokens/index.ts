/**
 * Buffer Design System Tokens
 * Single source of truth — consumed by web (CSS vars / Tailwind) and mobile (StyleSheet).
 * ALL values use the 4px base unit. Only: 8, 12, 16, 24, 32, 48, 64.
 */

// ─── Palette ────────────────────────────────────────────────────────────────
export const colors = {
  // Brand
  primary:      '#00C9A7', // teal — CTAs, active states, progress
  primaryDim:   'rgba(0, 201, 167, 0.12)',

  // Backgrounds
  bgPrimary:    '#0F1117', // main dark background
  bgSurface:    '#1A1D27', // cards, sheets, drawers
  bgElevated:   '#21253A', // modals, overlays on surface

  // Text
  textPrimary:  '#FFFFFF',
  textSecondary:'#A0A8B8',
  textMuted:    '#6B7280',
  textInverse:  '#0F1117',

  // Semantic
  success:      '#22C55E',
  successDim:   'rgba(34, 197, 94, 0.12)',
  warning:      '#F59E0B',
  warningDim:   'rgba(245, 158, 11, 0.12)',
  critical:     '#EF4444',
  criticalDim:  'rgba(239, 68, 68, 0.12)',
  info:         '#3B82F6',
  infoDim:      'rgba(59, 130, 246, 0.12)',

  // Chart series
  chartFuture1: '#FF6B6B', // coral  — minimum payments (worst)
  chartFuture2: '#F59E0B', // amber  — current pace
  chartFuture3: '#00C9A7', // teal   — Buffer recommended (best)

  // Borders
  border:       'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',

  // Credit score arc bands
  scorePoor:       '#EF4444',  // 300–579
  scoreFair:       '#F59E0B',  // 580–659
  scoreGood:       '#EAB308',  // 660–724
  scoreVeryGood:   '#22C55E',  // 725–759
  scoreExcellent:  '#00C9A7',  // 760–850

  // APR colour-coding on card list
  aprHigh:     '#FF6B6B',  // > 20%
  aprMid:      '#F59E0B',  // 15–20%
  aprLow:      '#00C9A7',  // < 15%

  // Utilisation bar
  utilLow:     '#00C9A7',  // < 30%
  utilMid:     '#F59E0B',  // 30–70%
  utilHigh:    '#EF4444',  // > 70%
} as const;

// ─── Typography ─────────────────────────────────────────────────────────────
export const fonts = {
  heading:   'Inter, "Plus Jakarta Sans", system-ui, sans-serif',
  body:      'Inter, system-ui, sans-serif',
  /**
   * ALL financial figures — dollar amounts, percentages, APRs, dates,
   * account numbers — MUST use this font. Design rule, no exceptions.
   */
  mono:      '"JetBrains Mono", "IBM Plex Mono", "Fira Code", monospace',
} as const;

export const fontWeights = {
  regular:   400,
  medium:    500,
  semibold:  600,
  bold:      700,
} as const;

export const fontSizes = {
  xs:    12,
  sm:    14,
  base:  16,
  md:    18,
  lg:    20,
  xl:    24,
  '2xl': 28,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const lineHeights = {
  tight:   1.15,
  snug:    1.3,
  normal:  1.5,
  relaxed: 1.65,
} as const;

// ─── Spacing (4px base — only these values) ─────────────────────────────────
export const spacing = {
  '2':  8,
  '3':  12,
  '4':  16,
  '6':  24,
  '8':  32,
  '12': 48,
  '16': 64,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────
export const radii = {
  sm:   4,
  md:   8,   // inputs
  lg:   12,  // cards
  xl:   16,
  '2xl':24,  // pill buttons
  full: 9999,
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────
export const shadows = {
  card:   '0 4px 24px rgba(0, 0, 0, 0.40)',
  modal:  '0 8px 48px rgba(0, 0, 0, 0.60)',
  glow:   '0 0 32px rgba(0, 201, 167, 0.24)',
} as const;

// ─── Motion / Animation ──────────────────────────────────────────────────────
export const motion = {
  /** Page transitions */
  page:        '200ms ease-in-out',
  /** Interactive state changes (hover, press) */
  interactive: '150ms ease',
  /** Chart draw animations */
  chartFuture1: { duration: 400, delay: 0 },
  chartFuture2: { duration: 350, delay: 200 },
  chartFuture3: { duration: 300, delay: 400 },
  /** Skeleton shimmer cycle */
  shimmer:     '1.5s infinite',
} as const;

// ─── Chart Dimensions ────────────────────────────────────────────────────────
export const chartDimensions = {
  heightMobile: 280,
  heightWeb:    360,
  balanceChartHeightMobile: 180,
  balanceChartHeightWeb:    220,
  creditGaugeSize: 240,
} as const;

// ─── Navigation ──────────────────────────────────────────────────────────────
export const nav = {
  sidebarWidth:    220,
  sidebarBreakpoint: 1024, // px — sidebar on ≥1024, bottom bar below
  mobileBarBreakpoint: 640, // px — hamburger below
  bottomBarHeight: 64,
} as const;

// ─── Gradients ───────────────────────────────────────────────────────────────
export const gradients = {
  /** Main screen background — top purple→blue fade, bottom off-white */
  screenBg:   'linear-gradient(180deg, #1A1230 0%, #111827 40%, #0F1117 100%)',
  /** Teal glow orb used on splash + onboarding illustrations */
  tealOrb:    'radial-gradient(circle at 50% 50%, rgba(0,201,167,0.28) 0%, transparent 70%)',
  /** Savings area fill between Future1 and Future3 lines */
  savingsFill:'rgba(0, 201, 167, 0.10)',
  /** Card background subtle gradient */
  card:       'linear-gradient(145deg, #1A1D27 0%, #1E2235 100%)',
} as const;

// ─── Z-Index ─────────────────────────────────────────────────────────────────
export const zIndex = {
  base:       0,
  card:       10,
  nav:        50,
  drawer:     100,
  modal:      200,
  toast:      300,
  tooltip:    400,
} as const;
