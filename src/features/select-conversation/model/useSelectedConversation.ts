import { create } from "zustand";

interface SelectedConversationState {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

export const useSelectedConversation = create<SelectedConversationState>(
  (set) => ({
    selectedId: null,
    setSelectedId: (id) => set({ selectedId: id }),
  })
);

