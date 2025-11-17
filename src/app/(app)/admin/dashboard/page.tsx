"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTags,
	faUsersGear,
	faFileShield,
	faCalendarDays,
	faChartSimple,
	faRightFromBracket,
	faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

import { getCategories } from "@/app/services/provider.service";
import { Api } from "@/app/services/api";
import { useAuthStore } from "@/app/store/auth.store";

export default function AdminDashboard() {
	const router = useRouter();
	const { user, clearAuth, token } = useAuthStore();

	/* ---------------- STATE ---------------- */
	const [categories, setCategories] = useState([]);
	const [pendingDocs, setPendingDocs] = useState([]);
	const [orders, setOrders] = useState([]);

	const [loading, setLoading] = useState(true);

	/* ---------------- FETCH DATA ---------------- */

	const fetchAllData = async () => {
		try {
			setLoading(true);

			// Categorías
			const categoriesData = await getCategories();
			setCategories(categoriesData);

			// Documentos pendientes
			const docsRes = await Api.get("provider-documents/admin/pending", {
				headers: { Authorization: `Bearer ${token}` },
			});
			setPendingDocs(docsRes.data || []);

			// Citas
			const ordersRes = await Api.get("/service-orders/orders-all", {
				headers: { Authorization: `Bearer ${token}` },
			});
			setOrders(ordersRes.data || []);
		} catch (error) {
			console.warn("Error cargando dashboard", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAllData();
	}, []);

	/* ---------------- LOGOUT ---------------- */
	const handleLogout = async () => {
		const result = await Swal.fire({
			title: "¿Cerrar sesión?",
			text: "Tu sesión actual se cerrará",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#1D2846",
			cancelButtonColor: "#d33",
			confirmButtonText: "Cerrar",
			cancelButtonText: "Cancelar",
		});

		if (result.isConfirmed) {
			clearAuth();
			router.push("/");
		}
	};

	/* ---------------- METRICS ---------------- */

	const totalOrders = orders.length;
	const pendingOrders = orders.filter((o) => o.status === "pending").length;
	const completedOrders = orders.filter((o) => o.status === "completed").length;
	const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

	const categoriesCount = categories.length;
	const pendingDocsCount = pendingDocs.length;

	/* ---------------- SIMPLE BAR CHART ---------------- */

	const chartMax = Math.max(
		totalOrders,
		completedOrders,
		cancelledOrders,
		pendingOrders,
		1
	);

	const bar = (value: number) => (value / chartMax) * 100;

	/* ---------------- RENDER ---------------- */

	return (
		<main className="max-w-6xl mx-auto mt-8 px-4">
			<h1 className="text-4xl md:text-5xl font-bold text-[var(--color-primary)] mb-6">
				Panel <strong>Administrador</strong>
			</h1>

			{/* ---------------- USER INFO ---------------- */}
			<div className="bg-[var(--color-primary)] p-6 rounded-3xl text-white flex flex-col gap-8 shadow-xl">
				<div className="flex flex-col md:flex-row items-center gap-6">
					<img
						src={user?.profilePicture}
						alt="Foto de Perfil"
						className="w-[130px] h-[130px] rounded-full border-2 border-white object-cover"
					/>

					<div>
						<h3 className="font-bold text-[32px] leading-tight">
							{user?.names} {user?.surnames}
						</h3>
						<h5 className="text-[20px] opacity-90">{user?.email}</h5>
					</div>
				</div>

				{/* Resume Metrics */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
					<div>
						<p className="text-[36px]">{completedOrders}</p>
						<p className="text-[18px] opacity-80">Servicios Finalizados</p>
					</div>
					<div>
						<p className="text-[36px]">{pendingOrders}</p>
						<p className="text-[18px] opacity-80">Pendientes</p>
					</div>
					<div>
						<p className="text-[36px]">{pendingDocsCount}</p>
						<p className="text-[18px] opacity-80">Documentos por revisar</p>
					</div>
				</div>
			</div>

			{/* ---------------- QUICK LINKS ---------------- */}
			<h2 className="text-[32px] font-semibold text-[var(--color-primary)] mt-10 mb-4">
				Administración Rápida
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Link href="/admin/dashboard/categories">
					<div className="bg-white border border-gray-300 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition shadow">
						<FontAwesomeIcon icon={faTags} className="text-3xl mb-3 text-[var(--color-primary)]" />
						<h3 className="text-xl font-semibold text-[var(--color-primary)]">Categorías</h3>
						<p className="text-gray-500">{categoriesCount} categorías registradas</p>
					</div>
				</Link>

				<Link href="/admin/dashboard/ReviewDocuments">
					<div className="bg-white border border-gray-300 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition shadow">
						<FontAwesomeIcon icon={faFileShield} className="text-3xl mb-3 text-[var(--color-primary)]" />
						<h3 className="text-xl font-semibold text-[var(--color-primary)]">
							Revisión de Documentos
						</h3>
						<p className="text-gray-500">{pendingDocsCount} documentos pendientes</p>
					</div>
				</Link>

				<Link href="/admin/dashboard/appointments">
					<div className="bg-white border border-gray-300 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition shadow">
						<FontAwesomeIcon icon={faCalendarDays} className="text-3xl mb-3 text-[var(--color-primary)]" />
						<h3 className="text-xl font-semibold text-[var(--color-primary)]">
							Gestión de Citas
						</h3>
						<p className="text-gray-500">{totalOrders} citas registradas</p>
					</div>
				</Link>
			</div>

			{/* ---------------- GRAPH SECTION ---------------- */}
			<h2 className="text-[32px] font-semibold text-[var(--color-primary)] mt-10">
				Estadísticas Rápidas
			</h2>

			<div className="bg-white mt-4 p-6 rounded-2xl shadow border border-gray-200">
				<h4 className="text-[20px] font-semibold text-[var(--color-primary)] mb-4">
					Resumen de Citas
				</h4>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center mt-6">
					{/* TOTAL */}
					<div>
						<div
							className="bg-[var(--color-primary)]/20 rounded-xl h-32 mx-auto flex items-end"
							style={{ width: "60%", height: `${bar(totalOrders)}%` }}
						>
							<div className="bg-[var(--color-primary)] w-full h-3 rounded-b-xl"></div>
						</div>
						<p className="font-semibold text-[var(--color-primary)] mt-2">Total</p>
						<p className="text-sm text-gray-600">{totalOrders}</p>
					</div>

					{/* COMPLETED */}
					<div>
						<div
							className="bg-green-200 rounded-xl mx-auto flex items-end"
							style={{ width: "60%", height: `${bar(completedOrders)}%`, minHeight: "20px" }}
						>
							<div className="bg-green-600 w-full h-3 rounded-b-xl"></div>
						</div>
						<p className="font-semibold text-[var(--color-primary)] mt-2">
							Finalizadas
						</p>
						<p className="text-sm text-gray-600">{completedOrders}</p>
					</div>

					{/* PENDING */}
					<div>
						<div
							className="bg-yellow-200 rounded-xl mx-auto flex items-end"
							style={{ width: "60%", height: `${bar(pendingOrders)}%`, minHeight: "20px" }}
						>
							<div className="bg-yellow-600 w-full h-3 rounded-b-xl"></div>
						</div>
						<p className="font-semibold text-[var(--color-primary)] mt-2">
							Pendientes
						</p>
						<p className="text-sm text-gray-600">{pendingOrders}</p>
					</div>

					{/* CANCELLED */}
					<div>
						<div
							className="bg-red-200 rounded-xl mx-auto flex items-end"
							style={{ width: "60%", height: `${bar(cancelledOrders)}%`, minHeight: "20px" }}
						>
							<div className="bg-red-600 w-full h-3 rounded-b-xl"></div>
						</div>
						<p className="font-semibold text-[var(--color-primary)] mt-2">Canceladas</p>
						<p className="text-sm text-gray-600">{cancelledOrders}</p>
					</div>
				</div>
			</div>

			
		</main>
	);
}
