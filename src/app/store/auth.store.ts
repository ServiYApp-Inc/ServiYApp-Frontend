"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import IUser from "../interfaces/IUser";
import IProvider from "../interfaces/IProvider";

export type Role = "admin" | "provider" | "user";

interface AuthState {
	token: string | null;
	role: Role | null;
	user: IProvider | IUser | null;
	isAuthenticated: boolean;
	setAuth: (data: { token: string; role: Role; user: IUser }) => void;
	clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
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

			clearAuth: () => {
				set({
					token: null,
					role: null,
					user: null,
					isAuthenticated: false,
				});

				localStorage.removeItem("serviyapp-auth");
				localStorage.removeItem("access_token");
				localStorage.removeItem("serviyapp-cart");
			},
		}),
		{
			name: "serviyapp-auth",
		}
	)
);
