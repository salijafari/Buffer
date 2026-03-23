import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { MsIcon } from "./MsIcon";
import { BODY_FONT, HEADLINE_FONT, OT } from "./overviewTokens";

type Props = {
  utilBeforePct: number;
  utilAfterPct: number;
  onTimeStreakMonths: number;
  scoreTrendPts: number;
};

export function OverviewCreditHealth({ utilBeforePct, utilAfterPct, onTimeStreakMonths, scoreTrendPts }: Props) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: OT.cardRadius,
        border: `1px solid ${OT.cardBorder}`,
        bgcolor: OT.surfaceContainerLowest,
        boxShadow: OT.cardShadow,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 }, "&:last-child": { pb: { xs: 3, md: 4 } } }}>
        <Typography variant="h6" sx={{ fontFamily: HEADLINE_FONT, fontSize: "1.25rem", fontWeight: 700, color: OT.onSurface, mb: 3 }}>
          Credit Health
        </Typography>

        <Stack spacing={3}>
          <Box>
            <Typography
              sx={{
                fontFamily: BODY_FONT,
                fontSize: "0.75rem",
                fontWeight: 700,
                color: OT.outline,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                mb: 1,
              }}
            >
              Utilization
            </Typography>
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography sx={{ fontFamily: HEADLINE_FONT, fontSize: "1.25rem", fontWeight: 700, color: OT.onSurface }}>
                {utilBeforePct}%
              </Typography>
              <MsIcon name="arrow_forward" sx={{ fontSize: 18, color: OT.primary }} />
              <Typography sx={{ fontFamily: HEADLINE_FONT, fontSize: "1.5rem", fontWeight: 700, color: OT.primary }}>
                {utilAfterPct}%
              </Typography>
            </Stack>
          </Box>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ borderTop: `1px solid ${OT.surfaceContainer}`, py: 2 }}
          >
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 500, color: OT.onSurfaceVariant }}>
              On-time streak
            </Typography>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontSize: "1.125rem", fontWeight: 700, color: OT.onSurface }}>
              {onTimeStreakMonths} months
            </Typography>
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ borderTop: `1px solid ${OT.surfaceContainer}`, pt: 2 }}
          >
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 500, color: OT.onSurfaceVariant }}>
              Score trend
            </Typography>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontSize: "1.125rem", fontWeight: 700, color: OT.primary }}>
              +{scoreTrendPts} pts
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
