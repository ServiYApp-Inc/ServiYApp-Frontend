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
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

interface ServiceOrder {
	id: string;
	service: { name: string };
	user: { names: string; surnames: string; email: string };
	provider: { names: string; surnames: string; email: string };
	date: string;
	startTime: string;
	endTime: string;
	address: any;
	price: number;
	status: string;
}

export default function AdminAppointmentsPage() {
	const { token } = useAuthStore();
	const [orders, setOrders] = useState<ServiceOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [processingId, setProcessingId] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<
		"all" | "upcoming" | "completed" | "cancelled"
	>("all");

	// Obtener TODAS las citas del sistema
	const fetchOrders = async () => {
		try {
			setLoading(true);
			const { data } = await Api.get(`/service-orders/orders-all`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setOrders(data);
		} catch (error) {
			console.error("Error obteniendo órdenes:", error);
			toast.error("No se pudieron cargar las citas");
		} finally {
			setLoading(false);
		}
	};

	const handleConfirm = async (id: string) => {
		setProcessingId(id);
		try {
			await Api.patch(`/service-orders/${id}/confirm`, null, {
				headers: { Authorization: `Bearer ${token}` },
			});
			toast.success("Cita confirmada");
			await fetchOrders();
		} catch (error) {
			console.error("Error confirmando cita:", error);
			toast.error("No se pudo confirmar la cita");
		} finally {
			setProcessingId(null);
		}
	};

	const handleCancel = async (id: string) => {
		setProcessingId(id);
		try {
			await Api.patch(`/service-orders/${id}/cancel`, null, {
				headers: { Authorization: `Bearer ${token}` },
			});
			toast.info("Cita cancelada");
			await fetchOrders();
		} catch (error) {
			console.error("Error cancelando cita:", error);
			toast.error("No se pudo cancelar la cita");
		} finally {
			setProcessingId(null);
		}
	};

	// Filtros por pestañas
	const filteredOrders = orders.filter((order) => {
		if (activeTab === "all") return true;
		if (activeTab === "upcoming")
			return order.status === "pending" || order.status === "accepted";
		if (activeTab === "completed") return order.status === "completed";
		if (activeTab === "cancelled") return order.status === "cancelled";
		return true;
	});

	useEffect(() => {
		fetchOrders();
	}, [token]);

	return (
		<main className="max-w-7xl mx-auto mt-10 px-4 font-nunito">
			{/* TÍTULO */}
			<h1 className="text-3xl font-bold text-[var(--color-primary)] mb-6 flex items-center gap-3">
				<FontAwesomeIcon
					icon={faCalendarDays}
					className="text-[var(--color-primary)]"
				/>
				Gestión de Citas
			</h1>

			{/* TABS */}
			<div className="flex gap-3 mb-8 flex-wrap">
				{[
					{ key: "all", label: "Todas" },
					{ key: "upcoming", label: "Próximas" },
					{ key: "completed", label: "Finalizadas" },
					{ key: "cancelled", label: "Canceladas" },
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

			{/* TABLA */}
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
									Proveedor
								</th>
								{/* <th className="py-3 px-4 font-semibold">
									Fecha
								</th> */}
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
								const formattedAddress =
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
										<td className="py-3 px-4 capitalize">
											{order.provider?.names}{" "}
											{order.provider?.surnames}
										</td>
										{/* <td className="py-3 px-4">
											{new Date(order.date).toLocaleDateString(
												"es-MX",
												{
													day: "2-digit",
													month: "short",
													year: "numeric",
												}
											)}{" "}
											{order.startTime}
										</td> */}
										<td className="py-3 px-4 truncate max-w-[220px]">
											<span className="text-[var(--color-primary)] underline cursor-pointer">
												{formattedAddress}
											</span>
										</td>
										<td className="py-3 px-4">
											${order.price}
										</td>

										{/* Estado */}
										<td
											className={`py-3 px-4 font-semibold ${
												order.status === "accepted"
													? "text-green-600"
													: order.status === "pending"
													? "text-yellow-600"
													: order.status ===
													  "completed"
													? "text-gray-500"
													: order.status ===
													  "cancelled"
													? "text-red-500"
													: "text-gray-400"
											}`}
										>
											{order.status === "accepted"
												? "Confirmada"
												: order.status === "pending"
												? "Pendiente"
												: order.status === "completed"
												? "Finalizada"
												: order.status === "cancelled"
												? "Cancelada"
												: order.status}
										</td>

										{/* Acciones */}
										<td className="py-3 px-4 text-center">
											{order.status === "pending" ? (
												<button
													onClick={() =>
														handleConfirm(order.id)
													}
													disabled={
														processingId ===
														order.id
													}
													className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mx-auto"
												>
													{processingId ===
													order.id ? (
														<>
															<FontAwesomeIcon
																icon={faSpinner}
																spin
															/>
															Confirmando...
														</>
													) : (
														<>
															<FontAwesomeIcon
																icon={faCheck}
															/>
															Confirmar
														</>
													)}
												</button>
											) : order.status === "accepted" ? (
												<button
													onClick={() =>
														handleCancel(order.id)
													}
													disabled={
														processingId ===
														order.id
													}
													className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mx-auto"
												>
													{processingId ===
													order.id ? (
														<FontAwesomeIcon
															icon={faSpinner}
															spin
														/>
													) : (
														<FontAwesomeIcon
															icon={faTimes}
														/>
													)}
													Cancelar
												</button>
											) : (
												<span className="text-gray-400 text-sm">
													—
												</span>
											)}
										</td>
									</motion.tr>
								);
							})}
						</tbody>
					</table>
				)}
			</section>
		</main>
	);
}
