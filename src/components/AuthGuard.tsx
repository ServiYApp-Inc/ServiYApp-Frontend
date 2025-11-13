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

	// Espera a que Zustand cargue el estado persistido
	useEffect(() => {
		const unsub = useAuthStore.persist.onFinishHydration(() =>
			setRehydrated(true)
		);
		if (useAuthStore.persist.hasHydrated()) setRehydrated(true);
		return () => unsub?.();
	}, []);

	useEffect(() => {
		if (!rehydrated) return;

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
		];

		const isAuthPage =
			pathname.startsWith("/login") || pathname.startsWith("/register");

		// 🟢 Libre si no requiere autenticación
		if (publicPaths.includes(pathname)) {
			// 🚫 Si ya está logueado → redirigir a su dashboard
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

		// 🔴 No autenticado → redirigir al home
		if (!isAuthenticated) {
			router.replace("/");
			return;
		}

		// 🚫 Rol incorrecto → redirigir a su dashboard
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
