import { useState, useRef, useEffect, useCallback } from "react";

type Role = "user" | "assistant";
interface Message {
  id: string;
  role: Role;
  text: string;
}

const SUGGESTED = [
  "How can I pay off my TD card fastest?",
  "What will my score be in 6 months?",
  "Should I use the avalanche or snowball method?",
  "How does the Buffer Credit Line work?",
];

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
    <div className={["flex gap-2", isUser ? "justify-end" : "justify-start"].join(" ")}>
      <div className={["max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed", isUser ? "bg-[#00C9A7] text-[#0F1117]" : "bg-white text-[#0F172A]"].join(" ")}>
        {msg.text}
      </div>
    </div>
  );
}

export function AiScreen() {
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

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-screen max-w-2xl mx-auto w-full">
      <div className="px-4 pt-5 pb-3 border-b border-[#E2E8F0]">
        <h1 className="text-[#0F172A] text-xl font-bold">Buffer AI</h1>
        <p className="text-[#64748B] text-xs mt-0.5">Personalized financial guidance</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {thinking && <div className="text-xs text-[#64748B]">Thinking...</div>}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTED.map((s) => (
            <button key={s} type="button" onClick={() => sendMessage(s)} className="text-xs bg-white border border-[#E2E8F0] rounded-full px-3 py-1.5 text-[#475569]">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 pb-6 pt-3 border-t border-[#E2E8F0] flex gap-2 items-end">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          placeholder="Ask anything about your finances..."
          className="flex-1 bg-white text-[#0F172A] text-sm rounded-xl px-4 py-3 border border-[#E2E8F0]"
        />
        <button type="button" onClick={() => sendMessage(input)} disabled={!input.trim() || thinking} className="w-11 h-11 rounded-xl bg-[#00C9A7] text-[#0F1117] disabled:opacity-40">
          Send
        </button>
      </div>
    </div>
  );
}
