"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileItem from "@/app/components/ProfileItem";
import { Api } from "@/app/services/api";
import { toast } from "react-toastify";
import { useAuthStore } from "@/app/store/auth.store";

/*-- iconos --*/
import {
	faBookOpen,
	faCalendarPlus,
	faChartLine,
	faGear,
	faScissors,
	faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";

export default function ProviderDashboard() {
	const router = useRouter();
	const { user, token, setAuth } = useAuthStore();
	const [provider, setProvider] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchProvider = async () => {
			try {
				const params = new URLSearchParams(window.location.search);
				const tokenParam = params.get("token");
				const idParam = params.get("id");

				let accessToken =
					tokenParam ||
					token ||
					localStorage.getItem("access_token") ||
					null;

				let providerId =
					idParam ||
					user?.id ||
					localStorage.getItem("provider_id") ||
					null;

				if (!accessToken || !providerId) {
					toast.error("Inicia sesión para acceder a tu cuenta.");
					return router.push("/loginProvider");
				}

				if (tokenParam && idParam) {
					localStorage.setItem("access_token", tokenParam);
					localStorage.setItem("provider_id", idParam);
				}

				if (user && token) {
					setProvider(user);
					setLoading(false);
					return;
				}

				const { data } = await Api.get(`/providers/${providerId}`, {
					headers: { Authorization: `Bearer ${accessToken}` },
				});

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
	}, [router, setAuth, token, user]);

	if (loading)
		return (
			<div className="flex justify-center items-center h-screen text-gray-500">
				Cargando tu panel...
			</div>
		);

	/* ---------------- MOCK DATA (BORRAR AL CONECTAR BACK) ---------------- */
	const upcomingAppointments = [
		{
			id: 1,
			date: "2025-11-05T15:00:00",
			user: { names: "María López" },
			service: { name: "Peinado de novia" },
			status: "Confirmado",
		},
		{
			id: 2,
			date: "2025-11-06T10:30:00",
			user: { names: "Fernanda Juárez" },
			service: { name: "Manicure semipermanente" },
			status: "Pendiente",
		},
	];

	const mockReviews = [
		{
			id: 1,
			user: { names: "Claudia Gómez" },
			rating: 5,
			comment: "Excelente atención, puntual y amable.",
		},
		{
			id: 2,
			user: { names: "Daniela Ruiz" },
			rating: 4,
			comment: "Muy buena experiencia, el maquillaje me encantó.",
		},
	];

	const kpis = [
		{ label: "Promedio de calificación", value: "4.8" },
		{ label: "Servicios completados", value: "36" },
		{ label: "Ganancias del mes", value: "$12,400" },
		{ label: "Clientes nuevos", value: "5" },
	];

	/* ------------------------------------------------------------------- */

	return (
		<main className="max-w-5xl mt-8 mx-auto mb-20">
			{/* Encabezado */}
			<h1 className="text-[48px] font-bold text-[var(--color-primary)] mb-2">
				¡Hola, {provider?.names?.split(" ")[0] || "Proveedor"}!
			</h1>
			<p className="text-[20px] text-gray-600 mb-8">
				Este es tu panel, aquí puedes administrar tus servicios, turnos
				y ver tu rendimiento.
			</p>

			{/* Resumen principal */}
			<div className="bg-[var(--color-primary)] p-6 rounded-3xl text-white flex flex-col gap-8">
				<div className="flex flex-col md:flex-row items-center gap-6">
					<img
						src={provider?.photo || "/default-avatar.png"}
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
			</div>

			{/* KPIs */}
			<section className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
				{kpis.map((kpi, i) => (
					<div
						key={i}
						className="bg-white p-4 rounded-2xl border shadow-sm text-center"
					>
						<p className="text-3xl font-bold text-[var(--color-primary)]">
							{kpi.value}
						</p>
						<p className="text-sm text-gray-600">{kpi.label}</p>
					</div>
				))}
			</section>

			{/* Próximos turnos */}
			<section className="mt-10">
				<h2 className="text-2xl font-semibold mb-4 text-[var(--color-primary)]">
					Próximos turnos
				</h2>
				<ul className="space-y-3">
					{upcomingAppointments.map((appt) => (
						<li
							key={appt.id}
							className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center"
						>
							<div>
								<p className="font-medium text-lg">
									{appt.service.name}
								</p>
								<p className="text-sm text-gray-500">
									{new Date(appt.date).toLocaleDateString(
										"es-MX",
										{
											weekday: "long",
											day: "numeric",
											month: "long",
											hour: "2-digit",
											minute: "2-digit",
										}
									)}{" "}
									— {appt.user.names}
								</p>
							</div>
							<span
								className={`px-3 py-1 text-sm rounded-full ${
									appt.status === "Confirmado"
										? "bg-green-100 text-green-700"
										: "bg-yellow-100 text-yellow-700"
								}`}
							>
								{appt.status}
							</span>
						</li>
					))}
				</ul>
			</section>

			{/* Servicios */}
			<section className="mt-10">
				<h2 className="text-2xl font-semibold mb-4 text-[var(--color-primary)]">
					Mis servicios
				</h2>
				<div className="grid md:grid-cols-2 gap-4">
					{provider?.services?.length ? (
						provider.services.map((s: any) => (
							<div
								key={s.id}
								className="p-4 bg-white border rounded-2xl shadow-sm flex justify-between items-center"
							>
								<div>
									<p className="font-semibold text-lg">
										{s.name}
									</p>
									<p className="text-sm text-gray-500">
										{s.duration} min • ${s.price} MXN
									</p>
								</div>
								<span
									className={`text-sm font-medium px-3 py-1 rounded-full ${
										s.active
											? "bg-green-100 text-green-700"
											: "bg-gray-200 text-gray-600"
									}`}
								>
									{s.active ? "Activo" : "Pausado"}
								</span>
							</div>
						))
					) : (
						<p className="text-gray-500 text-sm">
							Aún no has registrado servicios.
						</p>
					)}
				</div>
			</section>

			{/* Reseñas */}
			<section className="mt-10">
				<h2 className="text-2xl font-semibold mb-4 text-[var(--color-primary)]">
					Reseñas recientes
				</h2>
				<div className="space-y-3">
					{mockReviews.map((r) => (
						<div
							key={r.id}
							className="bg-white p-4 rounded-xl border shadow-sm"
						>
							<div className="flex justify-between items-center mb-2">
								<p className="font-medium">{r.user.names}</p>
								<span className="text-yellow-500">
									⭐ {r.rating}
								</span>
							</div>
							<p className="text-gray-600 text-sm">{r.comment}</p>
						</div>
					))}
				</div>
			</section>

			{/* Atajos rápidos */}
			<div className="flex flex-wrap gap-3 mt-10">
				<button className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg font-medium hover:opacity-90">
					+ Nuevo servicio
				</button>
				<button className="border border-[var(--color-primary)] text-[var(--color-primary)] px-5 py-2 rounded-lg font-medium hover:bg-[var(--color-bg-light)]">
					Ver agenda completa
				</button>
				<button className="border border-[var(--color-primary)] text-[var(--color-primary)] px-5 py-2 rounded-lg font-medium hover:bg-[var(--color-bg-light)]">
					Configurar perfil
				</button>
			</div>
		</main>
	);
}
