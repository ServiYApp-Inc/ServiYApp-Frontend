"use client";

import { useEffect, useState } from "react";
import { Api } from "@/app/services/api";
import { useAuthStore } from "@/app/store/auth.store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCheck,
	faSpinner,
	faCalendarDays,
	faTimes,
	faEye,
	faXmark,
	faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import StartConversation from "@/app/components/StartConversationButton";

interface ServiceOrder {
	id: string;
	service: { name: string };
	user: { names: string; surnames: string; email: string };
	date: string;
	startTime: string;
	endTime: string;
	address: any;
	price: number;
	status: string;
}

export default function ProviderAppointmentsPage() {
	const { user, token } = useAuthStore();
	const [orders, setOrders] = useState<ServiceOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [processingId, setProcessingId] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<
		"upcoming" | "cancelled" | "completed"
	>("upcoming");
	const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(
		null
	);
	const [search, setSearch] = useState("");
	const [showOnlyPaid, setShowOnlyPaid] = useState(true);

	// Obtener citas
	const fetchOrders = async () => {
		try {
			if (!user?.id || !token) return;
			setLoading(true);
			const { data } = await Api.get(
				`/service-orders/provider/${user.id}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setOrders(data);
		} catch {
			toast.error("No se pudieron cargar las citas");
		} finally {
			setLoading(false);
		}
	};

	// Confirmar cita
	const handleConfirm = async (id: string) => {
		setProcessingId(id);
		try {
			await Api.patch(`service-orders/${id}/confirm`, null, {
				headers: { Authorization: `Bearer ${token}` },
			});
			toast.success("Cita confirmada ✅");
			await fetchOrders();
			setSelectedOrder(null);
		} catch {
			toast.error("No se pudo confirmar la cita");
		} finally {
			setProcessingId(null);
		}
	};

	// Cancelar cita
	const handleCancel = async (id: string) => {
		setProcessingId(id);
		try {
			await Api.patch(`service-orders/${id}/cancel`, null, {
				headers: { Authorization: `Bearer ${token}` },
			});
			toast.info("Cita cancelada");
			await fetchOrders();
			setSelectedOrder(null);
		} catch {
			toast.error("No se pudo cancelar la cita");
		} finally {
			setProcessingId(null);
		}
	};

	const filteredOrders = orders.filter((order) => {
		if (activeTab === "upcoming")
			return order.status === "pending" || order.status === "accepted";
		if (activeTab === "cancelled") return order.status === "cancelled";
		if (activeTab === "completed") return order.status === "completed";
		return true;
	});

	useEffect(() => {
		if (user && token) fetchOrders();
	}, [user, token]);

	return (
		<main className="max-w-6xl mx-auto mt-10 px-4 font-nunito">
			{/* Título */}
			<h1 className="font-bold text-[var(--color-primary)] text-[48px] mt-10 text-center md:text-left">
				Mis Citas
			</h1>

			<StartConversation />

			{/* SEARCH */}
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

			{/* TOGGLE PAGADAS */}
			<div className="flex items-center gap-2 mb-6">
				<input
					type="checkbox"
					checked={!showOnlyPaid}
					onChange={() => setShowOnlyPaid(!showOnlyPaid)}
					className="h-4 w-4"
				/>
				<label className="text-sm text-gray-700">
					Mostrar NO pagadas
				</label>
			</div>

			{/* TABS */}
			<div className="flex gap-3 mb-8 flex-wrap">
				{[
					{ key: "upcoming", label: "Próximas" },
					{ key: "cancelled", label: "Canceladas" },
					{ key: "completed", label: "Finalizadas" },
				].map((tab) => {
					const active = activeTab === tab.key;
					return (
						<motion.button
							key={tab.key}
							whileTap={{ scale: 0.97 }}
							onClick={() => setActiveTab(tab.key as any)}
							className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
								active
									? "bg-[var(--color-primary)] text-white shadow-md"
									: "border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
							}`}
						>
							{tab.label}
						</motion.button>
					);
				})}
			</div>

			{/* Tabla */}
			<section>
				{loading ? (
					<div className="flex items-center justify-center text-gray-500">
						<FontAwesomeIcon
							icon={faSpinner}
							spin
							className="mr-2"
						/>
						Cargando citas...
					</div>
				) : filteredOrders.length === 0 ? (
					<p className="text-center text-gray-500 py-10">
						No hay citas en esta categoría.
					</p>
				) : (
					<table className="min-w-full text-sm border-collapse">
						<thead>
							<tr className="border-b text-left bg-gray-200">
								<th className="py-3 px-4 font-semibold">
									Servicio
								</th>
								<th className="py-3 px-4 font-semibold">
									Cliente
								</th>
								<th className="py-3 px-4 font-semibold">
									Dirección
								</th>
								<th className="py-3 px-4 font-semibold">
									Pago
								</th>
								<th className="py-3 px-4 font-semibold">
									Estado
								</th>
								<th className="py-3 px-4 font-semibold text-center">
									Acciones
								</th>
							</tr>
						</thead>
						<tbody>
							{filteredOrders.map((order) => {
								const addressText =
									typeof order.address === "object"
										? [
												order.address?.address,
												order.address?.neighborhood,
												order.address?.city?.name,
												order.address?.region?.name,
										  ]
												.filter(Boolean)
												.join(", ")
										: order.address || "Sin dirección";

								return (
									<motion.tr
										key={order.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										className="border-b hover:bg-gray-50 transition-all"
									>
										<td className="py-3 px-4">
											{order.service?.name}
										</td>
										<td className="py-3 px-4 capitalize">
											{order.user?.names}{" "}
											{order.user?.surnames}
										</td>
										<td className="py-3 px-4 truncate max-w-[220px]">
											{addressText}
										</td>
										<td className="py-3 px-4">
											${order.price}
										</td>
										<td
											className={`py-3 px-4 font-semibold ${
												order.status === "accepted"
													? "text-green-600"
													: order.status === "pending"
													? "text-yellow-600"
													: order.status ===
													  "cancelled"
													? "text-red-500"
													: "text-gray-500"
											}`}
										>
											{order.status === "accepted"
												? "Confirmada"
												: order.status === "pending"
												? "Pendiente"
												: order.status === "cancelled"
												? "Cancelada"
												: "Finalizada"}
										</td>

										{/* Acciones */}
										<td className="py-3 px-4 text-center">
											<div className="flex justify-center gap-3">
												{/* Ver detalles */}
												<button
													onClick={() =>
														setSelectedOrder(order)
													}
													className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
													title="Ver detalles"
												>
													<FontAwesomeIcon
														icon={faEye}
													/>
												</button>

												{/* Aceptar */}
												{order.status === "pending" && (
													<button
														onClick={() =>
															handleConfirm(
																order.id
															)
														}
														disabled={
															processingId ===
															order.id
														}
														className="text-green-600 hover:text-green-700"
														title="Aceptar cita"
													>
														{processingId ===
														order.id ? (
															<FontAwesomeIcon
																icon={faSpinner}
																spin
															/>
														) : (
															<FontAwesomeIcon
																icon={faCheck}
															/>
														)}
													</button>
												)}

												{/* Rechazar */}
												{order.status === "pending" && (
													<button
														onClick={() =>
															handleCancel(
																order.id
															)
														}
														disabled={
															processingId ===
															order.id
														}
														className="text-red-500 hover:text-red-600"
														title="Rechazar cita"
													>
														<FontAwesomeIcon
															icon={faTimes}
														/>
													</button>
												)}
											</div>
										</td>
									</motion.tr>
								);
							})}
						</tbody>
					</table>
				)}
			</section>

			{/* MODAL DE DETALLES */}
			<AnimatePresence>
				{selectedOrder && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative"
						>
							<button
								onClick={() => setSelectedOrder(null)}
								className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
							>
								<FontAwesomeIcon icon={faXmark} />
							</button>

							<h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
								Detalles de la cita
							</h2>

							<div className="space-y-3 text-gray-700">
								<p>
									<strong>Cliente:</strong>{" "}
									{selectedOrder.user.names}{" "}
									{selectedOrder.user.surnames}
								</p>
								<p>
									<strong>Servicio:</strong>{" "}
									{selectedOrder.service.name}
								</p>
								<p>
									<strong>Fecha:</strong> {selectedOrder.date}
								</p>
								<p>
									<strong>Horario:</strong>{" "}
									{selectedOrder.startTime} -{" "}
									{selectedOrder.endTime}
								</p>
								<p>
									<strong>Precio:</strong> $
									{selectedOrder.price}
								</p>
								<p>
									<strong>Dirección:</strong>{" "}
									{selectedOrder.address?.address ||
										"No disponible"}
								</p>
								<p>
									<strong>Estado:</strong>{" "}
									<span className="capitalize">
										{selectedOrder.status}
									</span>
								</p>
							</div>

							{/* Botones dentro del modal */}
							{selectedOrder.status === "pending" && (
								<div className="flex justify-end gap-3 mt-8">
									<button
										onClick={() =>
											handleCancel(selectedOrder.id)
										}
										className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
									>
										Rechazar
									</button>
									<button
										onClick={() =>
											handleConfirm(selectedOrder.id)
										}
										className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-all"
									>
										Aceptar
									</button>
								</div>
							)}
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
