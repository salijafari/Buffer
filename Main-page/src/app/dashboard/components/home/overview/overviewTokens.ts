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
  /** Tailwind `teal-600` for icon accents */
  teal600: "#0d9488",
  teal50: "#f0fdfa",
  /** Design: large rounded cards (~24px) */
  cardRadius: "24px",
  cardShadow: "0 4px 24px rgba(15, 23, 42, 0.06)",
  cardBorder: "rgba(226, 232, 240, 0.9)",
} as const;

export const HEADLINE_FONT = '"Manrope", system-ui, sans-serif';
export const BODY_FONT = '"Inter", system-ui, sans-serif';
