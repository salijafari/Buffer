import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ChatMessage, ProactiveCard } from '@buffer/api';

interface AiState {
  messages:       ChatMessage[];
  proactiveCards: ProactiveCard[];
  threadId:       string | null;
  isThinking:     boolean;
  lastUpdated:    number | null;
  addMessage:     (msg: ChatMessage) => void;
  setThinking:    (v: boolean) => void;
  setThreadId:    (id: string) => void;
  setProactiveCards:(cards: ProactiveCard[]) => void;
  addProactiveCard: (card: ProactiveCard) => void;
  dismissCard:    (id: string) => void;
  markUpdated:    () => void;
}

export const useAiStore = create<AiState>()(
  immer((set) => ({
    messages:       [],
    proactiveCards: [],
    threadId:       null,
    isThinking:     false,
    lastUpdated:    null,

    addMessage:       (msg)   => set((s) => { s.messages.push(msg); }),
    setThinking:      (v)     => set((s) => { s.isThinking = v; }),
    setThreadId:      (id)    => set((s) => { s.threadId = id; }),
    setProactiveCards:(cards) => set((s) => { s.proactiveCards = cards; }),
    addProactiveCard: (card)  => set((s) => { s.proactiveCards.unshift(card); }),
    dismissCard:      (id)    => set((s) => {
      s.proactiveCards = s.proactiveCards.filter(c => c.id !== id);
    }),
    markUpdated:      ()      => set((s) => { s.lastUpdated = Date.now(); }),
  })),
);
