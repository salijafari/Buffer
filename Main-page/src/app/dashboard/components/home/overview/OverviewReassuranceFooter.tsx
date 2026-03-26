import { Box, Typography } from "@mui/material";
import { MsIcon } from "./MsIcon";
import { BODY_FONT, OT } from "./overviewTokens";

/** Stitch `buffer_overview`: `lg:col-span-12` reassurance, `p-10`, `text-lg` */
export function OverviewReassuranceFooter() {
  return (
    <Box
      sx={{
        gridColumn: { lg: "span 12" },
        mt: { xs: 4, lg: 6 },
        borderRadius: OT.cardRadius,
        bgcolor: OT.surfaceContainer,
        px: { xs: 3, md: 5 },
        py: { xs: 5, md: 6 },
        textAlign: "center",
      }}
    >
      <Box sx={{ maxWidth: 672, mx: "auto" }}>
        <MsIcon name="security" filled sx={{ fontSize: 40, color: OT.primary, mb: 2 }} />
        <Typography
          sx={{
            fontFamily: BODY_FONT,
            fontSize: { xs: "1.0625rem", md: "1.125rem" },
            lineHeight: 1.65,
            color: OT.onSurfaceVariant,
          }}
        >
          You&apos;re on track. Buffer replaced multiple due dates, APRs, and minimum payments with one simpler monthly bill designed to reduce interest and make
          repayment easier to manage.
        </Typography>
      </Box>
    </Box>
  );
}
