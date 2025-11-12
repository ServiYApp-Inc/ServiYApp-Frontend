"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
	id: string; // ID del servicio
	name: string;
	price: number;
	image?: string;
	addressId: string;
	providerId: string;
}

interface CartState {
	item: CartItem | null;
	addToCart: (item: CartItem) => void;
	removeFromCart: () => void;
	clearCart: () => void;
	getTotal: () => number;
	isInCart: (id: string) => boolean;
}

export const useCartStore = create<CartState>()(
	persist(
		(set, get) => ({
			item: null,

			// 🛒 Agregar un solo servicio al carrito
			addToCart: (item) => set({ item }),

			// ❌ Quitar el servicio actual
			removeFromCart: () => set({ item: null }),

			// 🧹 Vaciar carrito (y limpiar persistencia)
			clearCart: () => {
				set({ item: null });
				localStorage.removeItem("serviyapp-cart");
			},

			// 💰 Total del carrito
			getTotal: () => get().item?.price || 0,

			// ✅ Verifica si ya está agregado
			isInCart: (id) => get().item?.id === id,
		}),
		{
			name: "serviyapp-cart", // 🧠 persistencia en localStorage
		}
	)
);
