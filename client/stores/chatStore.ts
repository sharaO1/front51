import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";

export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
};

type MessagesByUser = Record<string, ChatMessage[]>;

function currentUserId(fallback: string = "anon"): string {
  try {
    return useAuthStore.getState().user?.id || fallback;
  } catch {
    return fallback;
  }
}

type ChatState = {
  messagesByUser: MessagesByUser;
  hydrated: boolean;
  getMessages: (userId?: string | null) => ChatMessage[];
  setMessages: (
    updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[]),
    userId?: string | null,
  ) => void;
  replaceMessages: (messages: ChatMessage[], userId?: string | null) => void;
  clear: (userId?: string | null) => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messagesByUser: {},
      hydrated: false,

      getMessages: (userId) => {
        const uid = userId || currentUserId();
        return get().messagesByUser[uid] || [];
        },

      setMessages: (updater, userId) =>
        set((state) => {
          const uid = userId || currentUserId();
          const prev = state.messagesByUser[uid] || [];
          const next =
            typeof updater === "function"
              ? (updater as (prev: ChatMessage[]) => ChatMessage[])(prev)
              : updater;
          return {
            messagesByUser: { ...state.messagesByUser, [uid]: next },
          };
        }),

      replaceMessages: (messages, userId) =>
        set((state) => {
          const uid = userId || currentUserId();
          return { messagesByUser: { ...state.messagesByUser, [uid]: messages } };
        }),

      clear: (userId) =>
        set((state) => {
          const uid = userId || currentUserId();
          const copy = { ...state.messagesByUser };
          delete copy[uid];
          return { messagesByUser: copy };
        }),
    }),
    {
      name: "chat-storage-v2",
      partialize: (state) => ({ messagesByUser: state.messagesByUser }),
      onRehydrateStorage: () => {
        return () => {
          useChatStore.setState({ hydrated: true });
        };
      },
    },
  ),
);
