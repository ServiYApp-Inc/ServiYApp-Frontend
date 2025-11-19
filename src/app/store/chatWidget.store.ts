import { create } from "zustand";

interface ChatWidgetState {
	open: boolean;
	minimized: boolean;
	targetUserId: string | null;

	openWidget: (userId?: string) => void;
	closeWidget: () => void;
	minimizeWidget: () => void;
	clearTarget: () => void;

	// 🟣 nuevas funciones globales
	refreshInbox: () => void;
	setRefreshInbox: (fn: () => void) => void;
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

	// --------------------------------
	// NUEVAS FUNCIONES
	// --------------------------------
	refreshInbox: () => {},

	setRefreshInbox: (fn) =>
		set({
			refreshInbox: fn,
		}),
}));
