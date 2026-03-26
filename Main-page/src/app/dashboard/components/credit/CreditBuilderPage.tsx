import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router";
import { useLiveFinancialDisplay } from "../../hooks/useLiveFinancialDisplay";
import { FINANCIAL_MASK } from "../../lib/financialDisplay";
import { BODY_FONT, HEADLINE_FONT, OT } from "../home/overview/overviewTokens";
import { MsIcon } from "../home/overview/MsIcon";
import { CREDIT_BUILDER_METRICS, HOW_BUFFER_HELPS } from "./creditBuilderMock";

/** Stitch `buffer_credit_builder_page` hero image */
const CREDIT_BUILDER_HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuChdtBC4fLl7_uRxsmgGWiFYPGE7eCIMbtQMw9b78efHeNRknSfvJd1aTtt6Wobq6q5QiikVzCM5yLCYYJq2pLEOfsBnaaiZXSlq9Pt4u9383xgakyjITi41Q0bXeZvsFOXd1x5jJcaQOEM2jr0T0yGLJm8qhgv3WUEkm0BsWrcYU56qOpy745GWJw5mL-uKSNH6TwPT5Nl2yDACryJCBoPOtn6mt1jw3kmOSiHEJuJazL9jLF_1Dtq_lpMk-fSe4a3_46OzlFwvkM";

function CreditBuilderHeader() {
  return (
    <header style={{ marginBottom: "2.5rem", maxWidth: "42rem" }}>
      <Typography
        component="h1"
        sx={{
          fontFamily: HEADLINE_FONT,
          fontSize: { xs: "2.25rem", md: "3rem" },
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: OT.onSurface,
          mb: 2,
        }}
      >
        Credit Builder
      </Typography>
      <Typography
        sx={{
          fontFamily: BODY_FONT,
          fontSize: "1.125rem",
          fontWeight: 500,
          lineHeight: 1.625,
          maxWidth: "42rem",
          color: OT.onSurfaceVariant,
        }}
      >
        Small consistent actions can help strengthen your credit profile over time. Connect accounts to see personalized numbers.
      </Typography>
    </header>
  );
}

function MetricTile({
  icon,
  value,
  label,
  caption,
  valueColor,
}: {
  icon: string;
  value: string;
  label: string;
  caption: string;
  valueColor?: string;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: OT.cardRadius,
        border: `1px solid ${OT.surfaceContainer}`,
        bgcolor: OT.surfaceContainerLowest,
        boxShadow: OT.cardShadow,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": { transform: "scale(1.02)", boxShadow: OT.cardShadowHover },
        "&:active": { transform: "scale(0.98)" },
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 }, "&:last-child": { pb: { xs: 3, md: 4 } }, position: "relative" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", fontWeight: 500, letterSpacing: "0.02em", color: OT.onSurfaceVariant }}>
            {label}
          </Typography>
          <Box
            sx={{
              display: "inline-flex",
              p: 1,
              borderRadius: "50%",
              bgcolor: alpha(OT.primaryFixed, 0.35),
            }}
          >
            <MsIcon name={icon} sx={{ fontSize: 22, color: OT.primary }} />
          </Box>
        </Box>
        <Typography
          sx={{
            fontFamily: HEADLINE_FONT,
            fontSize: { xs: "1.75rem", sm: "1.875rem" },
            lineHeight: 1.15,
            fontWeight: 700,
            color: valueColor ?? OT.primary,
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
        <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", color: OT.onSurfaceVariant }}>{caption}</Typography>
      </CardContent>
    </Card>
  );
}

function HowBufferHelpsSection() {
  return (
    <Box sx={{ borderRadius: OT.cardRadius, bgcolor: OT.surfaceContainerLow, p: "4px", mb: 3 }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: OT.cardRadius,
          bgcolor: OT.surfaceContainerLowest,
          boxShadow: OT.cardShadow,
          overflow: "hidden",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} sx={{ alignItems: "stretch", gap: 0 }}>
          <Box sx={{ flex: "1 1 50%", p: { xs: 3, md: 6 }, minWidth: 0 }}>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: { xs: "1.5rem", md: "1.875rem" }, letterSpacing: "-0.02em", color: OT.onSurface, mb: 3 }}>
              How Buffer Helps
            </Typography>
            <Stack component="ul" spacing={2.5} sx={{ m: 0, p: 0, listStyle: "none" }}>
              {HOW_BUFFER_HELPS.map((item) => (
                <Stack key={item.text} component="li" direction="row" alignItems="flex-start" spacing={2}>
                  <MsIcon name={item.icon} sx={{ fontSize: 24, color: OT.primary, mt: 0.25, flexShrink: 0 }} />
                  <Typography sx={{ fontFamily: BODY_FONT, fontSize: "1rem", lineHeight: 1.6, color: OT.onSurfaceVariant }}>
                    {item.text}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
          <Box
            sx={{
              flex: "1 1 50%",
              position: "relative",
              minHeight: { xs: 200, md: "auto" },
              aspectRatio: { md: "16 / 9" },
              bgcolor: OT.surfaceContainer,
              overflow: "hidden",
            }}
          >
            <Box
              component="img"
              src={CREDIT_BUILDER_HERO_IMAGE}
              alt="Financial stability illustration"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "grayscale(1)",
                mixBlendMode: "multiply",
                opacity: 0.8,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top right, rgba(0, 104, 95, 0.1) 0%, transparent 55%)",
              }}
            />
          </Box>
        </Stack>
      </Card>
    </Box>
  );
}

function KeepBuildingSection() {
  const navigate = useNavigate();
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: OT.cardRadius,
        border: `1px solid ${OT.surfaceContainer}`,
        bgcolor: OT.surfaceContainerLowest,
        boxShadow: OT.cardShadow,
        mb: 3,
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 5 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "center", md: "center" }}
          justifyContent="space-between"
          spacing={3}
        >
          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.5rem", color: OT.onSurface, mb: 1 }}>
              Keep Building
            </Typography>
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "1rem", color: OT.onSurfaceVariant, lineHeight: 1.6 }}>
              Stay consistent to reach your financial milestones.
            </Typography>
          </Box>
          <Stack direction="row" flexWrap="wrap" spacing={1.5} justifyContent="center" useFlexGap sx={{ width: { xs: "100%", md: "auto" } }}>
            <Button
              variant="contained"
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 600,
                fontFamily: BODY_FONT,
                px: 4,
                py: 1.75,
                color: "#fff",
                boxShadow: "0 4px 14px rgba(0, 104, 95, 0.25)",
                background: `linear-gradient(135deg, ${OT.primary} 0%, ${OT.primaryContainer} 100%)`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  background: `linear-gradient(135deg, ${OT.primaryContainer} 0%, ${OT.primary} 100%)`,
                  boxShadow: "0 6px 18px rgba(0, 104, 95, 0.35)",
                  transform: "scale(1.05)",
                },
                "&:active": { transform: "scale(0.95)" },
              }}
            >
              Keep Autopay On
            </Button>
            <Button
              variant="outlined"
              onClick={() => void navigate("/dashboard/payoff")}
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 600,
                fontFamily: BODY_FONT,
                px: 4,
                py: 1.75,
                border: "none",
                bgcolor: OT.surfaceContainerHigh,
                color: OT.onSurface,
                transition: "transform 0.2s ease, background-color 0.2s ease",
                "&:hover": { bgcolor: OT.surfaceContainerHighest, transform: "scale(1.05)" },
                "&:active": { transform: "scale(0.95)" },
              }}
            >
              Make Extra Payment
            </Button>
            <Button
              variant="outlined"
              onClick={() => void navigate("/dashboard/payoff")}
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 600,
                fontFamily: BODY_FONT,
                px: 4,
                py: 1.75,
                border: "none",
                bgcolor: OT.surfaceContainerHigh,
                color: OT.onSurface,
                transition: "transform 0.2s ease, background-color 0.2s ease",
                "&:hover": { bgcolor: OT.surfaceContainerHighest, transform: "scale(1.05)" },
                "&:active": { transform: "scale(0.95)" },
              }}
            >
              View Payment History
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DisclaimerCard() {
  return (
    <Box sx={{ borderRadius: OT.cardRadius, bgcolor: OT.surfaceContainer, p: { xs: 3, md: 4 }, mb: 2 }}>
      <Stack direction="row" alignItems="flex-start" spacing={2}>
        <MsIcon name="info" sx={{ fontSize: 22, color: OT.outlineVariant, flexShrink: 0, mt: 0.25 }} />
        <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.875rem", lineHeight: 1.65, color: OT.onSurfaceVariant }}>
          Credit improvement takes time and outcomes vary. Buffer helps by simplifying repayment and lowering revolving credit pressure. Our tools are designed to
          provide a structural framework for better financial health, but individual results depend on your overall credit history and external factors beyond the
          Buffer ecosystem.
        </Typography>
      </Stack>
    </Box>
  );
}

export function CreditBuilderPage() {
  const m = CREDIT_BUILDER_METRICS;
  const { showLiveFinancials } = useLiveFinancialDisplay();
  const live = showLiveFinancials;

  return (
    <Stack
      component="main"
      role="main"
      aria-label="Credit Builder"
      spacing={0}
      sx={{
        px: { xs: 2, lg: 0 },
        py: { xs: 2.5, lg: 0 },
        maxWidth: { xs: "100%", lg: "min(1024px, 100%)" },
        mx: "auto",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <CreditBuilderHeader />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: { xs: 2, md: 3 },
          mb: 3,
        }}
      >
        <MetricTile
          icon="trending_down"
          value={live ? `${m.utilBeforePct}% → ${m.utilAfterPct}%` : FINANCIAL_MASK}
          label="Utilization"
          caption="Lower revolving use"
          valueColor={OT.primary}
        />
        <MetricTile
          icon="verified"
          value={live ? `${m.onTimeStreakMonths} months` : FINANCIAL_MASK}
          label="On-Time Payments"
          caption="Staying on track"
          valueColor={OT.primary}
        />
        <MetricTile
          icon="keyboard_double_arrow_up"
          value={live ? `+${m.scoreTrendPts} pts` : FINANCIAL_MASK}
          label="Score Trend"
          caption="Estimated change"
          valueColor={OT.primary}
        />
      </Box>

      <HowBufferHelpsSection />
      <KeepBuildingSection />
      <DisclaimerCard />
    </Stack>
  );
}
