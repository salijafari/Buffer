'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'user' | 'assistant';

interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
}

interface ProactiveCard {
  id: string;
  type: 'insight' | 'alert' | 'tip';
  title: string;
  body: string;
  cta?: string;
  ctaHref?: string;
}

// ─── Mock proactive cards ─────────────────────────────────────────────────────

const INITIAL_PROACTIVE: ProactiveCard[] = [
  {
    id: 'p1',
    type: 'insight',
    title: 'You can save $4,040 in interest',
    body: 'Increasing your TD Visa payment by $250/mo moves your debt-free date 5.4 years earlier.',
    cta: 'See payoff plan',
    ctaHref: '/payoff',
  },
  {
    id: 'p2',
    type: 'alert',
    title: 'High utilization on TD Visa',
    body: 'Your TD Cashback Visa is at 68% utilization. Keeping it below 30% could lift your score by ~15 points.',
    cta: 'Make a payment',
    ctaHref: '/payoff',
  },
  {
    id: 'p3',
    type: 'tip',
    title: 'Credit score trending up',
    body: "Your score has risen 41 points since September. Keep making on-time payments to continue the trend.",
  },
];

// ─── Suggested prompts ────────────────────────────────────────────────────────

const SUGGESTED = [
  'How can I pay off my TD card fastest?',
  'What will my score be in 6 months?',
  'Should I use the avalanche or snowball method?',
  'How does the Buffer Credit Line work?',
];

// ─── Simulated AI responses ───────────────────────────────────────────────────

function getSimulatedResponse(userText: string): string {
  const lower = userText.toLowerCase();
  if (lower.includes('td') || lower.includes('pay off') || lower.includes('fastest')) {
    return "Based on your TD Cashback Visa balance of $6,800 at 19.99% APR, the fastest payoff strategy is to direct all extra payments there first (avalanche method). If you increase to $500/mo on just that card, you'd clear it in about 16 months and save $1,240 in interest. Want me to model that scenario?";
  }
  if (lower.includes('score') || lower.includes('credit')) {
    return "Your score is currently 682 (Fair). At your current trajectory with on-time payments through Buffer Credit Builder, I project you'll reach 720+ by September 2026. The biggest impact would come from reducing your TD Visa utilization below 30% — that alone could add 15–20 points.";
  }
  if (lower.includes('avalanche') || lower.includes('snowball')) {
    return "Great question! **Avalanche** (highest APR first) saves the most interest — in your case, that's your Scotiabank Amex at 21.14%. **Snowball** (lowest balance first) is psychologically motivating. Given your balances and rates, avalanche saves you ~$340 more. Which approach fits your style better?";
  }
  if (lower.includes('buffer') || lower.includes('credit line')) {
    return "The Buffer Credit Line is a revolving credit facility at 14.99% APR — lower than all your current cards. You can use it to pay off high-APR balances and consolidate debt, then pay Buffer back at the lower rate. At your current eligibility, you qualify for up to $5,000. Ready to activate it?";
  }
  return "I'm analyzing your financial profile to answer that. Based on your connected accounts — $11,500 total debt, $5,000/mo income, and 682 credit score — I have some specific suggestions. Could you tell me more about what you're trying to achieve? (e.g., lowest monthly payment, fastest payoff, or credit score improvement)";
}

// ─── Proactive Card ───────────────────────────────────────────────────────────

function ProactiveCardItem({
  card, onDismiss,
}: {
  card: ProactiveCard;
  onDismiss: (id: string) => void;
}) {
  const icon = card.type === 'insight' ? '💡' : card.type === 'alert' ? '⚠️' : '✅';
  const borderColor = card.type === 'insight' ? '#00C9A7' : card.type === 'alert' ? '#F59E0B' : '#60A5FA';

  return (
    <article
      className="bg-white rounded-xl p-4 border-l-2 flex gap-3"
      style={{ borderLeftColor: borderColor }}
      aria-label={`${card.type}: ${card.title}`}
    >
      <span className="text-lg flex-shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[#0F172A] text-sm font-semibold">{card.title}</p>
        <p className="text-[#475569] text-xs mt-1 leading-relaxed">{card.body}</p>
        {card.cta && card.ctaHref && (
          <a
            href={card.ctaHref}
            className="inline-block mt-2 text-xs font-semibold text-[#00C9A7] hover:underline focus-visible:outline-none focus-visible:underline"
          >
            {card.cta} →
          </a>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(card.id)}
        aria-label={`Dismiss ${card.title}`}
        className="text-[#64748B] hover:text-[#475569] transition-colors flex-shrink-0 mt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7] rounded"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </article>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={['flex gap-2', isUser ? 'justify-end' : 'justify-start'].join(' ')}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#00C9A7]/20 flex items-center justify-center flex-shrink-0 mt-auto" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
      )}
      <div
        className={[
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-[#00C9A7] text-[#0F1117] font-medium rounded-br-sm'
            : 'bg-white text-[#0F172A] rounded-bl-sm',
        ].join(' ')}
        role={!isUser ? 'article' : undefined}
        aria-label={!isUser ? `Buffer AI: ${msg.text}` : undefined}
      >
        {msg.text}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AiScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: "Hi! I'm Buffer AI. I can help you understand your debt payoff timeline, credit score trends, and savings opportunities. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [proactive, setProactive] = useState<ProactiveCard[]>(INITIAL_PROACTIVE);
  const [input, setInput]         = useState('');
  const [thinking, setThinking]   = useState(false);
  const [showProactive, setShowProactive] = useState(true);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || thinking) return;

    setInput('');
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setThinking(true);

    // Simulate streaming delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const response = getSimulatedResponse(text);
    setMessages(prev => [
      ...prev,
      { id: (Date.now() + 1).toString(), role: 'assistant', text: response, timestamp: new Date() },
    ]);
    setThinking(false);
  }, [thinking]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function dismissCard(id: string) {
    setProactive(prev => prev.filter(c => c.id !== id));
  }

  const hasProactive = proactive.length > 0;

  return (
    <div
      className="flex flex-col h-[calc(100vh-64px)] lg:h-screen max-w-2xl mx-auto w-full"
      aria-label="Buffer AI assistant"
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-[#E2E8F0] flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-[#0F172A] text-xl font-bold">Buffer AI</h1>
          <p className="text-[#64748B] text-xs mt-0.5">Personalized financial guidance</p>
        </div>
        {hasProactive && (
          <button
            type="button"
            onClick={() => setShowProactive(v => !v)}
            className="text-xs text-[#00C9A7] hover:underline focus-visible:outline-none focus-visible:underline"
          >
            {showProactive ? `Hide insights (${proactive.length})` : `Show insights (${proactive.length})`}
          </button>
        )}
      </div>

      {/* Proactive cards */}
      {hasProactive && showProactive && (
        <div className="px-4 py-3 border-b border-[#E2E8F0] flex-shrink-0 flex flex-col gap-2 max-h-72 overflow-y-auto">
          <p className="text-[#64748B] text-xs font-medium mb-0.5">Insights for you</p>
          {proactive.map(card => (
            <ProactiveCardItem key={card.id} card={card} onDismiss={dismissCard} />
          ))}
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
        role="log"
        aria-live="polite"
        aria-label="Conversation"
      >
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Typing indicator */}
        {thinking && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-[#00C9A7]/20 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3" aria-live="assertive" aria-label="Buffer AI is thinking">
              <span className="flex gap-1" aria-hidden="true">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#64748B] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts (show when no user messages yet) */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-col gap-2 flex-shrink-0">
          <p className="text-[#64748B] text-xs">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(s)}
                className="text-xs bg-white border border-[#E2E8F0] rounded-full px-3 py-1.5 text-[#475569] hover:border-[#00C9A7]/40 hover:text-[#0F172A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7]"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-safe pb-6 pt-3 border-t border-[#E2E8F0] flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your finances…"
            aria-label="Message input"
            className="flex-1 bg-white text-[#0F172A] text-sm rounded-xl px-4 py-3 border border-[#E2E8F0] outline-none focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20 placeholder:text-[#94A3B8] transition-colors resize-none overflow-hidden min-h-[44px]"
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || thinking}
            aria-label="Send message"
            className="w-11 h-11 rounded-xl bg-[#00C9A7] flex items-center justify-center hover:bg-[#00B496] transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7] flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F1117" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p className="text-[#64748B] text-xs mt-2 text-center">
          AI responses are for informational purposes only, not financial advice.
        </p>
      </div>
    </div>
  );
}
