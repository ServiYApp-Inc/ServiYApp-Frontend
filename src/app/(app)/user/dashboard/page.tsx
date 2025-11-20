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
	faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const fadeUp = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
};

/* ---------------------------- */
/* TRADUCIR ESTADOS */
/* ---------------------------- */
const traducirEstado = (status: string) => {
	switch (status) {
		case "paid":
			return "PAGADA — pendiente de aceptación";
		case "accepted":
			return "CITA ACEPTADA POR EL PROVEEDOR";
		case "finished":
			return "FINALIZADA";
		case "cancelled":
			return "CANCELADA";
		default:
			return status.toUpperCase();
	}
};

/* ---------------------------- */
/* BANNERS (Black Friday + Año Nuevo) */
/* ---------------------------- */
const BannerPromo = ({ router }: { router: any }) => (
	<div className="w-full grid md:grid-cols-2 gap-4 mt-6 mb-10">
		{/* 🔥 BLACK FRIDAY */}
		<div className="bg-gradient-to-br from-[#1d2846] to-[#000000] text-white rounded-3xl p-8 shadow-lg flex flex-col items-start justify-between hover:scale-[1.01] transition cursor-pointer">
			<h3 className="text-3xl font-bold mb-3">Black Friday ✂️</h3>
			<p className="text-sm opacity-90 max-w-[300px]">
				Descuentos especiales en servicios premium por tiempo limitado.
				¡ESPERALOS!
			</p>
			<p className="text-sm opacity-90 max-w-[300px]">+500 servicios</p>
		</div>

		{/* ✨ AÑO NUEVO */}
		<div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white rounded-3xl p-8 shadow-lg flex flex-col items-start justify-between hover:scale-[1.01] transition cursor-pointer">
			<h3 className="text-3xl font-bold mb-3">Año Nuevo ✨</h3>
			<p className="text-sm opacity-90 max-w-[300px]">
				Empieza el año con un look espectacular Renovate para el 2025.
			</p>
			<button
				onClick={() => router.push("/user/services")}
				className="mt-4 bg-white text-[var(--color-primary)] font-semibold px-5 py-2 rounded-xl hover:bg-gray-100"
			>
				Explorar servicios
			</button>
		</div>
	</div>
);

export default function UserDashboard() {
	const router = useRouter();
	const setAuth = useAuthStore((s) => s.setAuth);
	const { user, token, isAuthenticated } = useAuthStore();

	const [loading, setLoading] = useState(true);
	const [isClient, setIsClient] = useState(false);

	const [orders, setOrders] = useState<any[]>([]);
	const [addresses, setAddresses] = useState<any[]>([]);
	const [reviews, setReviews] = useState<any[]>([]);
	const [recommended, setRecommended] = useState<any[]>([]);

	/* ---------------------------- */
	/* LOGIN CON GOOGLE */
	/* ---------------------------- */
	useEffect(() => {
		setIsClient(true);

		const params = new URLSearchParams(window.location.search);
		const token = params.get("token");
		const id = params.get("id");
		const role = params.get("role");

		(async () => {
			try {
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
					window.history.replaceState(
						{},
						"",
						window.location.pathname
					);
				} else {
					const stored = localStorage.getItem("access_token");
					if (!stored && !isAuthenticated) {
						router.push("/loginUser");
						return;
					}
				}
			} catch (err) {
				console.error(err);
				router.push("/loginUser");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	/* ---------------------------- */
	/* CARGAR DATOS DEL DASHBOARD */
	/* ---------------------------- */
	useEffect(() => {
		if (!token || !user?.id) return;

		(async () => {
			try {
				const [ordersRes, addrRes, reviewsRes, recRes] =
					await Promise.all([
						Api.get(`/service-orders/user/${user.id}`, {
							headers: { Authorization: `Bearer ${token}` },
						}),
						Api.get("/addresses", {
							headers: { Authorization: `Bearer ${token}` },
						}),
						Api.get(`/reviews/user/${user.id}`, {
							headers: { Authorization: `Bearer ${token}` },
						}),
						Api.get("/services/find-all"),
					]);

				setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
				setAddresses(Array.isArray(addrRes.data) ? addrRes.data : []);
				setReviews(
					Array.isArray(reviewsRes.data) ? reviewsRes.data : []
				);
				setRecommended(
					Array.isArray(recRes.data) ? recRes.data.slice(0, 3) : []
				);
			} catch (err) {
				console.error("Error cargando dashboard:", err);
			}
		})();
	}, [token, user]);

	if (!isClient || loading)
		return (
			<div className="flex justify-center items-center h-screen text-gray-500">
				Cargando tu cuenta...
			</div>
		);

	/* ---------------------------- */
	/* PROCESAR DATOS */
	/* ---------------------------- */
	const upcoming = orders.filter((o) =>
		["paid", "accepted"].includes(o.status)
	);

	const completed = orders.filter((o) => o.status === "completed");
	const totalSpent = orders.reduce(
		(acc, o) => acc + Number(o.payments?.[0]?.amount || 0),
		0
	);

	const mainAddress = addresses[0];

	return (
		<main className="max-w-6xl mx-auto px-4 py-10 font-nunito">
			{/* HEADER */}
			<motion.h1
				variants={fadeUp}
				initial="initial"
				animate="animate"
				className="text-3xl font-bold text-[var(--color-primary)] mb-6"
			>
				Hola, {user?.names}! 👋
			</motion.h1>

			{/* ⭐ BANNERS */}
			<BannerPromo router={router} />

			{/* ⭐ CARDS RESUMEN */}
			<motion.section
				variants={fadeUp}
				initial="initial"
				animate="animate"
				className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
			>
				<div className="bg-[var(--color-primary)] text-white p-5 rounded-2xl shadow hover:scale-[1.02] transition">
					<FontAwesomeIcon
						icon={faCalendar}
						className="text-2xl mb-2"
					/>
					<p className="text-3xl font-bold">{upcoming.length}</p>
					<p className="opacity-90 text-sm">Próximas citas</p>
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
					<p className="text-3xl font-bold">${totalSpent}</p>
					<p className="text-gray-600 text-sm">Gastado</p>
				</div>

				
			</motion.section>

			{/* ⭐ PRÓXIMAS CITAS */}
			<motion.section
				variants={fadeUp}
				initial="initial"
				animate="animate"
				className="mb-10"
			>
				<h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">
					Tus próximas citas
				</h2>

				{upcoming.length === 0 ? (
					<p className="text-gray-500">No tienes citas próximas.</p>
				) : (
					<div className="grid gap-4">
						{upcoming.slice(0, 3).map((o) => (
							<div
								key={o.id}
								className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition flex items-center gap-6"
							>
								{/* FOTO DE SERVICIO CIRCULAR */}
								<img
									src={
										o.service?.photos?.[0] ||
										"/default-service.jpg"
									}
									className="w-24 h-24 rounded-full object-cover border shadow"
								/>

								<div className="flex-1">
									<p className="font-semibold text-[var(--color-primary)] text-lg">
										{o.service.name}
									</p>

									{/* PROVEEDOR */}
									<div className="flex items-center gap-2 mt-2">
										<img
											src={
												o.provider?.profilePicture ||
												"/default-avatar.png"
											}
											className="w-8 h-8 rounded-full object-cover border"
										/>
										<p className="text-gray-600 text-sm">
											{o.provider?.names}{" "}
											{o.provider?.surnames}
										</p>
									</div>

									{/* ESTADO */}
									<p className="text-xs uppercase mt-2 font-semibold text-gray-500">
										{traducirEstado(o.status)}
									</p>
								</div>

								<Link
									href={`/orders/${o.id}`}
									className="text-[var(--color-primary)] font-semibold text-sm underline"
								>
									Ver
								</Link>
							</div>
						))}
					</div>
				)}
			</motion.section>

			{/* ⭐ DIRECCIÓN PRINCIPAL */}
			<motion.section
				variants={fadeUp}
				initial="initial"
				animate="animate"
				className="mb-10"
			>
				<h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">
					Tu dirección principal
				</h2>

				{!mainAddress ? (
					<p className="text-gray-500">
						No tienes direcciones agregadas.
					</p>
				) : (
					<div className="bg-white p-5 rounded-xl shadow flex items-center gap-4">
						<FontAwesomeIcon
							icon={faLocationDot}
							className="text-[var(--color-primary)] text-xl"
						/>
						<div>
							<p className="font-semibold">{mainAddress.name}</p>
							<p className="text-gray-600 text-sm">
								{mainAddress.address}
							</p>
						</div>
					</div>
				)}
			</motion.section>

			{/* ⭐ COMPLETADOS DINÁMICOS */}
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
						Aún no has completado servicios.
					</p>
				) : (
					<div className="grid gap-4">
						{completed.slice(0, 3).map((o) => (
							<div
								key={o.id}
								className="bg-white p-5 rounded-xl shadow flex gap-4 items-center"
							>
								{/* FOTO MINI */}
								<img
									src={
										o.service?.photos?.[0] ||
										"/default-service.jpg"
									}
									className="w-16 h-16 rounded-xl object-cover border"
								/>

								<div className="flex-1">
									<p className="font-semibold text-[var(--color-primary)]">
										{o.service.name}
									</p>
									<p className="text-gray-600 text-sm">
										Proveedor: {o.provider.names}{" "}
										{o.provider.surnames}
									</p>
								</div>

								{/* PRECIO */}
								<p className="font-bold text-[var(--color-primary)] text-lg">
									${o.payments?.[0]?.amount || 0}
								</p>
							</div>
						))}
					</div>
				)}
			</motion.section>

			{/* ⭐ RECOMENDADOS */}
			<motion.section
				variants={fadeUp}
				initial="initial"
				animate="animate"
				className="mb-10"
			>
				<h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">
					Recomendados para ti
				</h2>

				<div className="grid md:grid-cols-3 gap-4">
					{recommended.map((s) => (
						<div
							key={s.id}
							className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
						>
							<img
								src={s.photos?.[0] || "/default-service.jpg"}
								className="w-full h-32 object-cover rounded-xl mb-3"
							/>
							<p className="font-semibold text-[var(--color-primary)]">
								{s.name}
							</p>
							<p className="text-gray-600 text-sm">${s.price}</p>
						</div>
					))}
				</div>
			</motion.section>
		</main>
	);
}
