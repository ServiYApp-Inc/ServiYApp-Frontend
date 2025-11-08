"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
	id: string; // usa string para coincidir con tus IDs de servicios
	name: string;
	price: number;
	image?: string;
	quantity: number;
	addressId: string;
}

interface CartState {
	items: CartItem[];
	addToCart: (item: CartItem) => void;
	removeFromCart: (id: string) => void;
	clearCart: () => void;
	getTotal: () => number;
}

export const useCartStore = create<CartState>()(
	persist(
		(set, get) => ({
			items: [],

			addToCart: (item) =>
				set((state) => {
					const existingItem = state.items.find(
						(i) => i.id === item.id
					);
					if (existingItem) {
						return {
							items: state.items.map((i) =>
								i.id === item.id
									? {
											...i,
											quantity:
												i.quantity + item.quantity,
									  }
									: i
							),
						};
					}
					return { items: [...state.items, item] };
				}),

			removeFromCart: (id) =>
				set((state) => ({
					items: state.items.filter((i) => i.id !== id),
				})),

			clearCart: () => set({ items: [] }),

			getTotal: () =>
				get().items.reduce(
					(acc, item) => acc + item.price * item.quantity,
					0
				),
		}),
		{
			name: "serviyapp-cart", // 🧠 clave única en localStorage
		}
	)
);
