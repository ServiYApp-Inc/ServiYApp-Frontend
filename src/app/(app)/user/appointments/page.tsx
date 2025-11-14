"use client";

import { useEffect, useState } from "react";
import { Api } from "@/app/services/api";
import { useAuthStore } from "@/app/store/auth.store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faMapMarkerAlt,
	faTimes,
	faCopy,
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
		photos?: string[] | null;
	};

	provider: {
		id: string;
		names: string;
		surnames: string;
		email: string;
		phone: string;
		profilePicture?: string;
	};

	payments?: {
		amount: string;
		status: string;
	}[];
}

export default function UserAppointmentsPage() {
	const { user, token } = useAuthStore();
	const [orders, setOrders] = useState<ServiceOrder[]>([]);
	const [showUnpaid, setShowUnpaid] = useState(false);
	const [tab, setTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
	const [loading, setLoading] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

	useEffect(() => {
		if (user?.id) fetchOrders();
	}, [user]);

	const fetchOrders = async () => {
		setLoading(true);
		try {
			const { data } = await Api.get(`service-orders/user/${user?.id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setOrders(data);
		} catch (err) {
			console.error("❌ Error:", err);
			toast.error("Error al cargar tus reservas");
		} finally {
			setLoading(false);
		}
	};

	// CANCELAR
	const handleCancel = async (id: string) => {
		try {
			await Api.patch(`service-orders/${id}/cancel`, {}, {
				headers: { Authorization: `Bearer ${token}` },
			});
			toast.success("Cita cancelada");
			fetchOrders();
			setSelectedOrder(null);
		} catch {
			toast.error("No se pudo cancelar la cita");
		}
	};

	// ------------------------------------
	//  FILTRO PRINCIPAL (por payment)
	// ------------------------------------

	const filteredByPayment = orders.filter((o) => {
		const isPaid = o.payments?.[0]?.status === "approved";
		return showUnpaid ? true : isPaid;
	});

	// ------------------------------------
	//  FILTROS DE TABS
	// ------------------------------------

	const finalFiltered = filteredByPayment.filter((o) => {
		if (tab === "upcoming") return o.status === "paid" || o.status === "accepted";
		if (tab === "completed") return o.status === "completed";
		if (tab === "cancelled") return o.status === "cancelled";
		return true;
	});

	const upcomingPaid = finalFiltered.filter((o) => o.status === "paid");
	const upcomingAccepted = finalFiltered.filter((o) => o.status === "accepted");

	// ------------------------------------
	//  BADGES
	// ------------------------------------

	const getStatusColor = (status: string) => {
		switch (status) {
			case "paid": return "bg-blue-100 text-blue-700";
			case "accepted": return "bg-green-100 text-green-700";
			case "completed": return "bg-gray-100 text-gray-700";
			case "cancelled": return "bg-red-100 text-red-700";
			default: return "bg-gray-200 text-gray-600";
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "paid": return "Pagada (pendiente de aceptación)";
			case "accepted": return "Aceptada";
			case "completed": return "Completada";
			case "cancelled": return "Cancelada";
			default: return status;
		}
	};

	const getPaymentBadge = (payments?: any[]) => {
		const isPaid = payments?.[0]?.status === "approved";
		return (
			<span
				className={`text-[10px] px-2 py-0.5 rounded-md ${
					isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
				}`}
			>
				{isPaid ? "Pagada" : "No pagada"}
			</span>
		);
	};

	const getPrice = (o: ServiceOrder) =>
		o.payments?.[0]?.amount || "0.00";

	// ------------------------------------
	//  COMPONENTE DE TARJETA
	// ------------------------------------

	const AppointmentCard = (order: ServiceOrder, showCancel = false) => (
		<motion.div
			key={order.id}
			whileHover={{ scale: 1.02 }}
			className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition-all"
		>
			<div className="relative w-full h-48">
				<img
					src={order.service?.photos?.[0] || "/default-service.jpg"}
					className="w-full h-full object-cover"
				/>
				<span
					className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-semibold ${getStatusColor(
						order.status
					)}`}
				>
					{getStatusText(order.status)}
				</span>
			</div>

			<div className="p-5 space-y-2">

				{/* ID */}
				<div className="flex items-center gap-2">
					<span className="text-[10px] text-gray-500 break-all">
						ID: {order.id}
					</span>
					<button
						onClick={() => navigator.clipboard.writeText(order.id)}
						className="text-xs text-[var(--color-primary)] hover:opacity-70"
					>
						<FontAwesomeIcon icon={faCopy} />
					</button>
				</div>

				<h3 className="text-lg font-semibold text-[var(--color-primary)]">
					{order.service?.name}
				</h3>

				<p className="text-sm text-gray-500">
					{order.provider.names} {order.provider.surnames}
				</p>

				{/* Dirección */}
				{order.address && (
					<p className="flex items-center gap-2 text-sm text-gray-700">
						<FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 w-4 h-4" />
						{order.address.name}, {order.address.address}
					</p>
				)}

				{/* Pago */}
				<div className="flex items-center gap-2 pt-2">
					<span className="text-sm font-semibold">${getPrice(order)}</span>
					{getPaymentBadge(order.payments)}
				</div>

				<div className="flex justify-between items-center pt-4">
					{showCancel && (
						<button
							onClick={() => handleCancel(order.id)}
							className="px-4 py-1 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
						>
							Cancelar
						</button>
					)}
					<button
						onClick={() => setSelectedOrder(order)}
						className="px-4 py-1 text-sm rounded-lg text-white"
						style={{ backgroundColor: "var(--color-primary)" }}
					>
						Ver Detalles
					</button>
				</div>
			</div>
		</motion.div>
	);

	// ------------------------------------
	//  RENDER
	// ------------------------------------

	return (
		<main className="px-6 py-10 min-h-screen" style={{ backgroundColor: "var(--background)" }}>
			<h1 className="text-3xl font-bold mb-8 text-[var(--color-primary)]">
				Mis reservas
			</h1>

			{/* TOGGLE */}
			<div className="flex items-center gap-3 mb-8">
				<label className="text-sm font-medium text-[var(--color-primary)]">
					Mostrar citas no pagadas
				</label>

				<button
					onClick={() => setShowUnpaid(!showUnpaid)}
					className={`w-12 h-6 rounded-full p-1 transition-all ${
						showUnpaid ? "bg-[var(--color-primary)]" : "bg-gray-300"
					}`}
				>
					<div
						className={`h-4 w-4 bg-white rounded-full transition-all ${
							showUnpaid ? "translate-x-6" : "translate-x-0"
						}`}
					/>
				</button>
			</div>

			{/* TABS */}
			<div className="flex gap-3 mb-8">
				{[
					{ key: "upcoming", label: "Próximas" },
					{ key: "completed", label: "Completadas" },
					{ key: "cancelled", label: "Canceladas" },
				].map((t) => (
					<button
						key={t.key}
						onClick={() => setTab(t.key as any)}
						className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
							tab === t.key
								? "bg-[var(--color-primary)] text-white"
								: "border border-[var(--color-primary)] text-[var(--color-primary)]"
						}`}
					>
						{t.label}
					</button>
				))}
			</div>

			{/* CONTENIDO */}
			{loading ? (
				<p className="text-center text-gray-500 mt-10">Cargando...</p>
			) : finalFiltered.length === 0 ? (
				<p className="text-center text-gray-500 mt-10">No hay resultados.</p>
			) : tab === "upcoming" ? (
				<>
					{upcomingPaid.length > 0 && (
						<>
							<h2 className="text-xl font-bold text-[var(--color-primary)] mb-3">
								💳 Pagadas
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
								{upcomingPaid.map((o) => AppointmentCard(o, true))}
							</div>
						</>
					)}

					{upcomingAccepted.length > 0 && (
						<>
							<h2 className="text-xl font-bold text-[var(--color-primary)] mt-8 mb-3">
								📅 Aceptadas
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
								{upcomingAccepted.map((o) => AppointmentCard(o, true))}
							</div>
						</>
					)}
				</>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
					{finalFiltered.map((o) => AppointmentCard(o))}
				</div>
			)}

			{/* MODAL */}
			<AnimatePresence>
				{selectedOrder && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95 }}
							className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden"
						>
							<div className="relative h-48">
								<img
									src={selectedOrder.service?.photos?.[0]}
									className="w-full h-full object-cover"
								/>
								<button
									onClick={() => setSelectedOrder(null)}
									className="absolute top-3 left-3 p-2 bg-black/40 rounded-full text-white text-sm"
								>
									<FontAwesomeIcon icon={faTimes} />
								</button>
							</div>

							<div className="p-6">
								{/* ID */}
								<div className="flex items-center gap-2 mb-2">
									<span className="text-[11px] text-gray-500 break-all">
										ID: {selectedOrder.id}
									</span>
									<button
										onClick={() =>
											navigator.clipboard.writeText(selectedOrder.id)
										}
										className="text-xs text-[var(--color-primary)]"
									>
										<FontAwesomeIcon icon={faCopy} />
									</button>
								</div>

								<h2 className="text-xl font-bold text-[var(--color-primary)]">
									{selectedOrder.service?.name}
								</h2>

								<p className="text-sm text-gray-500 mb-4">
									{selectedOrder.provider.names} {selectedOrder.provider.surnames}
								</p>

								{/* Info */}
								<div className="text-sm text-gray-700 space-y-2">
									<p>
										<strong>Correo:</strong> {selectedOrder.provider.email}
									</p>
									<p>
										<strong>Teléfono:</strong> {selectedOrder.provider.phone}
									</p>
									{selectedOrder.address && (
										<p>
											<strong>Dirección:</strong>{" "}
											{selectedOrder.address.name}, {selectedOrder.address.address}
										</p>
									)}
								</div>

								{/* Cancelar */}
								{["paid", "accepted"].includes(selectedOrder.status) && (
									<div className="mt-6 flex justify-end">
										<button
											onClick={() => handleCancel(selectedOrder.id)}
											className="px-5 py-2 text-white rounded-lg shadow-md"
											style={{ backgroundColor: "var(--color-primary)" }}
										>
											Cancelar cita
										</button>
									</div>
								)}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
