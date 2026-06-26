import { create } from "zustand";
import localforage from "localforage";

export interface ChatMessage {
    text: string;
    sender: "user" | "bot";
    replyTo?: {
        text: string;
        sender: "user" | "bot";
    };
}

localforage.config({ name: "ChatHistoryDBBB" });

const CHAT_HISTORY_KEY = "chatHistoryyy";

// Define the Zustand store state type
interface ChatState {
    messages: ChatMessage[];
    addMessage: (msg: ChatMessage) => Promise<void>;
    updateLastMessage: (text: string) => void;
    persistMessages: () => Promise<void>;
    loadOfflineMessages: () => Promise<void>;
}

// Debounce disk writes during streaming so we don't hit localForage on every token.
let persistTimer: ReturnType<typeof setTimeout> | null = null;
const PERSIST_DEBOUNCE_MS = 400;

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],

    addMessage: async (msg) => {
        set((state) => ({ messages: [...state.messages, msg] }));
        // Persist immediately for discrete actions (not mid-stream), using
        // the store's actual current state rather than a stale disk read.
        await localforage.setItem(CHAT_HISTORY_KEY, get().messages);
    },

    updateLastMessage: (text: string) => {
        set((state) => {
            if (state.messages.length === 0) return state;
            const updated = [...state.messages];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = { ...updated[lastIndex], text };
            return { messages: updated };
        });

        // Debounced persist — fires repeatedly during streaming but only
        // actually writes to disk ~400ms after the last chunk arrives.
        if (persistTimer) clearTimeout(persistTimer);
        persistTimer = setTimeout(() => {
            localforage.setItem(CHAT_HISTORY_KEY, get().messages).catch((err) => {
                console.error("[ChatStore] Failed to persist streamed message:", err);
            });
        }, PERSIST_DEBOUNCE_MS);
    },

    // Exposed so callers (e.g. StiyaBot after a stream finishes) can force
    // an immediate flush instead of waiting for the debounce window.
    persistMessages: async () => {
        if (persistTimer) {
            clearTimeout(persistTimer);
            persistTimer = null;
        }
        await localforage.setItem(CHAT_HISTORY_KEY, get().messages);
    },

    loadOfflineMessages: async () => {
        const savedMessages = (await localforage.getItem<ChatMessage[]>(CHAT_HISTORY_KEY)) || [];
        set({ messages: savedMessages });
    },
}));