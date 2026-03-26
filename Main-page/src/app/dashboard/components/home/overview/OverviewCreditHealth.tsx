import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { FINANCIAL_MASK } from "../../../lib/financialDisplay";
import { MsIcon } from "./MsIcon";
import { BODY_FONT, HEADLINE_FONT, OT } from "./overviewTokens";

type Props = {
  utilBeforePct: number;
  utilAfterPct: number;
  onTimeStreakMonths: number;
  scoreTrendPts: number;
  showLiveFinancials: boolean;
};

export function OverviewCreditHealth({
  utilBeforePct,
  utilAfterPct,
  onTimeStreakMonths,
  scoreTrendPts,
  showLiveFinancials,
}: Props) {
  const live = showLiveFinancials;
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: OT.cardRadius,
        border: `1px solid ${OT.surfaceContainer}`,
        bgcolor: OT.surfaceContainerLowest,
        boxShadow: OT.cardShadow,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 5 }, "&:last-child": { pb: { xs: 3, md: 5 } } }}>
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
                {live ? `${utilBeforePct}%` : FINANCIAL_MASK}
              </Typography>
              <MsIcon name="arrow_forward" sx={{ fontSize: 18, color: OT.primary }} />
              <Typography sx={{ fontFamily: HEADLINE_FONT, fontSize: "1.5rem", fontWeight: 700, color: OT.primary }}>
                {live ? `${utilAfterPct}%` : FINANCIAL_MASK}
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
              {live ? `${onTimeStreakMonths} months` : FINANCIAL_MASK}
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
              {live ? `+${scoreTrendPts} pts` : FINANCIAL_MASK}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
