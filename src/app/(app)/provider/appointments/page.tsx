"use client";

import { useEffect, useState } from "react";
import { Api } from "@/app/services/api";
import { useAuthStore } from "@/app/store/auth.store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSpinner,
	faEye,
	faCheck,
	faTimes,
	faSearch,
	faCopy,
	faTrash,
	faStar,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import StartChatButton from "@/app/components/StartChatButton";
import MapAddress from "@/app/components/MapAddress";
import Swal from "sweetalert2";

// ---------------------------------------------------------
// TYPES
// ---------------------------------------------------------
interface ServiceOrder {
	id: string;
	status: string;
	createdAt: string;

	user: {
		id: string;
		names: string;
		surnames: string;
		email: string;
		phone: string;
	};

	service: {
		name: string;
		photos?: string[];
		price?: number;
	};

	address: {
		address: string;
		neighborhood?: string;
		city?: { name: string };
		region?: { name: string };
		lat: string;
		lng: string;
	};

	payments: {
		amount: string;
		status: string;
	}[];
}

// ---------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------
export default function ProviderAppointmentsPage() {
	const { user, token } = useAuthStore();

	const [orders, setOrders] = useState<ServiceOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [processingId, setProcessingId] = useState<string | null>(null);
	const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(
		null
	);

	const [tab, setTab] = useState<"upcoming" | "completed" | "cancelled">(
		"upcoming"
	);

	const [search, setSearch] = useState("");

	// ---------------------------------------------------------
	// FETCH ORDERS
	// ---------------------------------------------------------
	const fetchOrders = async () => {
		try {
			setLoading(true);
			const { data } = await Api.get(
				`service-orders/provider/${user?.id}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			setOrders(data);
		} catch {
			toast.error("No se pudieron cargar las citas");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user?.id) fetchOrders();
	}, [user]);

	// ---------------------------------------------------------
	// HELPERS
	// ---------------------------------------------------------
	const getCompactAddress = (a: any) =>
		[a?.address, a?.neighborhood, a?.city?.name, a?.region?.name]
			.filter(Boolean)
			.join(", ");

	const getPrice = (o: ServiceOrder) => o.payments?.[0]?.amount || "0.00";

	const getPaidStatusBadge = (o: ServiceOrder) => {
		const isPaid = o.payments?.[0]?.status === "approved";

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

	const getStatusText: Record<string, string> = {
		paid: "Pendiente de aceptar",
		accepted: "Aceptada",
		pending: "Pendiente de pago",
		cancelled: "Cancelada",
		completed: "Finalizada",
	};

	const getStatusBadge = (status: string) => {
		const colors: Record<string, string> = {
			paid: "bg-blue-100 text-blue-700",
			accepted: "bg-green-100 text-green-700",
			pending: "bg-yellow-100 text-yellow-700",
			cancelled: "bg-red-100 text-red-700",
			completed: "bg-gray-200 text-gray-700",
		};

		return (
			<span
				className={`text-[10px] px-2 py-0.5 rounded-md ${colors[status]}`}
			>
				{getStatusText[status] ?? status}
			</span>
		);
	};

	const canAccept = (status: string) => status === "paid";
	const canCancel = (status: string) =>
		status === "paid" || status === "accepted";

	// ---------------------------------------------------------
	// ACTIONS
	// ---------------------------------------------------------
	const handleConfirm = async (id: string) => {
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

		try {
			setProcessingId(id);
			await Api.patch(
				`service-orders/${id}/confirm`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			toast.success("Cita aceptada");
			fetchOrders();
		} finally {
			setProcessingId(null);
		}
	};

	const handleCancel = async (id: string) => {
		try {
			setProcessingId(id);
			await Api.patch(
				`service-orders/${id}/cancel`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			toast.info("Cita cancelada");
			fetchOrders();
		} finally {
			setProcessingId(null);
		}
	};

	// ---------------------------------------------------------
	// FILTER (solo pagadas)
	// ---------------------------------------------------------
	const filteredOrders = orders
		.filter((o) => o.payments?.[0]?.status === "approved") // SOLO PAGADAS
		.filter((o) => {
			if (tab === "upcoming")
				return o.status === "paid" || o.status === "accepted";
			if (tab === "completed") return o.status === "completed";
			if (tab === "cancelled") return o.status === "cancelled";
			return true;
		})
		.filter((o) =>
			search.trim()
				? o.id.toLowerCase().includes(search.toLowerCase())
				: true
		);

	// ---------------------------------------------------------
	// RENDER
	// ---------------------------------------------------------
	return (
		<main className="max-w-7xl mx-auto mt-10 px-4 font-nunito">
			<h1 className="text-3xl font-bold text-[var(--color-primary)] mb-6">
				Citas Recibidas
			</h1>

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

			{/* TABS */}
			<div className="flex gap-3 mb-8 flex-wrap">
				{[
					{ key: "upcoming", label: "Próximas" },
					{ key: "completed", label: "Finalizadas" },
					{ key: "cancelled", label: "Canceladas" },
				].map((t) => (
					<motion.button
						key={t.key}
						whileTap={{ scale: 0.97 }}
						onClick={() => setTab(t.key as any)}
						className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
							tab === t.key
								? "bg-[var(--color-primary)] text-white shadow"
								: "border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
						}`}
					>
						{t.label}
					</motion.button>
				))}
			</div>

			{/* TABLE */}
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
						<tr className="border-b bg-gray-200">
							<th className="py-3 px-4">ID</th>
							<th className="py-3 px-4">Servicio</th>
							<th className="py-3 px-4">Cliente</th>
							<th className="py-3 px-4">Dirección</th>
							<th className="py-3 px-4">Pago</th>
							<th className="py-3 px-4">Estado</th>
							<th className="py-3 px-4 text-center">Acciones</th>
						</tr>
					</thead>

					<tbody>
						{filteredOrders.map((o) => {
							const price = getPrice(o);
							const address = getCompactAddress(o.address);

							return (
								<tr
									key={o.id}
									className="border-b hover:bg-gray-50"
								>
									<td className="py-3 px-4 max-w-[130px] ">
										<div className="flex flex-col gap-1">
											<span className="text-[11px] break-all">
												{o.id}
											</span>
											<button
												onClick={() =>
													navigator.clipboard.writeText(
														o.id
													)
												}
												className="text-[var(--color-primary)] text-xs"
											>
												<FontAwesomeIcon
													icon={faCopy}
													size="sm"
												/>
											</button>
										</div>
									</td>

									<td className="py-3 px-4">
										{o.service?.name}
									</td>

									<td className="py-3 px-4 capitalize">
										{o.user.names} {o.user.surnames}
									</td>

									<td className="py-3 px-4 max-w-[230px] truncate">
										{address}
									</td>

									<td className="py-3 px-4">
										<div className="flex flex-col gap-1">
											<span className="font-semibold text-[12px]">
												${price}
											</span>
											{getPaidStatusBadge(o)}
										</div>
									</td>

									<td className="py-3 px-4">
										{getStatusBadge(o.status)}
									</td>

									<td className="py-3 px-4 text-center">
										<div className="flex justify-center gap-3">
											{/* Ver detalles */}
											<button
												onClick={() =>
													setSelectedOrder(o)
												}
												className="text-[var(--color-primary)]"
											>
												<FontAwesomeIcon icon={faEye} />
											</button>
											{/* CHAT */}
											{(o.status === "paid" ||
												o.status === "accepted") && (
												<StartChatButton
													receiverId={o.user.id}
												/>
											)}
											{/* Aceptar */}
											{o.status === "paid" && (
												<button
													onClick={() =>
														handleConfirm(o.id)
													}
													className="text-green-600"
												>
													{processingId === o.id ? (
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
											{/* Cancelar */}
											{canCancel(o.status) && (
												<button
													onClick={async () => {
														const result =
															await Swal.fire({
																title: "¿Cancelar esta cita?",
																text: "Esta acción no se puede deshacer.",
																icon: "warning",
																showCancelButton:
																	true,
																confirmButtonColor:
																	"#d33",
																cancelButtonColor:
																	"#3085d6",
																confirmButtonText:
																	"Sí, cancelar",
																cancelButtonText:
																	"No",
															});

														if (
															result.isConfirmed
														) {
															handleCancel(o.id);
														}
													}}
													className="text-red-600"
												>
													{processingId === o.id ? (
														<FontAwesomeIcon
															icon={faSpinner}
															spin
														/>
													) : (
														<FontAwesomeIcon
															icon={faTrash}
														/>
													)}
												</button>
											)}{" "}
											{/* ⭐ Añadir review */}
											{o.status === "completed" && (
												<button
													title="Añadir reseña"
													// onClick={onReview}
													className="text-yellow-500 hover:text-yellow-600"
												>
													<FontAwesomeIcon
														icon={faStar}
													/>
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

			{/* MODAL */}
			<AnimatePresence>
				{selectedOrder && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
						onClick={(e) => {
							if (e.target === e.currentTarget)
								setSelectedOrder(null);
						}}
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="bg-white p-6 w-full max-w-lg rounded-2xl shadow-xl relative"
						>
							{/* Close button */}
							<button
								onClick={() => setSelectedOrder(null)}
								className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
							>
								<FontAwesomeIcon icon={faTimes} size="lg" />
							</button>

							<h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">
								Detalles de la cita
							</h2>

							<p className="text-sm mb-2">
								<strong>ID:</strong> {selectedOrder.id}
							</p>

							<p className="text-sm mb-1">
								<strong>Cliente:</strong>{" "}
								{selectedOrder.user.names}{" "}
								{selectedOrder.user.surnames}
							</p>

							<p className="text-sm mb-1">
								<strong>Servicio:</strong>{" "}
								{selectedOrder.service?.name}
							</p>

							<p className="text-sm mb-1">
								<strong>Precio:</strong> $
								{getPrice(selectedOrder)}
							</p>

							<p className="text-sm mb-1">
								<strong>Dirección:</strong>{" "}
								{getCompactAddress(selectedOrder.address)}
							</p>

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

							{/* Modal Actions */}
							<div className="flex justify-end gap-3 mt-6">
								{/* Cancelar */}
								{canCancel(selectedOrder.status) && (
									<button
										onClick={async () => {
											const result = await Swal.fire({
												title: "¿Cancelar la cita?",
												text: "Esta acción no se puede deshacer.",
												icon: "warning",
												showCancelButton: true,
												confirmButtonColor: "#d33",
												cancelButtonColor: "#3085d6",
												confirmButtonText:
													"Sí, cancelar",
												cancelButtonText: "No",
											});

											if (result.isConfirmed) {
												handleCancel(selectedOrder.id);
												setSelectedOrder(null);
											}
										}}
										className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
									>
										Cancelar cita
									</button>
								)}

								{/* Aceptar */}
								{canAccept(selectedOrder.status) && (
									<button
										onClick={() =>
											handleConfirm(selectedOrder.id)
										}
										className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
									>
										Aceptar
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
