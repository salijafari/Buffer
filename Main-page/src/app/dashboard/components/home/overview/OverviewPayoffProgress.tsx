import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { fmtCurrency } from "../../../lib/dashboardFormat";
import { MsIcon } from "./MsIcon";
import { BODY_FONT, HEADLINE_FONT, OT } from "./overviewTokens";

type Props = {
  originalAmount: number;
  totalPaid: number;
  remaining: number;
  completionPct: number;
};

/**
 * Matches design: title row has "Payoff Progress" (left) + "View Payoff Details →" (right);
 * then bar row, then original / remaining on opposite ends.
 */
export function OverviewPayoffProgress({ originalAmount, totalPaid, remaining, completionPct }: Props) {
  const navigate = useNavigate();
  const pct = Math.min(100, Math.max(0, Math.round(completionPct)));

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${OT.cardBorder}`,
        bgcolor: OT.surfaceContainerLowest,
        borderRadius: OT.cardRadius,
        boxShadow: OT.cardShadow,
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 5 }, "&:last-child": { pb: { xs: 3, md: 5 } } }}>
        {/* Row 1: title + CTA (screenshot) */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Typography
            component="h2"
            sx={{
              fontFamily: HEADLINE_FONT,
              fontSize: { xs: "1.35rem", md: "1.5rem" },
              fontWeight: 700,
              color: OT.onSurface,
              lineHeight: 1.2,
            }}
          >
            Payoff Progress
          </Typography>
          <Button
            variant="text"
            onClick={() => void navigate("/dashboard/payoff")}
            endIcon={<MsIcon name="arrow_forward" sx={{ fontSize: 18, color: OT.primary }} />}
            sx={{
              fontFamily: BODY_FONT,
              fontWeight: 700,
              fontSize: "1rem",
              color: OT.primary,
              textTransform: "none",
              p: 0,
              minWidth: 0,
              alignSelf: { xs: "flex-end", sm: "auto" },
              "&:hover": { bgcolor: "transparent", textDecoration: "underline", textUnderlineOffset: 3 },
            }}
          >
            View Payoff Details
          </Button>
        </Stack>

        {/* Badge row + progress bar */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
          <Box
            component="span"
            sx={{
              display: "inline-block",
              py: 0.75,
              px: 2,
              borderRadius: 999,
              textTransform: "uppercase",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: OT.primary,
              bgcolor: OT.secondaryContainer,
            }}
          >
            {pct}% Completed
          </Box>
          <Typography
            sx={{
              fontFamily: BODY_FONT,
              fontSize: "1.125rem",
              fontWeight: 700,
              color: OT.primary,
            }}
          >
            {fmtCurrency(totalPaid, 0)} paid
          </Typography>
        </Stack>

        <Box
          sx={{
            position: "relative",
            height: 24,
            borderRadius: 999,
            bgcolor: OT.surfaceContainerHigh,
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
            overflow: "hidden",
            mb: 1,
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 999,
              bgcolor: OT.primary,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: OT.primary,
                opacity: 0.2,
                filter: "blur(8px)",
              }}
            />
          </Box>
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mt: 2 }} flexWrap="wrap" gap={2}>
          <Box sx={{ textAlign: "left" }}>
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: OT.onSurfaceVariant,
                fontFamily: BODY_FONT,
                mb: 0.5,
              }}
            >
              Original Amount
            </Typography>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontSize: "1.35rem", fontWeight: 800, color: OT.onSurface }}>
              {fmtCurrency(originalAmount, 0)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right", ml: "auto" }}>
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: OT.onSurfaceVariant,
                fontFamily: BODY_FONT,
                mb: 0.5,
              }}
            >
              Remaining
            </Typography>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontSize: "1.35rem", fontWeight: 800, color: OT.primary }}>
              {fmtCurrency(remaining, 0)}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
