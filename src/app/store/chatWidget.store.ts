import { create } from "zustand";

interface ChatWidgetState {
    open: boolean;
    minimized: boolean;
    targetUserId: string | null;

    openWidget: (userId?: string) => void;
    closeWidget: () => void;
    minimizeWidget: () => void;
    clearTarget: () => void;
}

export const useChatWidgetStore = create<ChatWidgetState>((set) => ({
    open: false,
    minimized: false,
    targetUserId: null,

    openWidget: (userId) =>
        set({
            open: true,
            minimized: false,
            targetUserId: userId || null,
        }),

    closeWidget: () =>
        set({
            open: false,
            targetUserId: null,
        }),

    minimizeWidget: () => set({ minimized: true }),

    clearTarget: () => set({ targetUserId: null }),
}));
