"use client";

import { useEffect, useState } from "react";
import { Api } from "@/app/services/api";
import { useAuthStore } from "@/app/store/auth.store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faMapMarkerAlt,
	faTimes,
	faCopy,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import StartChatButton from "@/app/components/StartChatButton";
import MapAddress from "@/app/components/MapAddress";
import Swal from "sweetalert2";

// 🚀 IMPORTAMOS EL MISMO BOTÓN DE CHAT

interface ServiceOrder {
	id: string;
	status: string;
	createdAt: string;

	address?: {
		id: string;
		name: string;
		address: string;
		neighborhood?: string;
		buildingType?: string;

		lat: number | string;
		lng: number | string;

		city?: {
			id: string;
			name: string;
		};

		region?: {
			id: string;
			name: string;
		};

		country?: {
			id: string;
			name: string;
		};

		comments?: string;
		status?: boolean;
	};

	service?: {
		id?: string;
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
	const [tab, setTab] = useState<"upcoming" | "completed" | "cancelled">(
		"upcoming"
	);
	const [loading, setLoading] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(
		null
	);

	const router = useRouter();

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
			console.log(data);
		} catch (err) {
			console.error("❌ Error:", err);
			toast.error("Error al cargar tus reservas");
		} finally {
			setLoading(false);
		}
	};

	// CANCELAR (real)
	const handleCancel = async (id: string) => {
		try {
			await Api.patch(
				`service-orders/${id}/cancel`,
				{},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			toast.success("Cita cancelada");
			fetchOrders();
			setSelectedOrder(null);
		} catch {
			toast.error("No se pudo cancelar la cita");
		}
	};

	// CANCELAR con SweetAlert
	const confirmCancel = async (id: string) => {
		const result = await Swal.fire({
			title: "¿Seguro que quieres cancelar esta cita?",
			text: "Esta acción no se puede deshacer.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Sí, cancelar",
			cancelButtonText: "No, volver",
			confirmButtonColor: "#dc2626", // rojo
			cancelButtonColor: "#6b7280", // gris
			reverseButtons: true,
		});

		if (result.isConfirmed) {
			await handleCancel(id);
		}
	};

	// ------------------------------------
	//  FILTRO PRINCIPAL (solo pagadas)
	// ------------------------------------

	const filteredByPayment = orders.filter((o) => {
		const isPaid = o.payments?.[0]?.status === "approved";
		return isPaid;
	});

	// ------------------------------------
	//  FILTROS DE TABS
	// ------------------------------------

	const finalFiltered = filteredByPayment.filter((o) => {
		if (tab === "upcoming")
			return o.status === "paid" || o.status === "accepted";
		if (tab === "completed") return o.status === "completed";
		if (tab === "cancelled") return o.status === "cancelled";
		return true;
	});

	const upcomingPaid = finalFiltered.filter((o) => o.status === "paid");
	const upcomingAccepted = finalFiltered.filter(
		(o) => o.status === "accepted"
	);

	// ------------------------------------
	//  BADGES
	// ------------------------------------

	const getStatusColor = (status: string) => {
		switch (status) {
			case "paid":
				return "bg-blue-100 text-blue-700";
			case "accepted":
				return "bg-green-100 text-green-700";
			case "completed":
				return "bg-gray-100 text-gray-700";
			case "cancelled":
				return "bg-red-100 text-red-700";
			default:
				return "bg-gray-200 text-gray-600";
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "paid":
				return "Pagada (pendiente de aceptación)";
			case "accepted":
				return "Aceptada";
			case "completed":
				return "Completada";
			case "cancelled":
				return "Cancelada";
			default:
				return status;
		}
	};

	const getPaymentBadge = (payments?: any[]) => {
		const isPaid = payments?.[0]?.status === "approved";
		return (
			<span
				className={`text-[10px] px-2 py-0.5 rounded-md ${
					isPaid
						? "bg-green-100 text-green-700"
						: "bg-red-100 text-red-700"
				}`}
			>
				{isPaid ? "Pagada" : "No pagada"}
			</span>
		);
	};

	const getPrice = (o: ServiceOrder) => o.payments?.[0]?.amount || "0.00";

	// ------------------------------------
	//  COMPONENTE DE TARJETA
	// ------------------------------------
	const AppointmentCard = (order: ServiceOrder, showCancel = false) => (
		<motion.div
			key={order.id}
			whileHover={{ scale: 1.02 }}
			className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition-all"
		>
			{/* 🖼 Imagen */}
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

			{/* 📌 CONTENIDO */}
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

				{/* Nombre del servicio */}
				<h3 className="text-lg font-semibold text-[var(--color-primary)]">
					{order.service?.name}
				</h3>

				{/* Nombre del proveedor */}
				<p className="text-sm text-gray-500">
					{order.provider.names} {order.provider.surnames}
				</p>

				{/* Dirección */}
				{order.address && (
					<p className="flex items-center gap-2 text-sm text-gray-700">
						<FontAwesomeIcon
							icon={faMapMarkerAlt}
							className="text-gray-400 w-4 h-4"
						/>
						{order.address.name}, {order.address.address}
					</p>
				)}

				{/* Pago */}
				<div className="flex items-center gap-2 pt-2">
					<span className="text-sm font-semibold">
						${getPrice(order)}
					</span>
					{getPaymentBadge(order.payments)}
				</div>

				{/* BOTONES */}
				<div className="flex justify-between items-center pt-4">
					{/* 🟥 Cancelar cita (rojo, abajo izquierda) */}
					{showCancel && (
						<button
							onClick={() => confirmCancel(order.id)}
							className="flex items-center gap-2 px-1 py-1 text-sm rounded-lg text-red-600 hover:text-red-700 transition"
						>
							<FontAwesomeIcon
								icon={faTrash}
								className="w-3 h-3"
							/>
						</button>
					)}

					{/* Chat + Detalles (derecha) */}
					<div className="flex items-center gap-3 ml-auto">
						<button
            				onClick={() => router.push('/user/calendar')}
            				className="px-4 py-1 text-sm rounded-lg text-white"
            				style={{ backgroundColor: "var(--color-primary)" }} // Usa un color secundario para diferenciarlo
        				>
            				Ver Calendario
        				</button>
						
						{(order.status === "paid" ||
							order.status === "accepted") && (
							<div className="flex items-center gap-1 text-[var(--color-primary)] font-large text-l">
								<StartChatButton
									receiverId={order.provider.id}
									role="user"
								/>
							</div>
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
			</div>
		</motion.div>
	);

	// ------------------------------------
	//  RENDER
	// ------------------------------------

	return (
		<main
			className="px-6 py-10 min-h-screen"
			style={{ backgroundColor: "var(--background)" }}
		>
			<h1 className="text-3xl font-bold mb-8 text-[var(--color-primary)]">
				Mis reservas
			</h1>

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
				<p className="text-center text-gray-500 mt-10">
					No hay resultados.
				</p>
			) : tab === "upcoming" ? (
				<>
					{upcomingPaid.length > 0 && (
						<>
							<h2 className="text-xl font-bold text-[var(--color-primary)] mb-3">
								💳 Pagadas
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
								{upcomingPaid.map((o) =>
									AppointmentCard(o, true)
								)}
							</div>
						</>
					)}

					{upcomingAccepted.length > 0 && (
						<>
							<h2 className="text-xl font-bold text-[var(--color-primary)] mt-8 mb-3">
								📅 Aceptadas
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
								{upcomingAccepted.map((o) =>
									AppointmentCard(o, true)
								)}
							</div>
						</>
					)}
				</>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
					{finalFiltered.map((o) => AppointmentCard(o, true))}
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
							className="bg-white rounded-3xl overflow-hidden max-h-[90vh] w-full max-w-md shadow-xl flex flex-col"
						>
							{/* Imagen */}
							<div className="relative h-44 flex-shrink-0">
								<img
									src={
										selectedOrder.service?.photos?.[0] ||
										"/default-service.jpg"
									}
									className="w-full h-full object-cover"
								/>

								<button
									onClick={() => setSelectedOrder(null)}
									className="absolute top-3 left-3 p-2 bg-black/40 rounded-full text-white text-sm"
								>
									<FontAwesomeIcon icon={faTimes} />
								</button>

								{["paid", "accepted"].includes(
									selectedOrder.status
								) && (
									<button
										onClick={() =>
											confirmCancel(selectedOrder.id)
										}
										className="absolute top-3 right-3 p-2 rounded-full bg-red-600 text-white shadow-md"
										title="Cancelar cita"
									>
										<FontAwesomeIcon icon={faTrash} />
									</button>
								)}
							</div>

							{/* CONTENIDO */}
							<div className="p-6 overflow-y-auto flex-1">
								{/* ID */}
								<div className="flex items-center gap-2 mb-2">
									<span className="text-[11px] text-gray-500 break-all">
										ID: {selectedOrder.id}
									</span>
									<button
										onClick={() =>
											navigator.clipboard.writeText(
												selectedOrder.id
											)
										}
										className="text-xs text-[var(--color-primary)]"
									>
										<FontAwesomeIcon icon={faCopy} />
									</button>
								</div>

								{/* Nombre servicio */}
								<h2 className="text-2xl font-bold text-[var(--color-primary)] leading-tight">
									{selectedOrder.service?.name}
								</h2>

								{/* Proveedor */}
								<div className="flex flex-row items-center gap-0">
									<p className="text-sm font-semibold text-[var(--color-primary)]">
										Servicio por:{" "}
										<span className="text-gray-700 font-medium">
											{selectedOrder.provider.names}{" "}
											{selectedOrder.provider.surnames}
										</span>
									</p>

									<StartChatButton
										receiverId={selectedOrder.provider.id}
										role="user"
									/>
								</div>

								{/* Datos contacto */}
								<div className="text-sm text-gray-700 space-y-3 gap-2">
									<p>
										<strong>Correo:</strong>{" "}
										{selectedOrder.provider.email}
									</p>
									<p>
										<strong>Teléfono:</strong>{" "}
										{selectedOrder.provider.phone}
									</p>
								</div>

								{/* DIRECCIÓN UNA SOLA LÍNEA */}
								{selectedOrder.address && (
									<div className="text-sm text-gray-700 gap-3">
										<p className="font-semibold text-[var(--color-primary)] space-y-3 ">
											Dirección:
										</p>

										<p>
											{[
												selectedOrder.address.name,
												selectedOrder.address.address,
												selectedOrder.address
													.neighborhood,
												selectedOrder.address.city
													?.name,
												selectedOrder.address.region
													?.name,
												selectedOrder.address.country
													?.name,
											]
												.filter(Boolean)
												.join(", ")}
										</p>
									</div>
								)}

								{/* Mapa */}
								{selectedOrder.address?.lat &&
									selectedOrder.address?.lng && (
										<div className="mt-4">
											<MapAddress
												lat={Number(
													selectedOrder.address.lat
												)}
												lng={Number(
													selectedOrder.address.lng
												)}
												height="200px"
											/>
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
