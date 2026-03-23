import { Typography } from "@mui/material";
import { BODY_FONT, HEADLINE_FONT, OT } from "./overviewTokens";

/** Stitch HTML: `header.mb-12.max-w-3xl` + h1 text-5xl + p text-xl */
export function OverviewPageHeader() {
  return (
    <header style={{ marginBottom: "2.5rem", maxWidth: "48rem" }}>
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
          fontSize: "1.25rem",
          lineHeight: 1.625,
          color: OT.onSurfaceVariant,
        }}
      >
        Your credit cards were paid down and replaced with one simpler monthly payment.
      </Typography>
    </header>
  );
}
