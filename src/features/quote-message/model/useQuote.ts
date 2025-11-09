"use client";

import { create } from "zustand";
import type { Message } from "@/entities/message";

interface QuoteStore {
  quotedMessage: Message | null;
  setQuotedMessage: (message: Message | null) => void;
  clearQuote: () => void;
}

export const useQuote = create<QuoteStore>((set) => ({
  quotedMessage: null,
  setQuotedMessage: (message) => set({ quotedMessage: message }),
  clearQuote: () => set({ quotedMessage: null }),
}));

