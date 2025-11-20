"use client";

import { useEffect, useState } from "react";
import { Api } from "@/app/services/api";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Link from "next/link";

import {
	faCalendar,
	faCheckCircle,
	faMoneyBill,
	faStar,
	faUser,
	faScissors,
	faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const fadeUp = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
};

interface ServiceOrder {
	id: string;
	status: string;
	createdAt: string;

	user: {
		names: string;
		surnames: string;
		profilePicture?: string;
	};

	service: {
		name: string;
		photos?: string[];
		price?: number;
	};

	payments: {
		amount: string;
		status: string;
	}[];
}

export default function ProviderDashboard() {
	const router = useRouter();
	const { user, token, setAuth } = useAuthStore();

	const [loading, setLoading] = useState(true);
	const [isClient, setIsClient] = useState(false);

	const [orders, setOrders] = useState<ServiceOrder[]>([]);

	/* -----------------------------------------------------
	   🚀 LOGIN CON GOOGLE + SESIÓN (SIN LOOP)
	------------------------------------------------------- */
	useEffect(() => {
		setIsClient(true);

		const authenticate = async () => {
			const params = new URLSearchParams(window.location.search);
			const tokenParam = params.get("token");
			const idParam = params.get("id");

			try {
				// 🔵 Google login
				if (tokenParam && idParam) {
					localStorage.setItem("access_token", tokenParam);
					localStorage.setItem("provider_id", idParam);

					const { data } = await Api.get(`/providers/${idParam}`, {
						headers: { Authorization: `Bearer ${tokenParam}` },
					});

					setAuth({
						token: tokenParam,
						role: "provider",
						user: data,
					});

					toast.success(`Bienvenida, ${data.names}!`);

					window.history.replaceState(
						{},
						"",
						window.location.pathname
					);
					setLoading(false);
					return;
				}

				// 🟣 Sesión persistida
				const storedToken = localStorage.getItem("access_token");
				const storedId = localStorage.getItem("provider_id");

				if (!storedToken || !storedId) {
					if (user === null) router.push("/loginProvider");
					return;
				}

				// Si no está cargado en Zustand
				if (!user) {
					const { data } = await Api.get(`/providers/${storedId}`, {
						headers: { Authorization: `Bearer ${storedToken}` },
					});

					setAuth({
						token: storedToken,
						role: "provider",
						user: data,
					});
				}
			} catch (err) {
				console.error("Auth error:", err);
				router.push("/loginProvider");
			} finally {
				setLoading(false);
			}
		};

		authenticate();
	}, [user]);

	/* -----------------------------------------------------
	   🔥 CARGAR CITAS
	------------------------------------------------------- */
	useEffect(() => {
		if (!token || !user?.id) return;

		(async () => {
			try {
				const { data } = await Api.get(
					`/service-orders/provider/${user.id}`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);

				setOrders(Array.isArray(data) ? data : []);
			} catch (err) {
				console.error("Error cargando citas:", err);
			}
		})();
	}, [token, user]);

	if (!isClient || loading) {
		return (
			<div className="flex justify-center items-center h-screen text-gray-500">
				Cargando tu panel...
			</div>
		);
	}

	/* -----------------------------------------------------
	   🧮 PROCESAR
	------------------------------------------------------- */

	const paidOrders = orders.filter(
		(o) => o.payments?.[0]?.status === "approved"
	);

	const upcoming = paidOrders.filter((o) =>
		["paid", "accepted"].includes(o.status)
	);

	const completed = paidOrders.filter((o) => o.status === "completed");

	const totalRevenue = paidOrders.reduce(
		(acc, o) => acc + Number(o.payments?.[0]?.amount || 0),
		0
	);

	const reviewsCount = (user as any)?.reviews?.length || 0;

	const formatMoney = (value: number) =>
		value.toLocaleString("es-MX", {
			style: "currency",
			currency: "MXN",
			maximumFractionDigits: 0,
		});

	/* -----------------------------------------------------
	   🎨 UI MODERNA (tipo usuario)
	------------------------------------------------------- */

	return (
		<main className="max-w-6xl mx-auto px-4 py-10 font-nunito">
			{/* HEADER */}
			<motion.h1
				variants={fadeUp}
				initial="initial"
				animate="animate"
				className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-6"
			>
				¡Hola, {user?.names?.split(" ")[0]}!
			</motion.h1>

			{/* ---------------- KPIs ---------------- */}
			<motion.section
				variants={fadeUp}
				initial="initial"
				animate="animate"
				className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
			>
				<div className="bg-[var(--color-primary)] text-white p-5 rounded-2xl shadow">
					<FontAwesomeIcon
						icon={faCalendar}
						className="text-2xl mb-2"
					/>
					<p className="text-3xl font-bold">{upcoming.length}</p>
					<p className="text-sm opacity-90">Próximas citas</p>
				</div>

				<div className="bg-white p-5 rounded-2xl shadow text-center">
					<FontAwesomeIcon
						icon={faCheckCircle}
						className="text-[var(--color-primary)] text-2xl"
					/>
					<p className="text-3xl font-bold">{completed.length}</p>
					<p className="text-gray-600 text-sm">Completadas</p>
				</div>

				<div className="bg-white p-5 rounded-2xl shadow text-center">
					<FontAwesomeIcon
						icon={faMoneyBill}
						className="text-[var(--color-primary)] text-2xl"
					/>
					<p className="text-2xl font-bold">
						{formatMoney(totalRevenue)}
					</p>
					<p className="text-gray-600 text-sm">Ingresos</p>
				</div>

			</motion.section>

			{/* ---------------- Próximas citas ---------------- */}
			<motion.section
				variants={fadeUp}
				initial="initial"
				animate="animate"
				className="mb-10"
			>
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold text-[var(--color-primary)]">
						Próximas citas con clientes
					</h2>
					<button
						onClick={() => router.push("/provider/appointments")}
						className="text-sm font-semibold text-[var(--color-primary)] flex items-center gap-1"
					>
						Ver todas <FontAwesomeIcon icon={faArrowRight} />
					</button>
				</div>

				{upcoming.length === 0 ? (
					<p className="text-gray-500">No tienes citas próximas.</p>
				) : (
					<div className="grid gap-4">
						{upcoming.slice(0, 3).map((o) => (
							<div
								key={o.id}
								className="bg-white p-5 rounded-xl shadow flex items-center gap-6 hover:shadow-lg transition"
							>
								{/* FOTO SERVICIO */}
								<img
									src={
										o.service?.photos?.[0] ||
										"/default-service.jpg"
									}
									className="w-20 h-20 rounded-full object-cover border"
								/>

								<div className="flex-1">
									<p className="font-semibold text-lg text-[var(--color-primary)]">
										{o.service.name}
									</p>

									{/* CLIENTE */}
									<p className="text-gray-600 text-sm mt-1">
										Cliente:{" "}
										<span className="font-medium capitalize">
											{o.user.names} {o.user.surnames}
										</span>
									</p>

									{/* ESTADO */}
									<p className="text-xs mt-1 font-semibold text-gray-500">
										{o.status === "accepted"
											? "CITA ACEPTADA"
											: "CITA PAGADA — PENDIENTE"}
									</p>
								</div>

								<Link
									href="/provider/appointments"
									className="text-[var(--color-primary)] font-semibold underline text-sm"
								>
									Gestionar
								</Link>
							</div>
						))}
					</div>
				)}
			</motion.section>

			{/* ---------------- Completados ---------------- */}
			<motion.section
				variants={fadeUp}
				initial="initial"
				animate="animate"
				className="mb-10"
			>
				<h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">
					Últimos servicios completados
				</h2>

				{completed.length === 0 ? (
					<p className="text-gray-500">
						Aún no tienes servicios completados.
					</p>
				) : (
					<div className="grid gap-4">
						{completed.slice(0, 4).map((o) => (
							<div
								key={o.id}
								className="bg-white p-5 rounded-xl shadow flex items-center justify-between"
							>
								<div>
									<p className="font-semibold text-[var(--color-primary)]">
										{o.service.name}
									</p>

									<p className="text-gray-600 text-sm">
										Cliente: {o.user.names}{" "}
										{o.user.surnames}
									</p>
								</div>

								<div className="text-right">
									<p className="font-bold text-[var(--color-primary)]">
										{formatMoney(
											Number(o.payments?.[0]?.amount || 0)
										)}
									</p>
									<p className="text-xs text-gray-500">
										Ingreso acreditado
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</motion.section>

			{/* ---------------- Atajos ---------------- */}
			<section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
				<button
					onClick={() => router.push("/provider/serviceRegister")}
					className="bg-[var(--color-primary)] text-white p-4 rounded-xl shadow text-center font-semibold hover:scale-[1.02] transition"
				>
					<FontAwesomeIcon icon={faScissors} className="mr-2" />
					Nuevo servicio
				</button>

				<button
					onClick={() => router.push("/provider/appointments")}
					className="bg-white p-4 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-xl shadow text-center font-semibold hover:scale-[1.02] transition"
				>
					<FontAwesomeIcon icon={faCalendar} className="mr-2" />
					Agenda completa
				</button>

				<button
					onClick={() => router.push("/provider/profile")}
					className="bg-white p-4 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-xl shadow text-center font-semibold hover:scale-[1.02] transition"
				>
					<FontAwesomeIcon icon={faUser} className="mr-2" />
					Perfil personal
				</button>
			</section>
		</main>
	);
}
