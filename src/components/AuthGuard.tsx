"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, role } = useAuthStore();
	const pathname = usePathname();
	const router = useRouter();

	const [rehydrated, setRehydrated] = useState(false);
	const [allowRender, setAllowRender] = useState(false);

	// Esperar la hidratación de Zustand
	useEffect(() => {
		const unsub = useAuthStore.persist.onFinishHydration(() =>
			setRehydrated(true)
		);
		if (useAuthStore.persist.hasHydrated()) setRehydrated(true);
		return () => unsub?.();
	}, []);

	useEffect(() => {
		if (!rehydrated) return;

		// Rutas públicas
		const publicPaths = [
			"/",
			"/contact",
			"/user/services",
			"/loginUser",
			"/loginProvider",
			"/registerUser",
			"/registerProvider",
			"/complete-register-provider",
			"/complete-register-user",
			"/user/dashboard", // ← AGREGA ESTO
			"/provider/dashboard",
			"/payments/success", // ← Y ESTO
		];

		const isSpecialDashboard =
			pathname === "/user/dashboard" ||
			pathname === "/provider/dashboard";

		// 🟦 1) PERMITIR DASHBOARD TEMPORALMENTE
		if (
			isSpecialDashboard &&
			!isAuthenticated &&
			typeof window !== "undefined"
		) {
			setAllowRender(true);
			return;
		}

		// 🟢 2) Permitir rutas públicas
		if (publicPaths.includes(pathname)) {
			const isAuthPage =
				pathname.startsWith("/login") ||
				pathname.startsWith("/register");

			if (isAuthenticated && isAuthPage) {
				if (role === "user") router.replace("/user/services");
				else if (role === "provider")
					router.replace("/provider/dashboard");
				else router.replace("/admin/dashboard");
				return;
			}

			setAllowRender(true);
			return;
		}

		// 🔴 3) Si no está autenticado → mandarlo al home
		if (!isAuthenticated) {
			router.replace("/");
			return;
		}

		// 🚫 4) Rol incorrecto
		if (
			(role === "user" &&
				(pathname.startsWith("/provider") ||
					pathname.startsWith("/admin"))) ||
			(role === "provider" &&
				(pathname.startsWith("/user") ||
					pathname.startsWith("/admin"))) ||
			(role === "admin" &&
				(pathname.startsWith("/user") ||
					pathname.startsWith("/provider")))
		) {
			if (role === "user") router.replace("/user/services");
			else if (role === "provider") router.replace("/provider/dashboard");
			else router.replace("/admin/dashboard");
			return;
		}

		setAllowRender(true);
	}, [rehydrated, isAuthenticated, role, pathname, router]);

	if (!rehydrated || !allowRender) {
		return (
			<div className="h-screen flex flex-col items-center justify-center">
				<div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
				<p className="mt-3 text-sm text-gray-500">Cargando...</p>
			</div>
		);
	}

	return <>{children}</>;
}
