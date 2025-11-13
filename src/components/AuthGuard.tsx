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

	/* ------------------------------------------
	    🟦 1. Esperar a que ZUSTAND se hidrate
	------------------------------------------- */
	useEffect(() => {
		const unsub = useAuthStore.persist.onFinishHydration(() =>
			setRehydrated(true)
		);
		if (useAuthStore.persist.hasHydrated()) setRehydrated(true);
		return () => unsub?.();
	}, []);

	useEffect(() => {
		if (!rehydrated) return;

		/* ------------------------------------------
		     🟩 2. RUTAS PÚBLICAS
		------------------------------------------- */
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
			pathname.startsWith("/login") ||
			pathname.startsWith("/register");

		if (publicPaths.includes(pathname)) {
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

		/* --------------------------------------------------------
		    🟦 3. RUTAS ESPECIALES PARA LOGIN CON GOOGLE
		       Permitir render temporal mientras procesan el token
		   ------------------------------------------------------- */

		// USER Google Dashboard
		if (pathname.startsWith("/user/dashboard")) {
			const params = new URLSearchParams(window.location.search);
			if (params.get("token") && params.get("id")) {
				setAllowRender(true);
				return;
			}
		}

		// PROVIDER Google Dashboard
		if (pathname.startsWith("/provider/dashboard")) {
			const params = new URLSearchParams(window.location.search);
			if (params.get("token") && params.get("id")) {
				setAllowRender(true);
				return;
			}
		}

		/* ------------------------------------------
		     🟥 4. RUTA PROTEGIDA SIN AUTENTICACIÓN
		------------------------------------------- */
		if (!isAuthenticated) {
			router.replace("/");
			return;
		}

		/* ------------------------------------------
		     🟨 5. RESTRICCIÓN POR ROL
		------------------------------------------- */
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
			else if (role === "provider")
				router.replace("/provider/dashboard");
			else router.replace("/admin/dashboard");
			return;
		}

		/* ------------------------------------------
		     🟢 6. PERMITIR RENDER
		------------------------------------------- */
		setAllowRender(true);
	}, [rehydrated, isAuthenticated, role, pathname, router]);

	/* ------------------------------------------
	    ⏳ Loading mientras hydration ocurre
	------------------------------------------- */
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
