import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
};

type ChatState = {
  messages: ChatMessage[];
  hydrated: boolean;
  setMessages: (
    updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[]),
  ) => void;
  replaceMessages: (messages: ChatMessage[]) => void;
  clear: () => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      hydrated: false,
      setMessages: (updater) =>
        set((state) => ({
          messages:
            typeof updater === "function"
              ? (updater as (prev: ChatMessage[]) => ChatMessage[])(
                  state.messages,
                )
              : updater,
        })),
      replaceMessages: (messages) => set({ messages }),
      clear: () => set({ messages: [] }),
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({ messages: state.messages, hydrated: state.hydrated }),
      onRehydrateStorage: () => {
        return () => {
          // mark as hydrated after rehydration completes
          useChatStore.setState({ hydrated: true });
        };
      },
    },
  ),
);
