import { Typography } from "@mui/material";
import { BODY_FONT, HEADLINE_FONT, OT } from "./overviewTokens";

/** Stitch `buffer_overview`: `mb-12` header, `text-5xl` title, `text-xl` subtitle */
export function OverviewPageHeader() {
  return (
    <header style={{ marginBottom: "3rem", maxWidth: "48rem" }}>
      <Typography
        component="h1"
        sx={{
          fontFamily: HEADLINE_FONT,
          fontSize: { xs: "2.5rem", md: "3rem" },
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: OT.onSurface,
          mb: 2,
        }}
      >
        Your Buffer Plan
      </Typography>
      <Typography
        sx={{
          fontFamily: BODY_FONT,
          fontSize: { xs: "1.125rem", md: "1.25rem" },
          lineHeight: 1.625,
          fontWeight: 500,
          color: OT.onSurfaceVariant,
        }}
      >
        Your credit cards were paid down and replaced with one simpler monthly payment.
      </Typography>
    </header>
  );
}
