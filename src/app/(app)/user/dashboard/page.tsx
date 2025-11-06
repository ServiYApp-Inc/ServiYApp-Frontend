"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Api } from "@/app/services/api";
import { useAuthStore } from "@/app/store/auth.store";
import { toast } from "react-toastify";

export default function UserDashboard() {
	const router = useRouter();
	const setAuth = useAuthStore((s) => s.setAuth);
	const { user, isAuthenticated } = useAuthStore();
	const [loading, setLoading] = useState(true);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);

		// 🔹 Aquí sí podemos usar window sin romper el build
		const params = new URLSearchParams(window.location.search);
		const token = params.get("token");
		const id = params.get("id");
		const role = params.get("role");

		(async () => {
			try {
				// 🟢 Si viene del login con Google
				if (token && id) {
					localStorage.setItem("access_token", token);

					const { data } = await Api.get(`/users/${id}`, {
						headers: { Authorization: `Bearer ${token}` },
					});

					setAuth({
						token,
						role: (role || data.role) as any,
						user: data,
					});

					toast.success(`Bienvenida, ${data.names}!`);

					// 🧹 Limpia la URL
					const cleanUrl = window.location.pathname;
					window.history.replaceState({}, "", cleanUrl);
				} else {
					// 🟠 Si no hay sesión persistida, redirige
					const storedToken = localStorage.getItem("access_token");
					if (!storedToken && !isAuthenticated) {
						router.push("/loginUser");
						return;
					}
				}
			} catch (err) {
				console.error("Error cargando usuario:", err);
				toast.error("Error cargando tu perfil.");
				router.push("/loginUser");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	if (!isClient || loading)
		return (
			<div className="flex justify-center items-center h-screen text-gray-500">
				Cargando tu cuenta...
			</div>
		);

	return (
		<main className="flex flex-col justify-start bg--background overflow-x-hidden overflow-y-hidden min-h-screen px-2 pb-20 md:pb-4 max-w-[1300px] mx-auto">
			<h1 className="font-bold text-[var(--color-primary)] text-[48px] mt-10 text-center md:text-left">
				Bienvenida {user?.names || ""} 💅
			</h1>

			<div className="w-full bg-[var(--color-primary)] rounded-2xl py-4 mt-6 flex flex-col items-start">
				<h4 className="mx-4 text-white text-[36px] font-semiBold text-center md:text-left">
					Este es tu panel personal
				</h4>
				<span className="mx-4 text-[20px] font-medium text-white text-center md:text-left">
					Aquí podrás ver tus citas, historial y más
				</span>
			</div>

			<section className="mt-8">
				<p className="text-gray-600 text-lg">
					📅 Próximamente verás aquí tu resumen de actividad, tus
					reservas y servicios favoritos.
				</p>
			</section>
		</main>
	);
}
