"use client";

import { useEffect, useState } from "react";
import { Api } from "@/app/services/api";
import { useAuthStore } from "@/app/store/auth.store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCalendarAlt,
	faMapMarkerAlt,
	faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

interface ServiceOrder {
	id: string;
	status: string;
	createdAt: string;
	address?: {
		name: string;
		address: string;
		neighborhood?: string;
		buildingType?: string;
	};
	service?: {
		name: string;
		description?: string;
		photo?: string;
	};
	provider: {
		id: string;
		names: string;
		surnames: string;
		email: string;
		phone: string;
		profilePicture?: string;
	};
}

export default function UserAppointmentsPage() {
	const { user, token } = useAuthStore();
	const [orders, setOrders] = useState<ServiceOrder[]>([]);
	const [tab, setTab] = useState<"upcoming" | "completed" | "cancelled">(
		"upcoming"
	);
	const [loading, setLoading] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(
		null
	);

	useEffect(() => {
		if (user?.id) fetchOrders();
	}, [user]);

	const fetchOrders = async () => {
		setLoading(true);
		try {
			const { data } = await Api.get(`/service-orders/user/${user?.id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setOrders(data);
		} catch (err) {
			console.error("❌ Error al cargar reservas:", err);
			toast.error("Error al cargar tus reservas");
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = async (id: string) => {
		try {
			await Api.patch(
				`/service-orders/${id}/cancel`,
				{},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			toast.success("Cita cancelada correctamente");
			fetchOrders();
			setSelectedOrder(null);
		} catch (err) {
			console.error(err);
			toast.error("No se pudo cancelar la cita");
		}
	};

	const filteredOrders = orders.filter((o) => {
		if (tab === "upcoming")
			return o.status === "accepted" || o.status === "pending";
		if (tab === "cancelled") return o.status === "cancelled";
		if (tab === "completed") return o.status === "completed";

		return true;
	});

	const translateStatus = (status: string) => {
		switch (status) {
			case "pending":
				return "Pendiente";
			case "accepted":
				return "Confirmada";
			case "completed":
				return "Completada";
			case "cancelled":
				return "Cancelada";
			default:
				return status;
		}
	};

	return (
		<main
			className="flex flex-col px-6 py-10 min-h-screen transition-all duration-300"
			style={{ backgroundColor: "var(--background)" }}
		>
			<h1
				className="text-3xl font-bold mb-8 text-center md:text-left"
				style={{ color: "var(--color-primary)" }}
			>
				Mis reservas
			</h1>

			{/* TABS */}
			<div className="flex justify-center md:justify-start gap-3 mb-8">
				{[
					{ key: "upcoming", label: "Próximas" },
					{ key: "cancelled", label: "Canceladas" },
					{ key: "completed", label: "Completadas" },
				].map((t) => {
					const active = tab === t.key;
					return (
						<motion.button
							key={t.key}
							onClick={() => setTab(t.key as any)}
							whileTap={{ scale: 0.96 }}
							className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
								active
									? "bg-[var(--color-primary)] text-white shadow-md"
									: "border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
							}`}
						>
							{t.label}
						</motion.button>
					);
				})}
			</div>

			{/* LISTADO */}
			{loading ? (
				<p className="text-center text-gray-500 mt-10">
					Cargando reservas...
				</p>
			) : filteredOrders.length === 0 ? (
				<p className="text-center text-gray-500 mt-10">
					No hay citas en esta categoría.
				</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
					{filteredOrders.map((order) => (
						<motion.div
							key={order.id}
							whileHover={{ scale: 1.02 }}
							className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition-all"
						>
							{/* IMAGEN */}
							<div className="relative w-full h-48 overflow-hidden">
								<img
									src={
										order.service?.photo ||
										"/default-service.jpg"
									}
									alt={order.service?.name || "Servicio"}
									className="object-cover w-full h-full"
								/>
								{/* ESTADO */}
								<span
									className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
										order.status === "accepted"
											? "bg-green-100 text-green-700"
											: order.status === "pending"
											? "bg-yellow-100 text-yellow-700"
											: order.status === "completed"
											? "bg-gray-100 text-gray-700"
											: "bg-red-100 text-red-700"
									}`}
								>
									{translateStatus(order.status)}
								</span>
							</div>

							{/* CONTENIDO */}
							<div className="p-5 space-y-2">
								<h3 className="text-lg font-semibold text-[var(--color-primary)]">
									{order.service?.name || "Servicio"}
								</h3>
								<p className="text-sm text-gray-500">
									{order.provider.names}{" "}
									{order.provider.surnames}
								</p>

								{/* INFO */}
								<div className="mt-3 space-y-1 text-sm text-gray-700">
									{/* <p className="flex items-center gap-2">
										<FontAwesomeIcon
											icon={faCalendarAlt}
											className="text-gray-400 w-4 h-4"
										/>
										{new Date(
											order.createdAt
										).toLocaleString("es-MX", {
											day: "numeric",
											month: "long",
											year: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</p> */}

									{order.address && (
										<p className="flex items-center gap-2">
											<FontAwesomeIcon
												icon={faMapMarkerAlt}
												className="text-gray-400 w-4 h-4"
											/>
											{order.address.name},{" "}
											{order.address.address}
										</p>
									)}
								</div>

								{/* BOTONES */}
								<div className="flex justify-between items-center pt-4">
									{["accepted", "pending"].includes(
										order.status
									) && (
										<motion.button
											whileTap={{ scale: 0.97 }}
											onClick={() =>
												handleCancel(order.id)
											}
											className="px-4 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
										>
											Cancelar
										</motion.button>
									)}

									<motion.button
										whileTap={{ scale: 0.97 }}
										onClick={() => setSelectedOrder(order)}
										className="px-4 py-1 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-all"
										style={{
											backgroundColor:
												"var(--color-primary)",
										}}
									>
										Ver Detalles
									</motion.button>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			)}

			{/* MODAL DETALLES */}
			<AnimatePresence>
				{selectedOrder && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							transition={{ duration: 0.25 }}
							className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
						>
							{/* IMAGEN */}
							<div className="relative w-full h-48">
								<img
									src={
										selectedOrder.service?.photo ||
										"/default-service.jpg"
									}
									alt={selectedOrder.service?.name}
									className="object-cover w-full h-full"
								/>
								<span
									className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
										selectedOrder.status === "accepted"
											? "bg-green-100 text-green-700"
											: selectedOrder.status === "pending"
											? "bg-yellow-100 text-yellow-700"
											: selectedOrder.status ===
											  "completed"
											? "bg-gray-100 text-gray-600"
											: "bg-red-100 text-red-700"
									}`}
								>
									{translateStatus(selectedOrder.status)}
								</span>
								<button
									onClick={() => setSelectedOrder(null)}
									className="absolute top-3 left-3 text-white bg-black/30 hover:bg-black/40 rounded-full p-2"
								>
									<FontAwesomeIcon icon={faTimes} />
								</button>
							</div>

							{/* CONTENIDO */}
							<div className="p-6">
								<h2
									className="text-2xl font-bold text-[var(--color-primary)]"
									style={{ lineHeight: "1.2" }}
								>
									{selectedOrder.service?.name || "Servicio"}
								</h2>
								<p className="text-gray-500 text-sm mt-1 mb-4">
									{selectedOrder.provider.names}{" "}
									{selectedOrder.provider.surnames}
								</p>

								<div className="space-y-2 text-sm text-gray-700">
									<p>
										<strong>Correo:</strong>{" "}
										{selectedOrder.provider.email}
									</p>
									<p>
										<strong>Teléfono:</strong>{" "}
										{selectedOrder.provider.phone}
									</p>
									{/* <p>
										<strong>Fecha:</strong>{" "}
										{new Date(
											selectedOrder.createdAt
										).toLocaleString("es-MX", {
											day: "numeric",
											month: "long",
											year: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</p> */}
									{selectedOrder.address && (
										<p>
											<strong>Dirección:</strong>{" "}
											{selectedOrder.address.name},{" "}
											{selectedOrder.address.address}
										</p>
									)}
								</div>

								{/* BOTONES */}
								<div className="mt-6 flex justify-end gap-3">
									{["accepted", "pending"].includes(
										selectedOrder.status
									) && (
										<button
											onClick={() =>
												handleCancel(selectedOrder.id)
											}
											className="px-5 py-2 rounded-lg font-semibold text-white shadow-md hover:shadow-lg transition-all"
											style={{
												backgroundColor:
													"var(--color-primary)",
											}}
										>
											Cancelar cita
										</button>
									)}
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
