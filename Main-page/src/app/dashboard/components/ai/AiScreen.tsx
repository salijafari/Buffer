import { useCallback, useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ChevronDown, Lock, SendHorizontal, Sparkles, X } from "lucide-react";
import { useDashboardShell } from "../../context/DashboardShellContext";

type Role = "user" | "assistant";
interface Message {
  id: string;
  role: Role;
  text: string;
}

export const AI_SUGGESTED_PROMPTS = [
  "How can I pay off my TD card fastest?",
  "What will my score be in 6 months?",
  "Should I use the avalanche or snowball method?",
  "How does the Buffer Credit Line work?",
] as const;

export const AI_SUGGESTED_PROMPTS_PRE = [
  "How does Credit Builder work?",
  "When could I be debt-free?",
  "What is a good credit score?",
  "How do balance transfers work?",
] as const;

function getSimulatedResponse(userText: string): string {
  const lower = userText.toLowerCase();
  if (lower.includes("td") || lower.includes("pay off") || lower.includes("fastest")) {
    return "Based on your TD Cashback Visa balance of $6,800 at 19.99% APR, the fastest payoff strategy is to direct all extra payments there first.";
  }
  if (lower.includes("score") || lower.includes("credit")) {
    return "Your score is currently 682 (Fair). At your current trajectory with on-time payments, you could reach 720+ by September 2026.";
  }
  return "I can help with payoff strategy, credit score trends, and monthly payment planning. Tell me your priority.";
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <Stack direction="row" justifyContent={isUser ? "flex-end" : "flex-start"}>
      <Paper
        elevation={0}
        sx={{
          maxWidth: "80%",
          px: 2,
          py: 1.25,
          borderRadius: 3,
          bgcolor: isUser ? "primary.main" : "background.paper",
          color: isUser ? "primary.contrastText" : "text.primary",
          border: isUser ? "none" : 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
          {msg.text}
        </Typography>
      </Paper>
    </Stack>
  );
}

const PRE_INSIGHTS = [
  {
    title: "Prime rates within reach",
    body: "Based on a score of 682, you're ~18 points from prime rates. Credit Builder could help you get there in ~3 months (illustrative).",
    cta: "Start Credit Builder",
  },
  {
    title: "Interest adds up",
    body: "At your current pace, you could pay thousands in interest this year. Connecting your cards lets us find exactly where to save.",
    cta: "Connect cards",
  },
  {
    title: "Automation wins",
    body: "Canadians in your debt bracket who automate payoff pay off debt 2.1× faster on average (benchmark).",
    cta: "See your payoff plan",
  },
] as const;

const POST_INSIGHTS_SEED = [
  {
    id: "1",
    title: "High utilization on TD",
    detail: "Your TD card is at 82% utilization. Consider a transfer before the next statement cycle.",
    action: "Do this now",
  },
  {
    id: "2",
    title: "Subscription idle 60+ days",
    detail: "Streaming charge $14.99/mo — no transactions matched. Review if you still use it.",
    action: "See details",
  },
] as const;

export function AiScreen({
  sendMessageRef,
  hideSuggestedChips,
}: {
  sendMessageRef?: React.MutableRefObject<((text: string) => void) | null>;
  hideSuggestedChips?: boolean;
}) {
  const { connectionMode } = useDashboardShell();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      text:
        connectionMode === "pre"
          ? "Hi! I'm Buffer AI. Ask me about payoff strategies using your onboarding estimates, or connect accounts for personalized numbers."
          : "Hi! I'm Buffer AI. I can help with debt payoff and credit improvement using your connected data (mock).",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [postInsights, setPostInsights] = useState(POST_INSIGHTS_SEED);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || thinking) return;
      setInput("");
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", text: text.trim() }]);
      setThinking(true);
      await new Promise((r) => setTimeout(r, 600));
      setMessages((prev) => [...prev, { id: `${Date.now()}-a`, role: "assistant", text: getSimulatedResponse(text) }]);
      setThinking(false);
    },
    [thinking],
  );

  useEffect(() => {
    if (!sendMessageRef) return;
    sendMessageRef.current = (t: string) => {
      void sendMessage(t);
    };
    return () => {
      sendMessageRef.current = null;
    };
  }, [sendMessageRef, sendMessage]);

  const suggested = connectionMode === "pre" ? AI_SUGGESTED_PROMPTS_PRE : AI_SUGGESTED_PROMPTS;

  const preHeader = (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} color="text.primary">
        Insights for you
      </Typography>
      {PRE_INSIGHTS.map((ins, i) => (
        <Card key={i} variant="outlined">
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Sparkles size={18} style={{ marginTop: 2, opacity: 0.85 }} aria-hidden />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {ins.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {ins.body}
                </Typography>
                <Button size="small" variant="outlined" sx={{ mt: 1 }} disabled>
                  {ins.cta}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
      <Card variant="outlined" sx={{ position: "relative", overflow: "hidden", bgcolor: "grey.50" }}>
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1, bgcolor: "rgba(255,255,255,0.72)", zIndex: 1 }}>
          <Lock size={28} aria-hidden />
          <Typography variant="body2" fontWeight={600} textAlign="center" px={2}>
            Connect your accounts to get your personalized plan
          </Typography>
        </Box>
        <CardContent sx={{ p: 2, opacity: 0.35, filter: "blur(1px)" }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Monthly action plan
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Pay $430 to Buffer on the 15th. Put $50 extra toward your TD card. Score could improve 8–15 points this month.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );

  const postHeader = (
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Card variant="outlined" sx={{ borderLeft: 4, borderColor: "primary.main" }}>
        <CardContent sx={{ p: { xs: 2, lg: 3 } }}>
          <Typography variant="overline" color="primary" fontWeight={700}>
            Your action plan — March 2026
          </Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {[
              { done: true, text: "Pay $430 to Buffer on Mar 15 (autopay set)", amt: "", impact: "" },
              { done: false, text: "TD card reaches $0 this month", amt: "", impact: "" },
              { done: false, text: "Put $220 from dining underspend toward Scotiabank", amt: "$220", impact: "" },
              { done: false, text: "Expected score change", amt: "", impact: "+5 to +12 pts" },
            ].map((row, i) => (
              <Stack key={i} direction="row" alignItems="flex-start" spacing={1}>
                <Typography variant="body2" sx={{ width: 24, fontWeight: 700, color: row.done ? "primary.main" : "text.disabled" }}>
                  {row.done ? "✓" : "○"}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={row.done ? 600 : 400}>
                    {row.text}
                  </Typography>
                  {row.impact ? (
                    <Typography variant="caption" color="text.secondary">
                      {row.impact}
                    </Typography>
                  ) : null}
                </Box>
              </Stack>
            ))}
          </Stack>
          <Button size="small" sx={{ mt: 1 }}>
            See full analysis
          </Button>
        </CardContent>
      </Card>

      <Typography variant="subtitle2" fontWeight={700}>
        Proactive insights
      </Typography>
      {postInsights.map((ins) => (
        <Card key={ins.id} variant="outlined">
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {ins.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {ins.detail}
                </Typography>
                <Button size="small" variant="contained" sx={{ mt: 1 }}>
                  {ins.action}
                </Button>
              </Box>
              <IconButton size="small" aria-label="Dismiss" onClick={() => setPostInsights((prev) => prev.filter((x) => x.id !== ins.id))}>
                <X size={18} />
              </IconButton>
            </Stack>
          </CardContent>
        </Card>
      ))}

      <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2, "&:before": { display: "none" } }}>
        <AccordionSummary expandIcon={<ChevronDown size={20} />}>
          <Typography fontWeight={600}>Spending snapshot</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Top categories (mock) · month over month
          </Typography>
          {[
            { cat: "Groceries", pct: 72, trend: "↑" },
            { cat: "Dining", pct: 45, trend: "↓" },
            { cat: "Transit", pct: 30, trend: "→" },
          ].map((row) => (
            <Box key={row.cat} sx={{ mb: 1.5 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">
                  {row.cat} {row.trend}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.pct}%
                </Typography>
              </Stack>
              <LinearProgress variant="determinate" value={row.pct} sx={{ mt: 0.5, height: 6, borderRadius: 999 }} />
            </Box>
          ))}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
            Subscriptions (mock)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Netflix $16.99/mo · Gym $49/mo — tap “Cancel?” when unused (coming soon).
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Card variant="outlined" sx={{ bgcolor: "grey.50" }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Premium: credit report explanations and dispute letters appear inline in this chat when subscribed (mock).
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );

  return (
    <Stack
      sx={{
        height: { xs: "calc(100dvh - 56px - 72px)", lg: "100%" },
        maxWidth: { xs: "100%", sm: 672, lg: "none" },
        mx: "auto",
        width: "100%",
        minWidth: 0,
        flex: { lg: 1 },
        minHeight: { lg: 0 },
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ px: { xs: 2, lg: 0 }, pt: { xs: 2.5, lg: 0 }, pb: 1.5, borderBottom: { xs: 1, lg: 0 }, borderColor: "divider" }}>
        <Typography variant="h6" fontWeight={700} sx={{ display: { lg: "none" } }}>
          Buffer AI
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: { lg: "none" }, mt: 0.25 }}>
          Personalized financial guidance
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 2, lg: 0 }, py: 2, minHeight: 0 }}>
        {connectionMode === "pre" ? preHeader : postHeader}
        <Stack spacing={1.5}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {thinking && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CircularProgress size={14} thickness={6} />
              <Typography variant="caption" color="text.secondary">
                Thinking…
              </Typography>
            </Stack>
          )}
          <div ref={bottomRef} />
        </Stack>
      </Box>

      {messages.length === 1 && !hideSuggestedChips && (
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ px: 2, pb: 1 }}>
          {suggested.map((s) => (
            <Chip
              key={s}
              label={s}
              size="small"
              onClick={() => void sendMessage(s)}
              variant="outlined"
              sx={{ borderColor: "divider", color: "text.secondary" }}
            />
          ))}
        </Stack>
      )}

      <Paper square elevation={3} sx={{ borderTop: 1, borderColor: "divider", p: 2, pb: 2.5, flexShrink: 0 }}>
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            multiline
            maxRows={4}
            minRows={1}
            fullWidth
            size="small"
            placeholder="Ask anything about your finances…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
            }}
          />
          <IconButton
            color="primary"
            onClick={() => void sendMessage(input)}
            disabled={!input.trim() || thinking}
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              borderRadius: 2,
              "&:hover": { bgcolor: "primary.dark" },
              "&.Mui-disabled": { bgcolor: "action.disabledBackground" },
            }}
            aria-label="Send"
          >
            <SendHorizontal size={20} />
          </IconButton>
        </Stack>
      </Paper>
    </Stack>
  );
}
