import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router";
import { BODY_FONT, HEADLINE_FONT, OT } from "../home/overview/overviewTokens";
import { MsIcon } from "../home/overview/MsIcon";
import { CREDIT_BUILDER_METRICS, HOW_BUFFER_HELPS } from "./creditBuilderMock";

const iconWrap = {
  display: "inline-flex",
  mb: 2,
  p: 1,
  borderRadius: "0.5rem",
  bgcolor: OT.teal50,
  color: OT.teal600,
};

type Variant = "pre" | "post";

function CreditBuilderHeader({ variant }: { variant: Variant }) {
  return (
    <header style={{ marginBottom: "2.5rem", maxWidth: "48rem" }}>
      <Typography
        component="h1"
        sx={{
          fontFamily: HEADLINE_FONT,
          fontSize: { xs: "2.25rem", md: "2.75rem" },
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
          lineHeight: 1.625,
          color: OT.onSurfaceVariant,
        }}
      >
        {variant === "pre"
          ? "Build credit health with consistent habits — connect accounts to see personalized insights."
          : "Small consistent actions can help strengthen your credit profile over time."}
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
        border: `1px solid ${OT.cardBorder}`,
        bgcolor: OT.surfaceContainerLowest,
        boxShadow: OT.cardShadow,
      }}
    >
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 }, position: "relative" }}>
        <Box sx={{ position: "absolute", top: 16, right: 16 }}>
          <Box sx={{ ...iconWrap, mb: 0, p: 0.75 }}>
            <MsIcon name={icon} sx={{ fontSize: 22 }} />
          </Box>
        </Box>
        <Box sx={{ pr: 5 }}>
          <Typography
            sx={{
              fontFamily: BODY_FONT,
              fontSize: "0.875rem",
              fontWeight: 700,
              color: OT.onSurfaceVariant,
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontFamily: HEADLINE_FONT,
              fontSize: { xs: "1.75rem", sm: "2rem" },
              lineHeight: 1.15,
              fontWeight: 800,
              color: valueColor ?? OT.onSurface,
              mt: 0.75,
            }}
          >
            {value}
          </Typography>
          <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.75rem", color: OT.outline, mt: 1 }}>
            {caption}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function HowBufferHelpsSection() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: OT.cardRadius,
        border: `1px solid ${OT.cardBorder}`,
        bgcolor: OT.surfaceContainerLowest,
        boxShadow: OT.cardShadow,
        overflow: "hidden",
        mb: 3,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        sx={{
          alignItems: "stretch",
          minHeight: { md: 280 },
        }}
      >
        <Box sx={{ flex: "1 1 55%", p: { xs: 3, md: 4 }, minWidth: 0 }}>
          <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.25rem", color: OT.onSurface, mb: 2.5 }}>
            How Buffer Helps
          </Typography>
          <Stack component="ul" spacing={2} sx={{ m: 0, p: 0, listStyle: "none" }}>
            {HOW_BUFFER_HELPS.map((item) => (
              <Stack key={item.text} component="li" direction="row" alignItems="flex-start" spacing={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: alpha(OT.primary, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <MsIcon name={item.icon} sx={{ fontSize: 20, color: OT.primary }} />
                </Box>
                <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.9375rem", lineHeight: 1.55, color: OT.onSurface, pt: 0.25 }}>
                  {item.text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Box
          sx={{
            flex: "1 1 45%",
            minHeight: { xs: 200, md: "auto" },
            bgcolor: "#0f172a",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(145deg, ${alpha("#0891b2", 0.35)} 0%, #0f172a 50%, #020617 100%)`,
            }}
          />
          <Stack alignItems="center" spacing={1} sx={{ position: "relative", zIndex: 1 }}>
            <Stack direction="row" spacing={-1} alignItems="flex-end" sx={{ opacity: 0.95 }}>
              {[0, 1, 2, 3].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 44,
                    height: 44 - i * 6,
                    borderRadius: "50%",
                    border: "3px solid",
                    borderColor: alpha("#e2e8f0", 0.85 - i * 0.12),
                    bgcolor: alpha("#64748b", 0.35 + i * 0.1),
                    boxShadow: `0 8px 24px ${alpha("#000", 0.35)}`,
                  }}
                />
              ))}
            </Stack>
            <MsIcon name="paid" sx={{ fontSize: 48, color: alpha("#fde68a", 0.95), filter: "drop-shadow(0 0 12px rgba(250,204,21,0.5))" }} />
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

function KeepBuildingSection() {
  const navigate = useNavigate();
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: OT.cardRadius,
        border: `1px solid ${OT.cardBorder}`,
        bgcolor: OT.surfaceContainerLowest,
        boxShadow: OT.cardShadow,
        mb: 3,
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          alignItems={{ xs: "flex-start", lg: "center" }}
          justifyContent="space-between"
          spacing={3}
        >
          <Box sx={{ maxWidth: 480 }}>
            <Typography sx={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: "1.25rem", color: OT.onSurface, mb: 1 }}>
              Keep Building
            </Typography>
            <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.9375rem", color: OT.onSurfaceVariant, lineHeight: 1.6 }}>
              Stay consistent to reach your financial milestones.
            </Typography>
          </Box>
          <Stack spacing={1.5} sx={{ width: { xs: "100%", lg: "auto" }, minWidth: { lg: 320 } }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                sx={{
                  borderRadius: "999px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontFamily: BODY_FONT,
                  px: 3,
                  py: 1.25,
                  bgcolor: OT.primary,
                  boxShadow: "none",
                  "&:hover": { bgcolor: OT.primaryContainer, boxShadow: "none" },
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
                  fontWeight: 700,
                  fontFamily: BODY_FONT,
                  px: 3,
                  py: 1.25,
                  borderColor: OT.cardBorder,
                  color: OT.onSurface,
                  bgcolor: OT.surfaceContainerLow,
                  "&:hover": { borderColor: OT.outline, bgcolor: OT.surfaceContainer },
                }}
              >
                Make Extra Payment
              </Button>
            </Stack>
            <Button
              variant="outlined"
              onClick={() => void navigate("/dashboard/payoff")}
              fullWidth
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 700,
                fontFamily: BODY_FONT,
                py: 1.25,
                borderColor: OT.cardBorder,
                color: OT.onSurfaceVariant,
                bgcolor: OT.surfaceContainerLow,
                maxWidth: { sm: 360 },
                "&:hover": { borderColor: OT.outline, bgcolor: OT.surfaceContainer },
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
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${OT.cardBorder}`,
        bgcolor: OT.surfaceContainerLow,
        p: 2.5,
        mb: 4,
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={1.5}>
        <MsIcon name="info" sx={{ fontSize: 22, color: OT.primary, flexShrink: 0, mt: 0.25 }} />
        <Typography sx={{ fontFamily: BODY_FONT, fontSize: "0.8125rem", lineHeight: 1.65, color: OT.onSurfaceVariant }}>
          Credit improvement takes time and results vary based on your credit history, bureau reporting, and other factors. Illustrative metrics on this page are
          estimates and not guarantees of future scores or outcomes.
        </Typography>
      </Stack>
    </Box>
  );
}

export function CreditBuilderPage({ variant }: { variant: Variant }) {
  const m = CREDIT_BUILDER_METRICS;

  return (
    <Stack
      component="main"
      role="main"
      aria-label="Credit Builder"
      spacing={0}
      sx={{
        px: { xs: 2, lg: 0 },
        py: { xs: 2.5, lg: 0 },
        maxWidth: { xs: "100%", sm: 672, lg: "min(1536px, 100%)" },
        mx: "auto",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <CreditBuilderHeader variant={variant} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
          mb: 3,
        }}
      >
        <MetricTile
          icon="trending_down"
          value={`${m.utilBeforePct}% → ${m.utilAfterPct}%`}
          label="Utilization"
          caption="Lower revolving use"
        />
        <MetricTile
          icon="verified"
          value={`${m.onTimeStreakMonths} months`}
          label="On-Time Payments"
          caption="Staying on track"
        />
        <MetricTile
          icon="keyboard_double_arrow_up"
          value={`+${m.scoreTrendPts} pts`}
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
