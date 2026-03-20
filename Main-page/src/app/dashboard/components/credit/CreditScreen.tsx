import { useState } from "react";
import { Card, CardContent, Stack, Typography, Box } from "@mui/material";
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

export function CreditScreen() {
  const [score] = useState<CreditScore>(MOCK_SCORE);
  return (
    <Stack spacing={2} sx={{ px: 2, py: 2.5, maxWidth: 672, mx: "auto", width: "100%" }}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          Credit
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Track and grow your credit score
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Current score
          </Typography>
          <Typography variant="h3" fontWeight={700} fontFamily="ui-monospace, monospace" sx={{ color: "#F59E0B" }}>
            {score.score}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            via {score.bureau}
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Typography variant="body2" fontWeight={500} color="text.secondary" gutterBottom>
            6-Month Score Trend
          </Typography>
          <Box sx={{ height: 144, mt: 2 }}>
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
  );
}
