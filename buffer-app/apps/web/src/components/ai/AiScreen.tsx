'use client';

import { useState, useRef, useEffect } from 'react';

type Message = { id: string; role: 'user' | 'assistant'; text: string };

// Phase 4 — full implementation: proactive cards, credit report tracker, streaming responses.

export function AiScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: "Hi! I'm Buffer AI. I can help you understand your debt payoff timeline, credit score, and next steps. What would you like to know?",
    },
  ]);
  const [input, setInput]     = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || thinking) return;
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setThinking(true);
    // TODO: replace with api.ai.chat({ message: text, threadId })
    await new Promise(r => setTimeout(r, 1200));
    setMessages(prev => [
      ...prev,
      { id: (Date.now() + 1).toString(), role: 'assistant', text: "I'm analysing your financial data… (AI integration coming in Phase 4)" },
    ]);
    setThinking(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-screen max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-[#2A3040] flex-shrink-0">
        <h1 className="text-white text-xl font-bold">Buffer AI</h1>
        <p className="text-[#4A5568] text-xs mt-0.5">Personalized financial guidance</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={['flex', msg.role === 'user' ? 'justify-end' : 'justify-start'].join(' ')}
          >
            <div className={[
              'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-[#00C9A7] text-[#0F1117] font-medium'
                : 'bg-[#1A1F2E] text-white',
            ].join(' ')}>
              {msg.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="bg-[#1A1F2E] rounded-2xl px-4 py-3">
              <span className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#4A5568] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-6 pt-3 border-t border-[#2A3040] flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask anything about your finances…"
            className="flex-1 bg-[#1A1F2E] text-white text-sm rounded-xl px-4 py-3 border border-[#2A3040] outline-none focus:border-[#00C9A7] focus:ring-2 focus:ring-[#00C9A7]/20 placeholder:text-[#3D4A5C] transition-colors"
          />
          <button
            type="button"
            onClick={handleSend}
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
      </div>
    </div>
  );
}
