import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
    <div className="flex flex-col gap-4 px-4 py-5 max-w-2xl mx-auto w-full pb-24 lg:pb-6">
      <div>
        <h1 className="text-[#0F172A] text-2xl font-bold">Credit</h1>
        <p className="text-[#475569] text-sm mt-1">Track and grow your credit score</p>
      </div>

      <section className="bg-white rounded-2xl p-5">
        <p className="text-[#64748B] text-xs mb-1">Current score</p>
        <p className="text-4xl font-bold font-mono text-[#F59E0B]">{score.score}</p>
        <p className="text-[#64748B] text-xs mt-1">via {score.bureau}</p>
      </section>

      <section className="bg-white rounded-2xl p-5">
        <h2 className="text-[#475569] text-sm font-medium mb-4">6-Month Score Trend</h2>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={score.history} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false} axisLine={false} domain={["dataMin - 20", "dataMax + 20"]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#00C9A7" strokeWidth={2.5} dot={{ fill: "#00C9A7", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
