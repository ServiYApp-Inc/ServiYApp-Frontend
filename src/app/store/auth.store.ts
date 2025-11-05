"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "admin" | "provider" | "user";
export interface User {
	id: string;
	email: string;
	names?: string;
	surnames?: string;
	profilePicture?: string;
}

export interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
	image?: string;
}

interface AuthState {
	token: string | null;
	role: Role | null;
	user: User | null;
	isAuthenticated: boolean;
	setAuth: (data: { token: string; role: Role; user: User }) => void;
	clearAuth: () => void;

	// 🛒 ---- Estado y acciones del carrito ----
	cart: CartItem[];
	addToCart: (item: CartItem) => void;
	removeFromCart: (id: string) => void;
	clearCart: () => void;
	getTotal: () => number;
	// 🛒 ---------------------------------------
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			token: null,
			role: null,
			user: null,
			isAuthenticated: false,

			setAuth: (data) =>
				set({
					token: data.token,
					role: data.role,
					user: data.user,
					isAuthenticated: true,
				}),

			clearAuth: () =>
				set({
					token: null,
					role: null,
					user: null,
					isAuthenticated: false,
				}),

			// 🛒 ---- Lógica del carrito ----
			cart: [],

			addToCart: (item) => {
				const existing = get().cart.find((i) => i.id === item.id);
				if (existing) {
					set({
						cart: get().cart.map((i) =>
							i.id === item.id
								? { ...i, quantity: i.quantity + item.quantity }
								: i
						),
					});
				} else {
					set({ cart: [...get().cart, item] });
				}
			},

			removeFromCart: (id) =>
				set({ cart: get().cart.filter((item) => item.id !== id) }),

			clearCart: () => set({ cart: [] }),

			getTotal: () =>
				get().cart.reduce(
					(total, item) => total + item.price * item.quantity,
					0
				),
			// 🛒 -----------------------------
		}),
		{
			name: "serviyapp-auth", // clave única en localStorage
		}
	)
);
