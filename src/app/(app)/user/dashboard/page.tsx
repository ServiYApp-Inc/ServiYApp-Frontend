"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Api } from "@/app/services/api";
import { useAuthStore } from "@/app/store/auth.store";
import { toast } from "react-toastify";
import Link from "next/link";

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
			Bienvenida/o {user?.names || ""}
		</h1>

		<div className="relative w-full rounded-2xl overflow-hidden shadow-lg mt-10">
			{/* Imagen de fondo */}
			<img
				src="https://www.gammabross.com/Gallery/salonimg-frkqkj-181.webp"
				alt="Salón de belleza festivo"
				className="w-full h-[350px] object-cover brightness-75"
			/>

			{/* Pie de foto con mensaje */}
			<div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 bg-black/40">
				<h3 className="text-3xl bg-white/10 rounded-xl md:text-4xl font-bold mb-3 drop-shadow-lg">
				¡Se acercan las Fiestas!
				</h3>
				<p className="text-lg bg-white/10 rounded-xl md:text-xl font-medium max-w-[700px] mb-4">
				Regalá momentos únicos a tus seres queridos con servicios de belleza.  
				Una cita, un cambio, una sonrisa — el mejor regalo sos vos.
				</p>
				<button onClick={() => {router.push(`/user/services`)}} className="bg-[var(--color-primary)] text-white font-semibold px-6 py-2 rounded-lg hover:bg-white hover:text-[var(--color-primary)] transition-all">
					Descubrí servicios para regalar
				</button>
			</div>
		</div>
	</main>
);

}
