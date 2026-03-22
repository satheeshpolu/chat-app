import { create } from "zustand";

interface ChatStore {
  currentUser: string | null;
  setCurrentUser: (name: string | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  currentUser: null,
  setCurrentUser: (name) => set({ currentUser: name }),
}));

export const useCurrentUser = () => useChatStore((s) => s.currentUser);
export const useSetCurrentUser = () => useChatStore((s) => s.setCurrentUser);
