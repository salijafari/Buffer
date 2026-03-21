import { Box, Button, Card, CardContent, LinearProgress, Stack, Typography, useTheme } from "@mui/material";
import { useDashboardShell } from "../../context/DashboardShellContext";
import { estimatedAprFromCreditScore } from "../../lib/dashboardFormulas";

function bandFromScore(score: number | null): { label: string; min: number; max: number } {
  if (score == null) return { label: "Not set", min: 580, max: 669 };
  if (score < 580) return { label: "Poor", min: 300, max: 579 };
  if (score < 670) return { label: "Fair", min: 580, max: 669 };
  if (score < 740) return { label: "Good", min: 670, max: 739 };
  if (score < 800) return { label: "Very Good", min: 740, max: 799 };
  return { label: "Excellent", min: 800, max: 850 };
}

export function CreditPreConnection() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const { profile } = useDashboardShell();
  const score = profile?.credit_score ?? null;
  const band = bandFromScore(score);
  const markerPct = score != null ? Math.min(100, Math.max(0, ((score - 300) / (850 - 300)) * 100)) : 40;

  return (
    <Stack
      spacing={{ xs: 2, lg: 3 }}
      sx={{
        px: { xs: 2, lg: 0 },
        py: { xs: 2.5, lg: 0 },
        maxWidth: { xs: "100%", sm: 672, lg: "none" },
        mx: "auto",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ display: { lg: "none" } }}>
        <Typography variant="h5" fontWeight={700}>
          Credit Builder
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Build credit health before you connect accounts
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Credit score
          </Typography>
          {score != null ? (
            <>
              <Typography variant="h3" fontWeight={700} fontFamily="ui-monospace, monospace" sx={{ color: primary }}>
                {score}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {band.label} · self-reported / soft pull placeholder
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h6" fontWeight={700}>
                {band.label} range
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Complete onboarding with a score estimate, or connect for bureau data.
              </Typography>
            </>
          )}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Range 300–850 (illustrative bar)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={markerPct}
              sx={{ mt: 0.5, height: 10, borderRadius: 999, "& .MuiLinearProgress-bar": { bgcolor: primary } }}
            />
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Score improvement projection
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            With Credit Builder, your score could reach <strong>705–735</strong> within ~6 months (illustrative). Factors: payment history, utilization
            (adds $1,500 limit at low usage), and credit mix.
          </Typography>
          <Button variant="contained" color="primary">
            Start your free trial
          </Button>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Credit Builder tradeline
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            $1,500 tradeline · reporting monthly · 3 months free when you enroll (mock copy).
          </Typography>
          <Button variant="outlined" color="primary">
            Learn more
          </Button>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderLeft: 4, borderColor: "primary.main" }}>
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Typography variant="body1" fontWeight={600}>
            Members who started with a Fair score (580–659) saw an average improvement of +47 points in 90 days (aggregate benchmark).
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            Estimated APR from your profile for other dashboards: ~{(estimatedAprFromCreditScore(score) * 100).toFixed(1)}%
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
