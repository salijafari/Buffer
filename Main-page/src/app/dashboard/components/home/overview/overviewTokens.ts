/**
 * M3 / Stitch HTML reference tokens (Buffer dashboard overview).
 * Matches the Tailwind `extend.colors` from the exported HTML.
 */
export const OT = {
  primary: "#00685f",
  primaryContainer: "#008378",
  secondaryContainer: "#c2ebe3",
  onSecondaryContainer: "#456b66",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f2f4f6",
  surfaceContainer: "#eceef0",
  surfaceContainerHigh: "#e6e8ea",
  surface: "#f7f9fb",
  /** Screenshot canvas (light gray behind cards) */
  pageBg: "#f8f9fa",
  onSurface: "#191c1e",
  onSurfaceVariant: "#3d4947",
  outline: "#6d7a77",
  primaryFixed: "#89f5e7",
  /** Dark text / icons on `primaryFixed` circles (M3 exported HTML). */
  onPrimaryFixed: "#00201d",
  primaryFixedDim: "#6bd8cb",
  tertiary: "#924628",
  outlineVariant: "#bcc9c6",
  surfaceContainerHighest: "#e0e3e5",
  /** Tailwind `teal-600` for icon accents */
  teal600: "#0d9488",
  teal50: "#f0fdfa",
  /** Stitch `stich_new_designs/*`: cards use ~1rem radius; statement rows slightly larger */
  cardRadius: "1rem",
  cardRadiusLg: "1.5rem",
  cardShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
  cardShadowHover: "0 4px 14px rgba(15, 23, 42, 0.1)",
  cardBorder: "rgba(226, 232, 240, 0.9)",
  /** Top bar: `backdrop-blur-xl` + `shadow-teal-900/5` */
  navBlur: "blur(24px)",
  navShadow: "0 1px 2px rgba(15, 77, 69, 0.05)",
} as const;

export const HEADLINE_FONT = '"Manrope", system-ui, sans-serif';
export const BODY_FONT = '"Inter", system-ui, sans-serif';
