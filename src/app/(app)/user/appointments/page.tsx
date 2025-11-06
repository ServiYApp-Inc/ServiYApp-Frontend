"use client";

import { useEffect, useState } from "react";
import { Api } from "@/app/services/api";
import { useAuthStore } from "@/app/store/auth.store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCalendarAlt,
	faClock,
	faMapMarkerAlt,
	faPhone,
	faEnvelope,
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
		userName?: string;
		profilePicture?: string;
		country?: { name: string; code: string; lada: string };
		region?: { name: string };
		city?: { name: string };
	};
}

export default function UserAppointmentsPage() {
	const { user, token } = useAuthStore();
	const [orders, setOrders] = useState<ServiceOrder[]>([]);
	const [tab, setTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
	const [loading, setLoading] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

	useEffect(() => {
		if (user?.id) fetchOrders();
	}, [user]);

	const fetchOrders = async () => {
		setLoading(true);
		try {
			console.log("📡 Fetching orders for:", user?.id);
			const { data } = await Api.get(`/service-orders/user/${user?.id}`, {
				params: { userId: user?.id },
				headers: { Authorization: `Bearer ${token}` },
			});
			console.log("🧩 Datos obtenidos del backend:", data);
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
			await Api.patch(`/service-orders/${id}/cancel`, {}, {
				headers: { Authorization: `Bearer ${token}` },
			});
			toast.success("Cita cancelada correctamente");
			fetchOrders();
			setSelectedOrder(null);
		} catch (err) {
			console.error(err);
			toast.error("No se pudo cancelar la cita");
		}
	};

	const filteredOrders = orders.filter((o) => {
		if (tab === "upcoming") return o.status === "accepted" || o.status === "pending";
		if (tab === "completed") return o.status === "finished";
		if (tab === "cancelled") return o.status === "cancelled";
		return true;
	});

	const translateStatus = (status: string) => {
		switch (status) {
			case "pending":
				return "Pendiente";
			case "accepted":
				return "Confirmado";
			case "finished":
				return "Completado";
			case "cancelled":
				return "Cancelado";
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
				className="text-3xl font-bold mb-8"
				style={{ color: "var(--color-primary)" }}
			>
				Mis reservas
			</h1>

			{/* TABS */}
			<div className="flex gap-3 mb-8">
				{[
					{ key: "upcoming", label: "Próximas" },
					{ key: "completed", label: "Completadas" },
					{ key: "cancelled", label: "Canceladas" },
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
									: "bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
							}`}
						>
							{t.label}
						</motion.button>
					);
				})}
			</div>

			{/* LISTADO */}
			{loading ? (
				<p className="text-center text-gray-500 mt-10">Cargando reservas...</p>
			) : filteredOrders.length === 0 ? (
				<p className="text-center text-gray-500 mt-10">
					No hay citas en esta categoría.
				</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
					{filteredOrders.map((order) => (
						<motion.div
							key={order.id}
							whileHover={{ scale: 1.02 }}
							className="p-5 rounded-2xl border border-gray-200 shadow-sm bg-[var(--color-bg-light)] hover:shadow-md transition-all"
						>
							{/* HEADER */}
							<div className="flex items-center gap-3 mb-3">
								{order.provider.profilePicture ? (
									<img
										src={order.provider.profilePicture}
										alt="provider"
										className="w-12 h-12 rounded-full object-cover"
									/>
								) : (
									<div
										className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg"
										style={{ backgroundColor: "var(--color-primary)" }}
									>
										{order.provider.names[0]}
									</div>
								)}
								<div>
									<h3 className="font-semibold text-lg">
										{order.provider.names} {order.provider.surnames}
									</h3>
									<p className="text-sm text-gray-500">
										{order.service?.name || "Servicio sin nombre"}
									</p>
								</div>
							</div>

							{/* INFO */}
							<div className="space-y-2 text-sm text-gray-700 mb-4">
								<p className="flex items-center gap-2">
									<FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 w-4 h-4" />
									{new Date(order.createdAt).toLocaleDateString("es-MX", {
										weekday: "long",
										day: "numeric",
										month: "long",
										year: "numeric",
									})}
								</p>

								{order.address && (
									<p className="flex items-center gap-2">
										<FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 w-4 h-4" />
										{order.address.name}, {order.address.address},{" "}
										{order.address.neighborhood || ""}{" "}
										{order.address.buildingType && `(${order.address.buildingType})`}
									</p>
								)}
							</div>

							{/* ESTADO */}
							<span
								className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
									order.status === "accepted"
										? "bg-green-100 text-green-700"
										: order.status === "pending"
										? "bg-yellow-100 text-yellow-700"
										: order.status === "cancelled"
										? "bg-red-100 text-red-700"
										: "bg-gray-100 text-gray-700"
								}`}
							>
								{translateStatus(order.status)}
							</span>

							{/* BOTONES */}
							<div className="flex justify-between items-center">
								{order.status !== "cancelled" && (
									<motion.button
										whileTap={{ scale: 0.97 }}
										onClick={() => handleCancel(order.id)}
										className="px-4 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
									>
										Cancelar
									</motion.button>
								)}

								<motion.button
									whileTap={{ scale: 0.97 }}
									onClick={() => setSelectedOrder(order)}
									className="px-4 py-1 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-all"
									style={{ backgroundColor: "var(--color-primary)" }}
								>
									Ver Detalles
								</motion.button>
							</div>
						</motion.div>
					))}
				</div>
			)}

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
							transition={{ duration: 0.25 }}
							className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative"
						>
							{/* Botón cerrar */}
							<button
								onClick={() => setSelectedOrder(null)}
								className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
							>
								<FontAwesomeIcon icon={faTimes} />
							</button>

							{/* Cabecera */}
							<div className="flex flex-col items-center mb-4">
								<img
									src={
										selectedOrder.service?.photo ||
										selectedOrder.provider.profilePicture ||
										"/default-service.jpg"
									}
									alt="Service"
									className="w-24 h-24 rounded-full object-cover border-4 border-[var(--color-primary)] shadow-md mb-3"
								/>
								<h2
									className="text-xl font-bold text-center"
									style={{ color: "var(--color-primary)" }}
								>
									{selectedOrder.service?.name || "Servicio"}
								</h2>
								<p className="text-sm text-gray-500 text-center">
									{selectedOrder.provider.names} {selectedOrder.provider.surnames}
								</p>
							</div>

							{/* Detalles */}
							<div className="space-y-3 text-gray-700 text-sm">
								<p>
									<strong>Correo:</strong> {selectedOrder.provider.email}
								</p>
								<p>
									<strong>Teléfono:</strong> {selectedOrder.provider.phone}
								</p>
								<p>
									<strong>Fecha:</strong>{" "}
									{new Date(selectedOrder.createdAt).toLocaleString("es-MX", {
										day: "numeric",
										month: "long",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</p>
								{selectedOrder.address && (
									<p>
										<strong>Dirección:</strong>{" "}
										{selectedOrder.address.name}, {selectedOrder.address.address},{" "}
										{selectedOrder.address.neighborhood || ""}{" "}
										{selectedOrder.address.buildingType &&
											`(${selectedOrder.address.buildingType})`}
									</p>
								)}
								<p>
									<strong>Estado:</strong> {translateStatus(selectedOrder.status)}
								</p>
							</div>

							{/* Botones */}
							<div className="mt-6 flex justify-between">
								<button
									onClick={() => setSelectedOrder(null)}
									className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
								>
									Cerrar
								</button>

								{selectedOrder.status !== "cancelled" && (
									<button
										onClick={() => handleCancel(selectedOrder.id)}
										className="px-4 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition"
										style={{ backgroundColor: "var(--color-primary)" }}
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
