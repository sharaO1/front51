import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
};

type ChatState = {
  messages: ChatMessage[];
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
      partialize: (state) => ({ messages: state.messages }),
    },
  ),
);
