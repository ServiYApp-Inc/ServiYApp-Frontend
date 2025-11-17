"use client";

import { useEffect, useState } from "react";
import { Api } from "@/app/services/api";
import { useAuthStore } from "@/app/store/auth.store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSpinner,
	faCalendarDays,
	faTimes,
	faCopy,
	faEye,
	faXmark,
	faSearch,
	faCheck,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import MapAddress from "@/app/components/MapAddress";

interface ServiceOrder {
	id: string;
	status: string;
	createdAt: string;

	user: { names: string; surnames: string; email: string };
	provider: { names: string; surnames: string; email: string };

	service: {
		name: string;
		photos?: string[] | null;
		price: number;
		duration: number;
	};

	address: {
		address: string;
		neighborhood?: string;
		city?: { name: string };
		region?: { name: string };
		lat?: string;
		lng?: string;
	};

	payments: {
		status: string;
		amount: string;
		currency: string;
	}[];
}

export default function AdminAppointmentsPage() {
	const { token } = useAuthStore();
	const [orders, setOrders] = useState<ServiceOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [processingId, setProcessingId] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<
		"all" | "upcoming" | "completed" | "cancelled"
	>("all");

	const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

	const [search, setSearch] = useState("");

	// 🚫 ELIMINADO: filtro de mostrar no pagadas
	// SOLO se mostrarán pagadas
	const showOnlyPaid = true;

	// GET ALL
	const fetchOrders = async () => {
		try {
			setLoading(true);
			const { data } = await Api.get(`/service-orders/orders-all`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setOrders(data);
		} catch {
			toast.error("No se pudieron cargar las citas");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchOrders();
	}, []);

	const copyId = (id: string) => {
		navigator.clipboard.writeText(id);
		toast.success("ID copiado ✨");
	};

	// ❗ SweetAlert Cancelar
	const confirmCancel = async (id: string) => {
		const result = await Swal.fire({
			title: "¿Cancelar esta cita?",
			text: "Esta acción no se puede deshacer.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#d33",
			cancelButtonColor: "#3085d6",
			confirmButtonText: "Sí, cancelar",
			cancelButtonText: "No",
		});

		if (!result.isConfirmed) return;

		setProcessingId(id);

		try {
			await Api.patch(
				`/service-orders/${id}/cancel`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			toast.info("Cita cancelada");
			fetchOrders();
		} catch {
			toast.error("No se pudo cancelar la cita");
		} finally {
			setProcessingId(null);
		}
	};

	// ACEPTAR
	const confirmAccept = async (id: string) => {
		const result = await Swal.fire({
			title: "¿Aceptar esta cita?",
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: "#1d2846",
			cancelButtonColor: "#aaa",
			confirmButtonText: "Aceptar",
			cancelButtonText: "Cancelar",
		});

		if (!result.isConfirmed) return;

		setProcessingId(id);

		try {
			await Api.patch(
				`/service-orders/${id}/confirm`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			toast.success("Cita aceptada");
			fetchOrders();
		} catch {
			toast.error("No se pudo aceptar la cita");
		} finally {
			setProcessingId(null);
		}
	};

	// ---------------- FILTROS ----------------
	const filteredOrders = orders
		.filter((o) => o.payments?.[0]?.status === "approved") // SOLO PAGADAS
		.filter((o) => {
			if (activeTab === "upcoming") return ["pending", "accepted"].includes(o.status);
			if (activeTab === "completed") return o.status === "completed";
			if (activeTab === "cancelled") return o.status === "cancelled";
			return true;
		})
		.filter((o) =>
			search.trim() ? o.id.toLowerCase().includes(search.toLowerCase()) : true
		);

	const statusText = {
		pending: "Pendiente",
		accepted: "Aceptada",
		cancelled: "Cancelada",
		completed: "Finalizada",
	};

	const statusBadge = (status: string) => {
		const colors: any = {
			pending: "bg-yellow-100 text-yellow-700",
			accepted: "bg-green-100 text-green-700",
			cancelled: "bg-red-100 text-red-700",
			completed: "bg-gray-200 text-gray-700",
		};
		return colors[status] || "bg-gray-200 text-gray-700";
	};

	// ------------------------ RENDER ------------------------
	return (
		<main className="max-w-7xl mx-auto mt-10 px-4 font-nunito">
			<h1 className="text-3xl font-bold text-[var(--color-primary)] mb-6 flex items-center gap-3">
				<FontAwesomeIcon icon={faCalendarDays} />
				Gestión de Citas
			</h1>

			{/* 🔍 BUSCADOR */}
			<div className="relative mb-6 max-w-md">
				<FontAwesomeIcon
					icon={faSearch}
					className="absolute left-3 top-3 text-gray-400 text-sm"
				/>
				<input
					type="text"
					placeholder="Buscar por ID..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)]"
				/>
			</div>

			{/* ---------------- TABS ---------------- */}
			<div className="flex gap-3 mb-8 flex-wrap">
				{[
					{ key: "all", label: "Todas" },
					{ key: "upcoming", label: "Próximas" },
					{ key: "completed", label: "Finalizadas" },
					{ key: "cancelled", label: "Canceladas" },
				].map((t) => (
					<motion.button
						key={t.key}
						whileTap={{ scale: 0.97 }}
						onClick={() => setActiveTab(t.key as any)}
						className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
							activeTab === t.key
								? "bg-[var(--color-primary)] text-white shadow"
								: "border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
						}`}
					>
						{t.label}
					</motion.button>
				))}
			</div>

			{/* ---------------- TABLE ---------------- */}
			{loading ? (
				<div className="text-center text-gray-500 py-5">
					<FontAwesomeIcon icon={faSpinner} spin /> Cargando...
				</div>
			) : filteredOrders.length === 0 ? (
				<p className="text-center text-gray-500 py-8">
					No hay citas en esta categoría
				</p>
			) : (
				<table className="w-full text-[13px] border-collapse">
					<thead>
						<tr className="border-b bg-gray-200 text-left">
							<th className="py-3 px-4">ID</th>
							<th className="py-3 px-4">Servicio</th>
							<th className="py-3 px-4">Cliente</th>
							<th className="py-3 px-4">Proveedor</th>
							<th className="py-3 px-4">Dirección</th>
							<th className="py-3 px-4">Pago</th>
							<th className="py-3 px-4">Estado</th>
							<th className="py-3 px-4 text-center">Acciones</th>
						</tr>
					</thead>

					<tbody>
						{filteredOrders.map((o) => {
							const amount = o.payments?.[0]?.amount || o.service.price;

							const address = [
								o.address?.address,
								o.address?.neighborhood,
								o.address?.city?.name,
								o.address?.region?.name,
							]
								.filter(Boolean)
								.join(", ");

							return (
								<tr key={o.id} className="border-b hover:bg-gray-50">
									<td className="py-3 px-4">
										<div className="flex items-center gap-2">
											<span className="text-[11px]">{o.id}</span>
											<button
												onClick={() => copyId(o.id)}
												className="text-[var(--color-primary)]"
											>
												<FontAwesomeIcon icon={faCopy} size="sm" />
											</button>
										</div>
									</td>

									<td className="py-3 px-4">{o.service.name}</td>

									<td className="py-3 px-4 capitalize">
										{o.user.names} {o.user.surnames}
									</td>

									<td className="py-3 px-4 capitalize">
										{o.provider.names} {o.provider.surnames}
									</td>

									<td className="py-3 px-4 max-w-[240px] truncate">
										{address}
									</td>

									<td className="py-3 px-4">
										<div className="flex flex-col gap-1">
											<span className="font-semibold text-[12px]">
												${amount}
											</span>
											<span className="text-[10px] px-2 py-0.5 rounded-md bg-green-100 text-green-700">
												Pagada
											</span>
										</div>
									</td>

									<td className="py-3 px-4">
										<span
											className={`text-[10px] px-2 py-0.5 rounded-md ${statusBadge(
												o.status
											)}`}
										>
											{statusText[o.status as keyof typeof statusText]}
										</span>
									</td>

									<td className="py-3 px-4 text-center">
										<div className="flex justify-center gap-3">

											{/* Ver detalles */}
											<button
												onClick={() => setSelectedOrder(o)}
												className="text-[var(--color-primary)]"
											>
												<FontAwesomeIcon icon={faEye} />
											</button>

											{/* ACEPTAR */}
											{o.status === "pending" && (
												<button
													onClick={() => confirmAccept(o.id)}
													className="text-green-600"
												>
													{processingId === o.id ? (
														<FontAwesomeIcon icon={faSpinner} spin />
													) : (
														<FontAwesomeIcon icon={faCheck} />
													)}
												</button>
											)}

											{/* CANCELAR */}
											{["pending", "accepted"].includes(o.status) && (
												<button
													onClick={() => confirmCancel(o.id)}
													className="text-red-600"
												>
													{processingId === o.id ? (
														<FontAwesomeIcon icon={faSpinner} spin />
													) : (
														<FontAwesomeIcon icon={faTrash} />
													)}
												</button>
											)}
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			)}

			{/* ---------------- MODAL ---------------- */}
			<AnimatePresence>
				{selectedOrder && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
						onClick={(e) => {
							if (e.target === e.currentTarget) setSelectedOrder(null);
						}}
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="bg-white p-6 w-full max-w-lg rounded-2xl shadow-xl relative"
						>
							<button
								onClick={() => setSelectedOrder(null)}
								className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
							>
								<FontAwesomeIcon icon={faXmark} size="lg" />
							</button>

							<h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">
								Detalles de la Orden
							</h2>

							<p className="text-sm mb-1">
								<strong>ID:</strong> {selectedOrder.id}
							</p>

							<p className="text-sm mb-1">
								<strong>Cliente:</strong>{" "}
								{selectedOrder.user.names} {selectedOrder.user.surnames}
							</p>

							<p className="text-sm mb-1">
								<strong>Proveedor:</strong>{" "}
								{selectedOrder.provider.names} {selectedOrder.provider.surnames}
							</p>

							<p className="text-sm mb-1">
								<strong>Servicio:</strong> {selectedOrder.service.name}
							</p>

							<p className="text-sm mb-1">
								<strong>Pago:</strong> $
								{selectedOrder.payments?.[0]?.amount ??
									selectedOrder.service.price}
							</p>

							<p className="text-sm mb-1">
								<strong>Dirección:</strong>{" "}
								{[
									selectedOrder.address?.address,
									selectedOrder.address?.neighborhood,
									selectedOrder.address?.city?.name,
									selectedOrder.address?.region?.name,
								]
									.filter(Boolean)
									.join(", ")}
							</p>

							{/* MAPA */}
							{selectedOrder.address?.lat && selectedOrder.address?.lng && (
								<div className="mt-4">
									<MapAddress
										lat={Number(selectedOrder.address.lat)}
										lng={Number(selectedOrder.address.lng)}
										height="200px"
									/>
								</div>
							)}

							<div className="flex justify-end gap-3 mt-6">
								{["pending", "accepted"].includes(selectedOrder.status) && (
									<button
										onClick={async () => {
											const result = await Swal.fire({
												title: "¿Cancelar esta cita?",
												text: "Esta acción no se puede deshacer.",
												icon: "warning",
												showCancelButton: true,
												confirmButtonColor: "#d33",
												cancelButtonColor: "#3085d6",
												confirmButtonText: "Sí, cancelar",
												cancelButtonText: "No",
											});

											if (result.isConfirmed) {
												await confirmCancel(selectedOrder.id);
												setSelectedOrder(null);
											}
										}}
										className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
									>
										Cancelar cita
									</button>
								)}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
