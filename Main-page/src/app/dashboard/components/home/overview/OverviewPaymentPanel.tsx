import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { displayMoney, FINANCIAL_MASK } from "../../../lib/financialDisplay";
import { fmtCurrency } from "../../../lib/dashboardFormat";
import { MsIcon } from "./MsIcon";
import { BODY_FONT, HEADLINE_FONT, OT } from "./overviewTokens";

type Props = {
  currentBalance: number;
  nextPaymentAmount: number;
  nextPaymentDate: Date;
  autopayOn: boolean;
  bankLabel: string;
  bankMask: string;
  showLiveFinancials: boolean;
};

function formatPaymentWhen(d: Date): string {
  return d.toLocaleDateString("en-CA", { month: "long", day: "numeric" });
}

export function OverviewPaymentPanel({
  currentBalance,
  nextPaymentAmount,
  nextPaymentDate,
  autopayOn,
  bankLabel,
  bankMask,
  showLiveFinancials,
}: Props) {
  const navigate = useNavigate();
  const live = showLiveFinancials;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: OT.cardRadius,
        border: `1px solid ${OT.surfaceContainer}`,
        bgcolor: OT.surfaceContainerLowest,
        boxShadow: OT.cardShadow,
        position: "relative",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <Box sx={{ position: "absolute", top: 0, right: 0, p: 3 }}>
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 2,
            py: 0.5,
            borderRadius: 999,
            bgcolor: OT.secondaryContainer,
            color: OT.onSecondaryContainer,
            fontWeight: 600,
            fontSize: "0.875rem",
            fontFamily: BODY_FONT,
          }}
        >
          <MsIcon name="check_circle" filled sx={{ fontSize: 14, mr: 1, color: `${OT.onSecondaryContainer} !important` }} />
          On Track
        </Box>
      </Box>

      <CardContent sx={{ p: { xs: 3, md: 5 }, "&:last-child": { pb: { xs: 3, md: 5 } } }}>
        <Box sx={{ mb: 5 }}>
          <Typography
            sx={{
              fontFamily: BODY_FONT,
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: OT.onSurfaceVariant,
            }}
          >
            Current Balance
          </Typography>
          <Typography
            sx={{
              fontFamily: HEADLINE_FONT,
              fontSize: { xs: "2.75rem", sm: "3.75rem" },
              lineHeight: 1.05,
              fontWeight: 800,
              color: OT.primary,
              mt: 1,
            }}
          >
            {displayMoney(live, () => fmtCurrency(currentBalance, 0))}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 4,
            mb: 5,
          }}
        >
          <Box sx={{ bgcolor: OT.surfaceContainerLow, borderRadius: OT.cardRadius, p: 3 }}>
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 500, color: OT.onSurfaceVariant }}>
              Next Payment
            </Typography>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontSize: "1.5rem", fontWeight: 700, color: OT.onSurface, mt: 0.5 }}>
              {displayMoney(live, () => fmtCurrency(nextPaymentAmount, 0))}{" "}
              <Box component="span" sx={{ fontSize: "1rem", fontWeight: 400, color: OT.onSurfaceVariant, fontFamily: BODY_FONT }}>
                {live ? `on ${formatPaymentWhen(nextPaymentDate)}` : FINANCIAL_MASK}
              </Box>
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: OT.surfaceContainerLow,
              borderRadius: OT.cardRadius,
              p: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box>
              <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 500, color: OT.onSurfaceVariant }}>
                Autopay
              </Typography>
              <Typography sx={{ fontFamily: HEADLINE_FONT, fontSize: "1.5rem", fontWeight: 700, color: OT.primary, mt: 0.5 }}>
                {autopayOn ? "ON" : "OFF"}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", fontWeight: 500, color: OT.onSurfaceVariant }}>
                {bankLabel}
              </Typography>
              <Typography sx={{ fontFamily: "ui-monospace, monospace", fontSize: "0.875rem", color: OT.onSurface }}>
                {live ? `••••${bankMask}` : FINANCIAL_MASK}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} flexWrap="wrap" gap={2}>
          <Button
            variant="contained"
            size="large"
            onClick={() => void navigate("/dashboard/payoff")}
            sx={{
              borderRadius: 999,
              px: 4,
              py: 2,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "1.125rem",
              fontFamily: BODY_FONT,
              boxShadow: "0 10px 15px -3px rgba(15, 118, 110, 0.25)",
              background: `linear-gradient(135deg, ${OT.primary} 0%, ${OT.primaryContainer} 100%)`,
              color: "#fff",
              transition: "transform 0.15s ease",
              "&:hover": {
                transform: "scale(1.02)",
                background: `linear-gradient(135deg, ${OT.primary} 0%, ${OT.primaryContainer} 100%)`,
              },
              "&:active": { transform: "scale(0.98)" },
            }}
          >
            Make Extra Payment
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => void navigate("/dashboard/payoff")}
            sx={{
              borderRadius: 999,
              px: 4,
              py: 2,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "1.125rem",
              fontFamily: BODY_FONT,
              bgcolor: OT.surfaceContainerHigh,
              color: OT.onSurface,
              boxShadow: "none",
              transition: "transform 0.15s ease",
              "&:hover": { bgcolor: OT.surfaceContainerHigh, filter: "brightness(0.97)", transform: "scale(1.02)" },
              "&:active": { transform: "scale(0.98)" },
            }}
          >
            Manage Payments
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
