"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileItem from "@/app/components/ProfileItem";
import { Api } from "@/app/services/api";
import { toast } from "react-toastify";
import { useAuthStore } from "@/app/store/auth.store";

/*-- iconos --*/
import {
	faBell,
	faBookOpen,
	faCalendarPlus,
	faChartLine,
	faGear,
	faScissors,
	faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";

export default function ProviderDashboard() {
	const router = useRouter();
	const setAuth = useAuthStore((s) => s.setAuth);
	const { user } = useAuthStore();
	const [provider, setProvider] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get("token");
		const id = params.get("id");

		if (token) localStorage.setItem("access_token", token);
		if (id) localStorage.setItem("provider_id", id);

		const fetchProvider = async () => {
			try {
				const providerId =
					id || localStorage.getItem("provider_id") || null;
				const accessToken =
					token || localStorage.getItem("access_token") || null;

				if (!providerId || !accessToken) {
					toast.error("Inicia sesión para acceder a tu cuenta.");
					return router.push("/loginProvider");
				}

				const { data } = await Api.get(`/providers/${providerId}`, {
					headers: { Authorization: `Bearer ${accessToken}` },
				});

				// Guarda en Zustand
				setAuth({
					token: accessToken,
					role: "provider",
					user: data,
				});

				setProvider(data);
			} catch (error) {
				console.error("Error al cargar proveedor:", error);
				toast.error("No se pudo cargar tu perfil.");
				router.push("/loginProvider");
			} finally {
				setLoading(false);
			}
		};

		fetchProvider();
	}, []);

	if (loading)
		return (
			<div className="flex justify-center items-center h-screen text-gray-500">
				Cargando tu panel...
			</div>
		);

	return (
		<main className="max-w-4xl mt-8 mx-auto">
			<h1 className="text-[48px] font-bold text-[var(--color-primary)] mb-6">
				Dashboard <strong>Proveedor</strong>
			</h1>

			{/* Contenedor Información del PROVEEDOR */}
			<div className="bg-[var(--color-primary)] p-6 rounded-3xl text-white flex flex-col gap-8">
				<div className="flex flex-col md:flex-row items-center gap-6">
					<img
						src={
							provider?.photo 
						}
						alt="Provider profilePicture"
						className="w-[130px] h-[130px] rounded-full border-2 border-white object-cover"
					/>
					<div>
						<h3 className="font-bold text-[36px] capitalize">
							{provider?.names || "Proveedor"}{" "}
							{provider?.surnames || ""}
						</h3>
						<h5 className="font-medium text-[22px]">
							{provider?.email}
						</h5>
					</div>
				</div>

				{/* Estadísticas rápidas */}
				<span className="flex flex-col md:flex-row justify-around">
					<div className="flex flex-col items-center gap-1">
						<p className="text-[36px] font-regular">
							{provider?.services?.length || 0}
						</p>
						<h5 className="text-[24px] font-regular">
							Servicios Activos
						</h5>
					</div>
					<div className="flex flex-col items-center gap-1">
						<p className="text-[36px] font-regular">
							{provider?.appointments?.length || 0}
						</p>
						<h5 className="text-[24px] font-regular">
							Turnos Reservados
						</h5>
					</div>
					<div className="flex flex-col items-center gap-1">
						<p className="text-[36px] font-regular">
							{provider?.reviews?.length || 0}
						</p>
						<h5 className="text-[24px] font-regular">Reseñas</h5>
					</div>
				</span>
			</div>

			{/* Contenedor de Opciones */}
			<div className="flex flex-col lg:flex-row justify-around gap-4 mt-8 w-full">
				{/* Columna izquierda */}
				<div className="flex flex-col gap-6 bg-white w-full p-6 rounded-3xl text-[var(--color-primary)] border border-[#949492]">
					<ProfileItem
						icon={faCalendarPlus}
						label="Administrador de Turnos"
					/>
					<ProfileItem icon={faScissors} label="Mis Servicios" />
					<ProfileItem
						icon={faBookOpen}
						label="Reseñas de Clientes"
					/>
				</div>

				{/* Columna derecha */}
				<div className="flex flex-col gap-6 bg-white w-full p-6 rounded-3xl text-[var(--color-primary)] border border-[#949492]">
					<ProfileItem icon={faChartLine} label="Estadísticas" />
					<ProfileItem
						icon={faMoneyBillWave}
						label="Historial de Pagos"
					/>
					<ProfileItem
						icon={faGear}
						label="Configuración de Perfil"
					/>
				</div>
			</div>

			
		</main>
	);
}
