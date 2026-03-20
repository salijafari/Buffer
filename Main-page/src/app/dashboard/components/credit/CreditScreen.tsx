import { useState } from "react";
import { Card, CardContent, Stack, Typography, Box, useMediaQuery, useTheme } from "@mui/material";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CreditScore } from "../../types/timeline";

const MOCK_SCORE: CreditScore = {
  score: 682,
  band: "fair",
  reportDate: "2026-03-01",
  bureau: "equifax",
  history: [
    { month: "Sep", score: 641 },
    { month: "Oct", score: 649 },
    { month: "Nov", score: 658 },
    { month: "Dec", score: 665 },
    { month: "Jan", score: 672 },
    { month: "Feb", score: 679 },
    { month: "Mar", score: 682 },
  ],
};

const GRADUATION_PATH_ITEMS = [
  "Monthly on-time payments build positive history",
  "Score typically improves in 3–6 months",
  "Automatically graduates to full Credit Line when eligible",
] as const;

function bureauLabel(bureau: string): string {
  const b = bureau.toLowerCase();
  if (b === "equifax") return "Equifax";
  if (b === "transunion") return "TransUnion";
  return bureau;
}

/** Desktop right-rail: same copy as Credit Builder path in onboarding */
export function CreditGraduationRail() {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" fontWeight={700} color="text.primary">
        Graduation path
      </Typography>
      <Box
        sx={{
          borderRadius: 2,
          p: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack component="ol" spacing={1.25} sx={{ m: 0, pl: 2 }}>
          {GRADUATION_PATH_ITEMS.map((item, i) => (
            <Typography key={i} component="li" variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              {item}
            </Typography>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

export function CreditScreen() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [score] = useState<CreditScore>(MOCK_SCORE);

  return (
    <Stack
      spacing={{ xs: 2, lg: 3 }}
      sx={{
        px: { xs: 2, lg: 0 },
        py: { xs: 2.5, lg: 0 },
        maxWidth: { xs: 672, lg: "none" },
        mx: "auto",
        width: "100%",
      }}
    >
      <Box sx={{ display: { lg: "none" } }}>
        <Typography variant="h5" fontWeight={700}>
          Credit
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Track and grow your credit score
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={{ xs: 2, lg: 3 }}
        alignItems={{ lg: "stretch" }}
        sx={{ width: "100%" }}
      >
        <Card variant="outlined" sx={{ flex: { lg: "0 0 42%" }, minWidth: 0 }}>
          <CardContent sx={{ p: { xs: 2.5, lg: 3 }, "&:last-child": { pb: { xs: 2.5, lg: 3 } } }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Current score
            </Typography>
            <Typography variant="h3" fontWeight={700} fontFamily="ui-monospace, monospace" sx={{ color: "#F59E0B", fontSize: { lg: "3rem" } }}>
              {score.score}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              via {score.bureau}
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: { lg: "1 1 58%" }, minWidth: 0 }}>
          <CardContent sx={{ p: { xs: 2.5, lg: 3 }, "&:last-child": { pb: { xs: 2.5, lg: 3 } } }}>
            <Typography variant="body2" fontWeight={500} color="text.secondary" gutterBottom sx={{ fontSize: { lg: "1.125rem" } }}>
              6-Month Score Trend
            </Typography>
            <Box sx={{ height: { xs: 144, lg: 220 }, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={score.history} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false} axisLine={false} domain={["dataMin - 20", "dataMax + 20"]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#00C9A7" strokeWidth={2.5} dot={{ fill: "#00C9A7", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {isDesktop && (
        <Card variant="outlined">
          <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom sx={{ fontSize: "1.125rem" }}>
              Tradeline status
            </Typography>
            <Typography variant="body2" color="text.primary">
              Reporting through {bureauLabel(score.bureau)}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
