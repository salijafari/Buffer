import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { displayMoney, FINANCIAL_MASK } from "../../../lib/financialDisplay";
import { fmtCurrency } from "../../../lib/dashboardFormat";
import { MsIcon } from "./MsIcon";
import { BODY_FONT, HEADLINE_FONT, OT } from "./overviewTokens";

const metricCardSx = {
  height: "100%",
  borderRadius: OT.cardRadius,
  border: `1px solid ${OT.surfaceContainer}`,
  bgcolor: OT.surfaceContainerLowest,
  boxShadow: OT.cardShadow,
  transition: "box-shadow 0.2s ease, transform 0.2s ease",
  "&:hover": {
    boxShadow: OT.cardShadowHover,
  },
} as const;

const iconWrap = {
  display: "inline-flex",
  mb: 2,
  p: 1,
  borderRadius: "0.5rem",
  bgcolor: OT.teal50,
  color: OT.teal600,
};

type Props = {
  interestSavedThisMonth: number;
  interestSavedCumulative: number;
  availableCredit: number;
  breathingRoomMonthly: number;
  showLiveFinancials: boolean;
};

/**
 * Four `lg:col-span-3` cells — must sit inside parent 12-col grid.
 */
export function OverviewMetricCards({
  interestSavedThisMonth,
  interestSavedCumulative,
  availableCredit,
  breathingRoomMonthly,
  showLiveFinancials,
}: Props) {
  const col = { gridColumn: { lg: "span 3" } };
  const live = showLiveFinancials;

  return (
    <>
      <Box sx={col}>
        <MetricCard
          icon="savings"
          value={displayMoney(live, () => fmtCurrency(interestSavedThisMonth, 0))}
          label="Interest Saved This Month"
          caption="Less interest than before Buffer"
          captionItalic
        />
      </Box>
      <Box sx={col}>
        <MetricCard
          icon="account_balance_wallet"
          value={displayMoney(live, () => fmtCurrency(interestSavedCumulative, 0))}
          label="Interest Saved So Far"
          caption="Estimated total savings to date"
        />
      </Box>
      <Box sx={col}>
        <MetricCard
          icon="credit_score"
          value={displayMoney(live, () => fmtCurrency(availableCredit, 0))}
          label="Available Credit"
          caption="Remaining line amount"
        />
      </Box>
      <Box sx={col}>
        <BreathingRoomCard amountMonthly={breathingRoomMonthly} showLiveFinancials={live} />
      </Box>
    </>
  );
}

function MetricCard({
  icon,
  value,
  label,
  caption,
  captionItalic,
}: {
  icon: string;
  value: string;
  label: string;
  caption: string;
  captionItalic?: boolean;
}) {
  return (
    <Card
      elevation={0}
      sx={metricCardSx}
    >
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        <Box sx={iconWrap}>
          <MsIcon name={icon} sx={{ fontSize: 28 }} />
        </Box>
        <Typography
          sx={{
            fontFamily: HEADLINE_FONT,
            fontSize: "2.25rem",
            lineHeight: 1.1,
            fontWeight: 800,
            color: OT.onSurface,
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            fontFamily: BODY_FONT,
            fontSize: "0.875rem",
            fontWeight: 700,
            color: OT.onSurfaceVariant,
            mt: 0.5,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontFamily: BODY_FONT,
            fontSize: "0.75rem",
            color: OT.outline,
            mt: 1,
            fontStyle: captionItalic ? "italic" : "normal",
          }}
        >
          {caption}
        </Typography>
      </CardContent>
    </Card>
  );
}

function BreathingRoomCard({ amountMonthly, showLiveFinancials }: { amountMonthly: number; showLiveFinancials: boolean }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: OT.cardRadius,
        bgcolor: OT.primary,
        color: "#fff",
        boxShadow: "0 20px 40px -12px rgba(0, 104, 95, 0.35)",
        transition: "box-shadow 0.2s ease",
        "&:hover .breathing-deco": {
          transform: "scale(1.1)",
        },
      }}
    >
      <Box
        className="breathing-deco"
        sx={{
          position: "absolute",
          right: -24,
          bottom: -24,
          opacity: 0.1,
          transition: "transform 0.7s ease",
        }}
      >
        <MsIcon name="energy_savings_leaf" sx={{ fontSize: "6rem" }} />
      </Box>
      <CardContent sx={{ position: "relative", zIndex: 1, p: 3, "&:last-child": { pb: 3 } }}>
        <Typography
          sx={{
            fontFamily: BODY_FONT,
            fontSize: "0.875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            opacity: 0.8,
            mb: 2,
          }}
        >
          Breathing Room
        </Typography>
        <Typography
          sx={{
            fontFamily: HEADLINE_FONT,
            fontSize: "1.5rem",
            fontWeight: 700,
            color: OT.primaryFixed,
            mb: 2,
          }}
        >
          {showLiveFinancials ? `${fmtCurrency(amountMonthly, 0)}/mo Freed` : FINANCIAL_MASK}
        </Typography>
        <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
          <Stack component="li" direction="row" alignItems="center" sx={{ fontSize: "0.75rem" }}>
            <MsIcon name="done" sx={{ fontSize: 14, mr: 0.75 }} />
            Less interest
          </Stack>
          <Stack component="li" direction="row" alignItems="center" sx={{ fontSize: "0.75rem" }}>
            <MsIcon name="done" sx={{ fontSize: 14, mr: 0.75 }} />
            More budget room
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
