import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { SendHorizontal } from "lucide-react";

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

export function AiScreen({
  sendMessageRef,
  hideSuggestedChips,
}: {
  sendMessageRef?: React.MutableRefObject<((text: string) => void) | null>;
  hideSuggestedChips?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      text: "Hi! I'm Buffer AI. I can help with debt payoff and credit improvement.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  return (
    <Stack
      sx={{
        height: { xs: "calc(100dvh - 56px - 72px)", lg: "100%" },
        maxWidth: { xs: 672, lg: "none" },
        mx: "auto",
        width: "100%",
        flex: { lg: 1 },
        minHeight: { lg: 0 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ px: { xs: 2, lg: 0 }, pt: { xs: 2.5, lg: 0 }, pb: 1.5, borderBottom: { xs: 1, lg: 0 }, borderColor: "divider" }}>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ display: { lg: "none" } }}
        >
          Buffer AI
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: { lg: "none" }, mt: 0.25 }}>
          Personalized financial guidance
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 2, lg: 0 }, py: 2, minHeight: 0 }}>
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
          {AI_SUGGESTED_PROMPTS.map((s) => (
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
