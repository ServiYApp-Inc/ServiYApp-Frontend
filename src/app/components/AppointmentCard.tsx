"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faMapMarkerAlt,
	faTrash,
	faCopy,
	faCircleCheck,
	faStar,
} from "@fortawesome/free-solid-svg-icons";
import StartChatButton from "@/app/components/StartChatButton";
import { motion } from "framer-motion";
import { IServiceOrder } from "../interfaces/IServiceOrder";

interface AppointmentCardProps {
	order: IServiceOrder;
	showCancel?: boolean;
	onCancel?: () => void;
	onFinish?: () => void;
	onDetails?: () => void;
	onReview?: () => void;
}

export default function AppointmentCard({
	order,
	showCancel = false,
	onCancel,
	onFinish,
	onDetails,
	onReview,
}: AppointmentCardProps) {
	const getStatusColor = (status: string) => {
		if (status === "paid") return "bg-blue-100 text-blue-700";
		if (status === "accepted") return "bg-green-100 text-green-700";
		if (status === "completed") return "bg-gray-100 text-gray-700";
		if (status === "cancelled") return "bg-red-100 text-red-700";
		return "bg-gray-200 text-gray-600";
	};

	const getStatusText = (status: string) => {
		if (status === "paid") return "Pagada (pendiente de aceptación)";
		if (status === "accepted") return "Aceptada";
		if (status === "completed") return "Completada";
		if (status === "cancelled") return "Cancelada";
		return status;
	};

	const getPrice = () => order.payments?.[0]?.amount || "0.00";

	const isPaid = order.payments?.[0]?.status === "approved";

	return (
		<motion.div
			whileHover={{ scale: 1.02 }}
			className="overflow-hidden rounded-2xl border bg-white shadow-md transition"
		>
			{/* ===== Imagen ===== */}
			<div className="relative w-full h-48">
				<img
					src={order.service?.photos?.[0] || "/default-service.jpg"}
					className="w-full h-full object-cover"
				/>

				{/* Estado */}
				<span
					className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-semibold ${getStatusColor(
						order.status
					)}`}
				>
					{getStatusText(order.status)}
				</span>
			</div>

			{/* ===== Contenido ===== */}
			<div className="p-5 space-y-2">
				{/* ID */}
				<div className="flex items-center gap-2">
					<span className="text-[10px] text-gray-500 break-all">
						ID: {order.id}
					</span>
					<button
						title="Copiar ID"
						onClick={() => navigator.clipboard.writeText(order.id)}
						className="text-xs text-[var(--color-primary)]"
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

				{order.address && (
					<p className="flex items-center gap-2 text-sm text-gray-700">
						<FontAwesomeIcon
							icon={faMapMarkerAlt}
							className="text-gray-400"
						/>
						{order.address.name}, {order.address.address}
					</p>
				)}

				<div className="flex items-center gap-2 pt-2">
					<span className="text-sm font-semibold">${getPrice()}</span>

					<span
						className={`text-[10px] px-2 py-0.5 rounded-md ${
							isPaid
								? "bg-green-100 text-green-700"
								: "bg-red-100 text-red-700"
						}`}
					>
						{isPaid ? "Pagada" : "No pagada"}
					</span>
				</div>

				<div className="flex justify-between items-center pt-4">
					{/* Cancelar */}
					{showCancel && (
						<button
							title="Cancelar cita"
							onClick={onCancel}
							className="text-red-600 hover:text-red-700 text-sm"
						>
							<FontAwesomeIcon icon={faTrash} />
						</button>
					)}

					<div className="flex items-center gap-3 ml-auto">
						{/* Chat */}
						{["paid", "accepted"].includes(order.status) && (
							<div title="Enviar mensaje">
								<StartChatButton
									receiverId={order.provider.id}
								/>
							</div>
						)}

						{/* Finalizar */}
						{order.status === "accepted" && (
							<button
								title="Finalizar servicio"
								onClick={onFinish}
							>
								<FontAwesomeIcon icon={faCircleCheck} />
							</button>
						)}

						{/* ⭐ Añadir review */}
						{order.status === "completed" && (
							<button
								title="Añadir reseña"
								onClick={onReview}
								className="text-yellow-500 hover:text-yellow-600"
							>
								<FontAwesomeIcon icon={faStar} />
							</button>
						)}

						{/* Detalles */}
						<button
							title="Ver detalles"
							onClick={onDetails}
							className="px-4 py-1 text-sm rounded-lg text-white bg-[var(--color-primary)]"
						>
							Ver Detalles
						</button>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
