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
	const [checking, setChecking] = useState(true);

	useEffect(() => {
		const unsub = useAuthStore.persist.onFinishHydration(() => {
			setRehydrated(true);
		});
		if (useAuthStore.persist.hasHydrated()) {
			setRehydrated(true);
		}
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

		// 🚫 No autenticado → alerta + redirect sólo si confirma
		if (!isAuthenticated && !isPublic) {
			// Si justo venimos de logout, evita mostrar alertas
			if (!isAuthenticated && pathname === "/") {
				setChecking(false);
				return;
			}
			MySwal.fire({
				title: "Inicia sesión",
				text: "Debes iniciar sesión para acceder a esta sección.",
				icon: "info",
				confirmButtonText: "Entendido",
				confirmButtonColor: "#1D2846",
				width: 340,
				background: "#fff",
				color: "#1D2846",
				allowOutsideClick: true,
				allowEscapeKey: true,
				showClass: { popup: "animate__animated animate__fadeInDown" },
				hideClass: { popup: "animate__animated animate__fadeOutUp" },
			}).then((result) => {
				if (result.isConfirmed) {
					// 🧠 Guardar la ruta actual completa (path + query)
					const fullPath =
						window.location.pathname + window.location.search;
					localStorage.setItem("redirectAfterLogin", fullPath);

					router.replace(loginPath);
				}
			});
			return;
		}

		// 🔒 Rol incorrecto → alerta + redirect sólo si confirma
		if (isAuthenticated) {
			if (
				(pathname.startsWith("/admin") && role !== "admin") ||
				(pathname.startsWith("/provider") && role !== "provider") ||
				(pathname.startsWith("/user") &&
					!pathname.startsWith("/user/services") &&
					role !== "user")
			) {
				MySwal.fire({
					title: "Acceso denegado",
					text: "No tienes permiso para entrar a esta sección.",
					icon: "warning",
					confirmButtonText: "Entendido",
					confirmButtonColor: "#1D2846",
					width: 340,
					background: "#fff",
					color: "#1D2846",
					allowOutsideClick: true,
					allowEscapeKey: true,
					showClass: {
						popup: "animate__animated animate__fadeInDown",
					},
					hideClass: {
						popup: "animate__animated animate__fadeOutUp",
					},
				}).then((result) => {
					if (result.isConfirmed) router.replace("/unauthorized");
				});
				return;
			}
		}

		setChecking(false);
	}, [rehydrated, isAuthenticated, role, pathname, router]);

	if (!rehydrated || checking) {
		return (
			<div className="h-screen flex flex-col items-center justify-center">
				<div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
				<p className="mt-3 text-sm text-gray-500">Cargando...</p>
			</div>
		);
	}

	return <>{children}</>;
}
