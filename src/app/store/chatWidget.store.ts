import { create } from "zustand";

interface ChatWidgetState {
	open: boolean;
	minimized: boolean;
	targetUserId: string | null;

	// funciones originales
	openWidget: (userId?: string) => void;
	closeWidget: () => void;
	minimizeWidget: () => void;
	clearTarget: () => void;

	// 🟣 nuevas funciones
	resetActiveChat: () => void;
	refreshInbox: () => void;
	setRefreshInbox: (fn: () => void) => void;
}

export const useChatWidgetStore = create<ChatWidgetState>((set) => ({
	open: false,
	minimized: false,
	targetUserId: null,

	// ---------------------------
	// FUNCIONES ORIGINALES
	// ---------------------------
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

	// ---------------------------
	// 🟣 NUEVAS FUNCIONES
	// ---------------------------

	// Permite cerrar el chat activo desde el exterior (UserAppointmentsPage)
	resetActiveChat: () => {
		// No tocamos activeChat aquí porque ChatWidget mantiene su propio state.
		// Solo provocamos el "cierre" al quitar el targetUserId.
		set({ targetUserId: null });
	},

	// función placeholder, la definirá el widget
	refreshInbox: () => {},

	// ChatWidget podrá registrar su función real aquí
	setRefreshInbox: (fn) => set({ refreshInbox: fn }),
}));
