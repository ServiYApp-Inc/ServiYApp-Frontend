"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function AuthGuard({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, role } = useAuthStore();
	const pathname = usePathname();
	const router = useRouter();

	const [rehydrated, setRehydrated] = useState(false);
	const [allowRender, setAllowRender] = useState(false);

	// 🧠 Esperar a que Zustand cargue localStorage
	useEffect(() => {
		const unsub = useAuthStore.persist.onFinishHydration(() => {
			setRehydrated(true);
		});
		if (useAuthStore.persist.hasHydrated()) setRehydrated(true);
		return () => unsub?.();
	}, []);

	useEffect(() => {
		if (!rehydrated) return;

		const publicPaths = [
			"/",
			"/loginUser",
			"/loginProvider",
			"/registerUser",
			"/registerProvider",
			"/contact",
			"/user/services",
		];

		const isPublic = publicPaths.includes(pathname);
		let loginPath = "/loginUser";
		if (pathname.startsWith("/provider")) loginPath = "/loginProvider";
		if (pathname.startsWith("/admin")) loginPath = "/loginUser";

		// ⚡ Home sin login → libre
		if (!isAuthenticated && pathname === "/") {
			setAllowRender(true);
			return;
		}

		// 🚷 Ya autenticado → impedir acceso a login o registro
		if (
			isAuthenticated &&
			(pathname === "/loginUser" ||
				pathname === "/loginProvider" ||
				pathname === "/registerUser" ||
				pathname === "/registerProvider")
		) {
			MySwal.fire({
				title: "Ya iniciaste sesión",
				text: "No puedes acceder al inicio o registro mientras tu sesión está activa.",
				icon: "info",
				confirmButtonText: "Ir a mi panel",
				confirmButtonColor: "#1D2846",
				width: 340,
				background: "#fff",
				color: "#1D2846",
			}).then(() => {
				if (role === "provider") router.replace("/provider/dashboard");
				else if (role === "admin") router.replace("/admin/dashboard");
				else router.replace("/user/services");
			});
			setAllowRender(false);
			return;
		}

		// 🚫 No autenticado → alerta + redirect al login correspondiente
		if (!isAuthenticated && !isPublic) {
			MySwal.fire({
				title: "Inicia sesión",
				text: "Debes iniciar sesión para acceder a esta sección.",
				icon: "info",
				confirmButtonText: "Entendido",
				confirmButtonColor: "#1D2846",
				width: 340,
				background: "#fff",
				color: "#1D2846",
			}).then((result) => {
				if (result.isConfirmed) {
					const fullPath =
						window.location.pathname + window.location.search;
					localStorage.setItem("redirectAfterLogin", fullPath);
					router.replace(loginPath);
				}
			});
			setAllowRender(false);
			return;
		}

		// 🔒 Rol incorrecto → mostrar alerta y bloquear renderizado
		if (isAuthenticated) {
			const isWrongRole =
				(pathname.startsWith("/admin") && role !== "admin") ||
				(pathname.startsWith("/provider") && role !== "provider") ||
				(pathname.startsWith("/user") &&
					!pathname.startsWith("/user/services") &&
					role !== "user");

			if (isWrongRole) {
				MySwal.fire({
					title: "Acceso denegado",
					text: "No tienes permiso para entrar a esta sección.",
					icon: "warning",
					confirmButtonText: "Regresar",
					confirmButtonColor: "#1D2846",
					width: 340,
					background: "#fff",
					color: "#1D2846",
				}).then(() => {
					if (role === "provider")
						router.replace("/provider/dashboard");
					else if (role === "admin")
						router.replace("/admin/dashboard");
					else router.replace("/user/services");
				});
				setAllowRender(false);
				return;
			}
		}

		// ✅ Si pasa todos los filtros
		setAllowRender(true);
	}, [rehydrated, isAuthenticated, role, pathname, router]);

	// 🌀 Mientras verifica
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
