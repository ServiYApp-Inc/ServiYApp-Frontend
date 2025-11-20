"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
	faTags,
	faFileShield,
	faRightFromBracket,
	faChartLine,
	faCircleCheck,
	faCircleXmark,
	faClockRotateLeft,
	faUserCheck,
	faUser,
	faUserLock,
	faUserGear,
} from "@fortawesome/free-solid-svg-icons";

import {
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Tooltip,
	Legend,
} from "recharts";

import { useAuthStore } from "@/app/store/auth.store";
import { getCategories } from "@/app/services/provider.service";
import { Api } from "@/app/services/api";
import IProvider from "@/app/interfaces/IProvider";
import { getProviders, getUsers } from "../../provider/serviceRegister/service.service";
import IUser from "@/app/interfaces/IUser";

interface AdminOrder {
	id: string;
	status:
		| "pending"
		| "paid"
		| "accepted"
		| "completed"
		| "cancelled"
		| string;
	createdAt: string;

	user?: { names: string; surnames: string };
	provider?: { names: string; surnames: string };
	service?: { name: string };
}

const fadeUp = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
};

const PIE_COLORS = [
	"#F4C542", // Amarillo (pending)
	"#4A90E2",
	"#34A853", // Azul (paid)
	"#1D2846", // Azul marino (accepted)
	// Verde (completed)
	"#EA4335", // Rojo (cancelled)
];

export default function AdminDashboard() {
	const router = useRouter();
	const { user, clearAuth, token } = useAuthStore();

	const [categories, setCategories] = useState<any[]>([]);
	const [pendingDocs, setPendingDocs] = useState<any[]>([]);
	const [orders, setOrders] = useState<AdminOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [providers, setProviders] = useState<IProvider[]>([]);
	const [users, setUsers] = useState<IUser[]>([]);
	
	const fetchUsers = async () => {
		try {
			setLoading(true);
			const data = await getUsers();
			setUsers(data);
		} catch (error) {
			console.error("Error al obtener usuarios:", error);
		} finally {
			setLoading(false);
		}
	};
	
	useEffect(() => {
		fetchUsers();
	}, []);

	// fetch proveedores para numero
	const fetchProviders = async () => {
		try {
			setLoading(true);
			const data = await getProviders();
			setProviders(data);
		} catch (error) {
			console.error("Error al obtener providers:", error);
		} finally {
			setLoading(false);
		}
	};
	
	useEffect(() => {
		fetchProviders();
	}, []);

	


	useEffect(() => {
		if (!token) return;

		const fetchAll = async () => {
			try {
				setLoading(true);

				const categoriesData = await getCategories();
				setCategories(categoriesData || []);

				const docsRes = await Api.get(
					"provider-documents/admin/pending",
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				setPendingDocs(docsRes.data || []);

				const ordersRes = await Api.get("/service-orders/orders-all", {
					headers: { Authorization: `Bearer ${token}` },
				});
				setOrders(ordersRes.data || []);
			} finally {
				setLoading(false);
			}
		};

		fetchAll();
	}, [token]);

	// ---------------- MÉTRICAS POR ESTADO ----------------
	const totalOrders = orders.length;

	const pendingCount = orders.filter((o) => o.status === "pending").length;
	const paidCount = orders.filter((o) => o.status === "paid").length;
	const acceptedCount = orders.filter((o) => o.status === "accepted").length;
	const completedCount = orders.filter(
		(o) => o.status === "completed"
	).length;
	const cancelledCount = orders.filter(
		(o) => o.status === "cancelled"
	).length;

	const categoriesCount = categories.length;
	const pendingDocsCount = pendingDocs.length;

	// ---------------- DATA GRÁFICA PASTEL ----------------
	const pieData = [
		{ name: "Pendientes", value: pendingCount },
		{ name: "Pagadas (por aceptar)", value: paidCount },
		{ name: "Aceptadas", value: acceptedCount },
		{ name: "Finalizadas", value: completedCount },
		{ name: "Canceladas", value: cancelledCount },
	].filter((item) => item.value > 0);

	// ---------------- ÚLTIMAS CITAS ----------------
	const latestOrders = [...orders]
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() -
				new Date(a.createdAt).getTime()
		)
		.slice(0, 6);

	const formatStatusLabel = (status: string) => {
		switch (status) {
			case "pending":
				return "Pendiente";
			case "paid":
				return "Pagada (por aceptar)";
			case "accepted":
				return "Aceptada";
			case "completed":
				return "Finalizada";
			case "cancelled":
				return "Cancelada";
			default:
				return status.toUpperCase();
		}
	};

	const handleLogout = async () => {
		const r = await Swal.fire({
			title: "¿Cerrar sesión?",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#1D2846",
			cancelButtonColor: "#d33",
			confirmButtonText: "Cerrar",
			cancelButtonText: "Cancelar",
		});

		if (r.isConfirmed) {
			clearAuth();
			router.push("/");
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-[60vh] text-[var(--color-primary)] text-xl">
				Cargando panel de administrador…
			</div>
		);
	}

	return (
		<main className="max-w-6xl mx-auto px-4 py-8 font-nunito">
			{/* BANNER AZUL SÓLIDO */}
			<motion.section
				variants={fadeUp}
				initial="initial"
				animate="animate"
				className="bg-[var(--color-primary)] rounded-3xl p-8 text-white shadow-xl mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
			>
				<div className="flex items-center gap-5">
					<div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-lg bg-white/10 flex items-center justify-center">
						{user?.profilePicture ? (
							<img
								src={user.profilePicture}
								alt="profile"
								className="w-full h-full object-cover"
							/>
						) : (
							<span className="text-3xl font-bold">
								{user?.names?.[0] || "A"}
							</span>
						)}
					</div>

					<div>
						<p className="text-xs uppercase opacity-80 tracking-[0.25em]">
							Panel administrador
						</p>
						<h1 className="text-3xl md:text-4xl font-bold mt-1">
							Hola, {user?.names} {user?.surnames}
						</h1>
						<p className="text-white/80 text-sm mt-2 max-w-xl">
							Administra categorías, proveedores, documentos y
							citas de toda la plataforma desde un solo lugar.
						</p>
					</div>
				</div>

				<div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
					<button
						onClick={handleLogout}
						className="border border-white/40 px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition"
					>
						<FontAwesomeIcon
							icon={faRightFromBracket}
							className="mr-2"
						/>
						Cerrar sesión
					</button>
				</div>
			</motion.section>

			{/* TARJETAS PRINCIPALES */}
			<motion.section
				variants={fadeUp}
				initial="initial"
				animate="animate"
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
			>
				{/* Citas (resumen) */}
					<div className="flex flex-col justify-between items-center mb-4 gap-4 w-full">
						<Link href="/admin/dashboard/providers" className="w-full">
							<div className="flex justify-between bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:-translate-y-1 hover:shadow-lg transition cursor-pointer w-full">
								<h3 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
									<FontAwesomeIcon icon={faUserGear} />
									Proveedores
								</h3>
								<span className="text-3xl font-bold text-[var(--color-primary)]">
									{providers.length}
								</span>
							</div>
						</Link>

						<Link href="/admin/dashboard/users" className="w-full">
							<div className="flex justify-between bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:-translate-y-1 hover:shadow-lg transition cursor-pointer w-full">
								<h3 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
									<FontAwesomeIcon icon={faUserGear} />
									Usuarios
								</h3>
								<span className="text-3xl font-bold text-[var(--color-primary)]">
									{users.length}
								</span>
							</div>
						</Link>
					</div>


				{/* Categorías */}
				<Link href="/admin/dashboard/categories">
					<div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:-translate-y-1 hover:shadow-lg transition cursor-pointer">
						<h3 className="text-xl font-bold text-[var(--color-primary)] mb-3 flex items-center gap-2">
							<FontAwesomeIcon icon={faTags} />
							Categorías
						</h3>
						<p className="text-4xl font-bold text-[var(--color-primary)]">
							{categoriesCount}
						</p>
						<p className="text-gray-500 text-sm mt-2">
							Organización del catálogo de servicios disponible en
							la plataforma.
						</p>
					</div>
				</Link>

				{/* Documentos */}
				<Link href="/admin/dashboard/ReviewDocuments">
					<div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:-translate-y-1 hover:shadow-lg transition cursor-pointer">
						<h3 className="text-xl font-bold text-[var(--color-primary)] mb-3 flex items-center gap-2">
							<FontAwesomeIcon icon={faFileShield} />
							Documentos
						</h3>
						<p className="text-4xl font-bold text-[var(--color-primary)]">
							{pendingDocsCount}
						</p>
						<p className="text-gray-500 text-sm mt-2">
							Documentación pendiente de revisar para validar
							proveedores.
						</p>
					</div>
				</Link>

				{/* Citas aceptadas (card blanca, como pediste) */}
				<Link href="/admin/appointments">
					<div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:-translate-y-1 hover:shadow-lg transition cursor-pointer">
						<h3 className="text-xl font-bold text-[var(--color-primary)] mb-3 flex items-center gap-2">
							<FontAwesomeIcon icon={faCircleCheck} />
							Citas aceptadas
						</h3>
						<p className="text-4xl font-bold text-[var(--color-primary)]">
							{acceptedCount}
						</p>
						<p className="text-gray-500 text-sm mt-2">
							Citas confirmadas por el proveedor, listas para
							realizarse.
						</p>
					</div>
				</Link>
			</motion.section>

			{/* GRÁFICA PASTEL + KPIs LATERALES */}
			<motion.section
				variants={fadeUp}
				initial="initial"
				animate="animate"
				className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12"
			>
				{/* Gráfica pastel */}
				<div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm lg:col-span-2">
					<div className="flex items-center justify-between mb-2">
						<h3 className="text-lg font-bold text-[var(--color-primary)] flex items-center gap-2">
							<FontAwesomeIcon icon={faChartLine} />
							Distribución de citas por estado
						</h3>
						<span className="text-xs text-gray-500">
							Estados: pendiente, pagada, aceptada, finalizada,
							cancelada
						</span>
					</div>

					<div className="w-full h-64 mt-2">
						{pieData.length === 0 ? (
							<div className="flex items-center justify-center h-full text-sm text-gray-500">
								Aún no hay datos suficientes para mostrar la
								gráfica.
							</div>
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={pieData}
										dataKey="value"
										nameKey="name"
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={90}
										paddingAngle={3}
									>
										{pieData.map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={
													PIE_COLORS[
														index %
															PIE_COLORS.length
													]
												}
											/>
										))}
									</Pie>
									<Tooltip
										formatter={(
											value: number,
											name: string
										) => [`${value} citas`, name]}
									/>
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						)}
					</div>
				</div>

				{/* KPIs laterales */}
				<div className="grid grid-cols-1 gap-4">
					<div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm">
						<p className="text-xs uppercase text-gray-400 mb-1">
							Citas finalizadas
						</p>
						<h3 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-2 mb-1">
							<FontAwesomeIcon
								icon={faCircleCheck}
								className="text-green-500"
							/>
							{completedCount}
						</h3>
						<p className="text-sm text-gray-600">
							Servicios completados exitosamente dentro de la
							plataforma.
						</p>
					</div>

					<div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm">
						<p className="text-xs uppercase text-gray-400 mb-1">
							Citas canceladas
						</p>
						<h3 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-2 mb-1">
							<FontAwesomeIcon
								icon={faCircleXmark}
								className="text-red-500"
							/>
							{cancelledCount}
						</h3>
						<p className="text-sm text-gray-600">
							Cancelaciones registradas, útiles para monitorear
							fricción.
						</p>
					</div>

					<div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm">
						<p className="text-xs uppercase text-gray-400 mb-1">
							Pendientes y pagadas
						</p>
						<h3 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-2 mb-1">
							<FontAwesomeIcon
								icon={faClockRotateLeft}
								className="text-yellow-500"
							/>
							{pendingCount + paidCount}
						</h3>
						<p className="text-sm text-gray-600">
							Citas que aún requieren acción del usuario o del
							proveedor.
						</p>
					</div>
				</div>
			</motion.section>

			{/* TABLA DE ÚLTIMAS CITAS */}
			<section>
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-bold text-[var(--color-primary)]">
						Últimas citas registradas
					</h2>

					<Link
						href="/admin/appointments"
						className="text-sm font-semibold text-[var(--color-primary)] underline"
					>
						Ver todas
					</Link>
				</div>

				<div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm bg-white">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-50 text-gray-600 text-left">
							<tr>
								<th className="py-3 px-4">Servicio</th>
								<th className="py-3 px-4">Usuario</th>
								<th className="py-3 px-4">Proveedor</th>
								<th className="py-3 px-4">Estado</th>
								<th className="py-3 px-4">Fecha</th>
							</tr>
						</thead>

						<tbody>
							{latestOrders.length === 0 ? (
								<tr>
									<td
										colSpan={5}
										className="py-6 px-4 text-center text-gray-500"
									>
										Aún no hay citas registradas.
									</td>
								</tr>
							) : (
								latestOrders.map((o) => (
									<tr
										key={o.id}
										className="border-t hover:bg-gray-50 transition"
									>
										<td className="py-3 px-4 font-semibold text-[var(--color-primary)]">
											{o.service?.name || "Servicio"}
										</td>

										<td className="py-3 px-4">
											{o.user
												? `${o.user.names} ${o.user.surnames}`
												: "No disponible"}
										</td>

										<td className="py-3 px-4">
											{o.provider
												? `${o.provider.names} ${o.provider.surnames}`
												: "No disponible"}
										</td>

										<td className="py-3 px-4">
											<span
												className={`text-xs font-semibold px-3 py-1 rounded-full
													${
														o.status === "completed"
															? "bg-green-100 text-green-700"
															: o.status ===
															  "cancelled"
															? "bg-red-100 text-red-700"
															: o.status ===
															  "paid"
															? "bg-blue-100 text-blue-700"
															: o.status ===
															  "accepted"
															? "bg-indigo-100 text-indigo-700"
															: "bg-yellow-100 text-yellow-700"
													}`}
											>
												{formatStatusLabel(o.status)}
											</span>
										</td>

										<td className="py-3 px-4 text-gray-600">
											{new Date(
												o.createdAt
											).toLocaleString("es-MX", {
												day: "2-digit",
												month: "short",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</section>
		</main>
	);
}
