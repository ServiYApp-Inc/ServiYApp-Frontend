"use client";

import { useEffect, useState } from "react";
import { Api } from "@/app/services/api";
import { useAuthStore } from "@/app/store/auth.store";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import AppointmentCard from "@/app/components/AppointmentCard";
import AppointmentModal from "@/app/components/AppointmentModal";
import { useRouter } from "next/navigation";

export default function UserAppointmentsPage() {
	const { user, token } = useAuthStore();
	const router = useRouter();

	const [orders, setOrders] = useState<any[]>([]);
	const [tab, setTab] = useState("upcoming");
	const [loading, setLoading] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<any>(null);

	// -------------------------------------
	// FETCH
	// -------------------------------------
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
		} catch {
			toast.error("Error al cargar tus reservas");
		} finally {
			setLoading(false);
		}
	};

	// -------------------------------------
	// CANCELAR (CON SWEET ALERT)
	// -------------------------------------
	const confirmCancel = async (id: string) => {
		const result = await Swal.fire({
			title: "¿Seguro que quieres cancelar esta cita?",
			text: "Esta acción no se puede deshacer.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Sí, cancelar",
			cancelButtonText: "Volver",
			confirmButtonColor: "#dc2626",
			cancelButtonColor: "#6b7280",
		});

		if (!result.isConfirmed) return;

		try {
			// 🟣 OBTENER EL PROVEEDOR DE ESTA ORDEN
			const order = orders.find((o) => o.id === id);
			const providerId = order?.provider?.id;

			// 🟣 CANCELAR SERVICIO
			await Api.patch(
				`service-orders/${id}/cancel`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			// 🟣 BORRAR CHAT SOLO SI HAY PROVIDER
			if (providerId) {
				await Api.delete(
					`chat/conversations/user/${user?.id}/provider/${providerId}`,
					{ headers: { Authorization: `Bearer ${token}` } }
				);
			}
			await Swal.fire({
				title: "Cita cancelada",
				icon: "success",
				confirmButtonColor: "#1d2846",
			});

			fetchOrders();
		} catch {
			toast.error("No se pudo cancelar la cita");
		}
	};

	// -------------------------------------
	// FINALIZAR SERVICIO (CON SWEET ALERT)
	// -------------------------------------
	const confirmFinish = async (id: string) => {
		const result = await Swal.fire({
			title: "¿Marcar el servicio como finalizado?",
			icon: "question",
			showCancelButton: true,
			confirmButtonText: "Finalizar servicio",
			cancelButtonText: "Cancelar",
			confirmButtonColor: "#1d2846",
			cancelButtonColor: "#6b7280",
		});

		if (!result.isConfirmed) return;

		try {
			await Api.patch(
				`service-orders/${id}/finish`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			const order = orders.find((o) => o.id === id);
			const providerId = order?.provider?.id;

			if (providerId) {
				await Api.delete(
					`chat/conversations/user/${user?.id}/provider/${providerId}`,
					{ headers: { Authorization: `Bearer ${token}` } }
				);
			}

			await Swal.fire({
				title: "¡Servicio finalizado!",
				icon: "success",
				confirmButtonColor: "#1d2846",
			});

			fetchOrders();
		} catch {
			toast.error("Error al finalizar el servicio");
		}
	};

	// -------------------------------------
	// IR A REVIEW
	// -------------------------------------
	const goToReview = async (id: string) => {
		await Swal.fire({
			title: "Añadir reseña",
			text: "Serás redirigido a la página para escribir una reseña.",
			icon: "info",
			confirmButtonText: "Continuar",
			confirmButtonColor: "#1d2846",
		});

		router.push(`/reviews/create?orderId=${id}`);
	};

	// -------------------------------------
	// FILTROS
	// -------------------------------------
	const filteredByPayment = orders.filter(
		(o) => o.payments?.[0]?.status === "approved"
	);

	const finalFiltered = filteredByPayment.filter((o) => {
		if (tab === "upcoming") return ["paid", "accepted"].includes(o.status);
		if (tab === "completed") return o.status === "completed";
		if (tab === "cancelled") return o.status === "cancelled";
		return true;
	});

	// -------------------------------------
	// RENDER
	// -------------------------------------
	return (
		<main
			className="px-6 py-10 min-h-screen"
			style={{ background: "var(--background)" }}
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
						onClick={() => setTab(t.key)}
						className={`px-6 py-2 rounded-full text-sm font-semibold ${
							tab === t.key
								? "bg-[var(--color-primary)] text-white"
								: "border border-[var(--color-primary)] text-[var(--color-primary)]"
						}`}
					>
						{t.label}
					</button>
				))}
			</div>

			{/* LISTADO */}
			{loading ? (
				<p className="text-center text-gray-500">Cargando...</p>
			) : finalFiltered.length === 0 ? (
				<p className="text-center text-gray-500">No hay resultados.</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
					{finalFiltered.map((o) => (
						<AppointmentCard
							key={o.id}
							order={o}
							showCancel={["paid", "accepted"].includes(o.status)}
							onCancel={() => confirmCancel(o.id)}
							onFinish={() => confirmFinish(o.id)}
							onDetails={() => setSelectedOrder(o)}
						/>
					))}
				</div>
			)}

			{/* MODAL */}
			{selectedOrder && (
				<AppointmentModal
					order={selectedOrder}
					onClose={() => setSelectedOrder(null)}
					onCancel={() => confirmCancel(selectedOrder.id)}
					onFinish={() => confirmFinish(selectedOrder.id)}
					onReview={() => goToReview(selectedOrder.id)}
				/>
			)}
		</main>
	);
}
