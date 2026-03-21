import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Lock } from "lucide-react";
import { useState } from "react";
import type { CreditScore } from "../../types/timeline";
import { MOCK_SHOW_CREDIT_GRADUATION_SECTION } from "../../data/mockDashboard";
import { fmtCurrency } from "../../lib/dashboardFormat";

const MOCK_SCORE: CreditScore = {
  score: 682,
  band: "fair",
  reportDate: "2026-03-01",
  bureau: "transunion",
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

const FACTORS: { name: string; value: number; label: string; color: string }[] = [
  { name: "Payment history", value: 88, label: "Good", color: "#22C55E" },
  { name: "Utilization", value: 55, label: "Fair", color: "#F59E0B" },
  { name: "Credit age", value: 62, label: "Fair", color: "#F59E0B" },
  { name: "Credit mix", value: 72, label: "Good", color: "#22C55E" },
  { name: "New inquiries", value: 40, label: "Needs work", color: "#EF4444" },
];

function bureauLabel(bureau: string): string {
  const b = bureau.toLowerCase();
  if (b === "equifax") return "Equifax";
  if (b === "transunion") return "TransUnion";
  return bureau;
}

export function CreditPostConnection() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [score] = useState<CreditScore>(MOCK_SCORE);

  const showGraduation = MOCK_SHOW_CREDIT_GRADUATION_SECTION;

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
          Track and grow your credit score
        </Typography>
      </Box>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={{ xs: 2, lg: 3 }} alignItems={{ lg: "stretch" }} sx={{ width: "100%" }}>
        <Card variant="outlined" sx={{ flex: { lg: "0 0 42%" }, minWidth: 0 }}>
          <CardContent sx={{ p: { xs: 2, lg: 3 }, "&:last-child": { pb: { xs: 2, lg: 3 } } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Current score (live mock)
              </Typography>
              <Chip label="+12 pts this month" size="small" color="success" variant="outlined" />
            </Stack>
            <Typography variant="h3" fontWeight={700} fontFamily="ui-monospace, monospace" sx={{ color: primary, fontSize: { lg: "3rem" } }}>
              {score.score}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              via {bureauLabel(score.bureau)} · Next update Apr 1 (mock)
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: { lg: "1 1 58%" }, minWidth: 0 }}>
          <CardContent sx={{ p: { xs: 2, lg: 3 }, "&:last-child": { pb: { xs: 2, lg: 3 } } }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom sx={{ fontSize: { lg: "1.125rem" } }}>
              6-month trend
            </Typography>
            <Box sx={{ height: { xs: 144, lg: 220 }, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={score.history} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false} axisLine={false} domain={["dataMin - 20", "dataMax + 20"]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke={primary} strokeWidth={2.5} dot={{ fill: primary, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Score factors
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            {FACTORS.map((f) => (
              <Box key={f.name}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight={600}>
                    {f.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: f.color, fontWeight: 600 }}>
                    {f.label}
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={f.value} sx={{ mt: 0.5, height: 8, borderRadius: 999, bgcolor: "grey.200", "& .MuiLinearProgress-bar": { bgcolor: f.color } }} />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderColor: `${primary}55` }}>
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Credit Builder tradeline
          </Typography>
          <Chip label="Active · Reporting to 2 bureaus" size="small" sx={{ mb: 2, bgcolor: `${primary}18`, color: "primary.dark" }} />
          <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
            {[
              ["Limit", "$1,500"],
              ["Utilization", "0.33%"],
              ["Months active", "8"],
              ["On-time", "8"],
            ].map(([k, v]) => (
              <Box key={k}>
                <Typography variant="caption" color="text.secondary">
                  {k}
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {v}
                </Typography>
              </Box>
            ))}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            TransUnion: last reported Mar 1 ✓ · Equifax: last reported Feb 28 ✓ · Next payment $4.99 Mar 12 (mock)
          </Typography>
        </CardContent>
      </Card>

      {showGraduation ? (
        <Card variant="outlined">
          <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Graduation path
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Progress toward the balance-transfer credit line (mock thresholds).
            </Typography>
            {[
              { label: "Credit score / 660", value: 78, sub: "22 points to go" },
              { label: "Income / $40,000", value: 90, sub: "Verified" },
              { label: "Reward points / unlock", value: 45, sub: "214 / 475" },
            ].map((row) => (
              <Box key={row.label} sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  {row.label}
                </Typography>
                <LinearProgress variant="determinate" value={row.value} sx={{ my: 0.5, height: 8, borderRadius: 999, "& .MuiLinearProgress-bar": { bgcolor: primary } }} />
                <Typography variant="caption" color="text.secondary">
                  {row.sub}
                </Typography>
              </Box>
            ))}
            <Typography variant="body2" sx={{ mt: 1 }}>
              At your current pace, you could qualify by <strong>December 2026</strong> (illustrative).
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>
              See how to earn points faster
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Utilization breakdown
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Overall utilization 64% (mock)
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Account</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell align="right">Limit</TableCell>
                  <TableCell>Util</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { n: "TD Visa", b: 6800, l: 10000, u: 68 },
                  { n: "Scotiabank", b: 3200, l: 5000, u: 64 },
                  { n: "Buffer tradeline", b: 5, l: 1500, u: 0 },
                ].map((row) => (
                  <TableRow key={row.n}>
                    <TableCell>{row.n}</TableCell>
                    <TableCell align="right">{fmtCurrency(row.b, 0)}</TableCell>
                    <TableCell align="right">{fmtCurrency(row.l, 0)}</TableCell>
                    <TableCell>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, row.u)}
                        sx={{
                          height: 6,
                          borderRadius: 999,
                          maxWidth: 120,
                          "& .MuiLinearProgress-bar": {
                            bgcolor: row.u > 70 ? "#EF4444" : row.u > 30 ? "#F59E0B" : primary,
                          },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            AI suggestion (mock): Moving $2,400 from TD to Buffer drops utilization from 68% to 44%.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ bgcolor: "grey.50" }}>
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Lock size={18} aria-hidden />
            <Typography variant="subtitle1" fontWeight={700}>
              Credit report events
            </Typography>
            <Chip label="Premium" size="small" />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upgrade to see inquiries, balance changes, and account updates with AI explanations.
          </Typography>
          <List dense disablePadding>
            <ListItem sx={{ opacity: 0.45, filter: "blur(2px)" }}>
              <ListItemText primary="Mar 1 — New inquiry detected" secondary="TransUnion" />
            </ListItem>
            <ListItem sx={{ opacity: 0.45, filter: "blur(2px)" }}>
              <ListItemText primary="Feb 28 — Balance decreased" secondary="TD Visa" />
            </ListItem>
          </List>
          <Button variant="contained" color="primary" sx={{ mt: 2 }} disabled>
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ bgcolor: "grey.50" }}>
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Lock size={18} aria-hidden />
            <Typography variant="subtitle1" fontWeight={700}>
              Dispute centre
            </Typography>
            <Chip label="Premium" size="small" />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            No issues found in mock mode — we check every month when subscribed.
          </Typography>
        </CardContent>
      </Card>

      {isDesktop && (
        <Card variant="outlined">
          <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary" gutterBottom sx={{ fontSize: "1.125rem" }}>
              Tradeline status (summary)
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
