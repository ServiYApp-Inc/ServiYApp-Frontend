"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTimes,
	faTrash,
	faCopy,
	faCheck,
	faStar,
} from "@fortawesome/free-solid-svg-icons";

import { motion, AnimatePresence } from "framer-motion";
import StartChatButton from "@/app/components/StartChatButton";
import MapAddress from "@/app/components/MapAddress";
import { IServiceOrder } from "../interfaces/IServiceOrder";

interface AppointmentModalProps {
	order: IServiceOrder;
	onClose: () => void;
	onCancel?: () => void;
	onFinish?: () => void;
	onReview?: () => void;
}

export default function AppointmentModal({
	order,
	onClose,
	onCancel,
	onFinish,
	onReview,
}: AppointmentModalProps) {
	return (
		<AnimatePresence>
			{order && (
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
						<div className="relative h-44">
							<img
								src={
									order.service?.photos?.[0] ||
									"/default-service.jpg"
								}
								className="w-full h-full object-cover"
							/>

							<button
								title="Cerrar"
								onClick={onClose}
								className="absolute top-3 left-3 p-2 bg-black/40 rounded-full text-white"
							>
								<FontAwesomeIcon icon={faTimes} />
							</button>

							{/* Cancelar */}
							{["paid", "accepted"].includes(order.status) && (
								<button
									title="Cancelar cita"
									onClick={onCancel}
									className="absolute top-3 right-3 p-2 rounded-full bg-red-600 text-white shadow-md"
								>
									<FontAwesomeIcon icon={faTrash} />
								</button>
							)}
						</div>

						<div className="p-6 overflow-y-auto flex-1">
							{/* ID */}
							<div className="flex items-center gap-3 mb-2">
								<span className="text-[11px] text-gray-500 break-all">
									ID: {order.id}
								</span>

								<button
									title="Copiar ID"
									onClick={() =>
										navigator.clipboard.writeText(order.id)
									}
									className="text-[var(--color-primary)] text-xs"
								>
									<FontAwesomeIcon icon={faCopy} />
								</button>

								{/* Finalizar */}
								{order.status === "accepted" && (
									<button
										title="Finalizar servicio"
										onClick={onFinish}
										className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-3 py-1 rounded-md text-xs shadow hover:bg-[var(--color-primary-hover)]"
									>
										<FontAwesomeIcon icon={faCheck} />
										Finalizar
									</button>
								)}

								{/* ⭐ Añadir reseña */}
								{order.status === "completed" && (
									<button
										title="Añadir reseña"
										onClick={onReview}
										className="text-yellow-500 hover:text-yellow-600 text-sm"
									>
										<FontAwesomeIcon icon={faStar} />
									</button>
								)}
							</div>

							{/* Servicio */}
							<h2 className="text-2xl font-bold text-[var(--color-primary)]">
								{order.service?.name}
							</h2>

							{/* Proveedor */}
							<div className="flex items-center gap-2 mt-2">
								<p className="text-sm font-semibold text-[var(--color-primary)]">
									Servicio por:
									<span className="text-gray-700 ml-1">
										{order.provider.names}{" "}
										{order.provider.surnames}
									</span>
								</p>

								<StartChatButton
									receiverId={order.provider.id}
								/>
							</div>

							{/* Info */}
							<div className="text-sm text-gray-700 space-y-3 mt-3">
								<p>
									<strong>Correo:</strong>{" "}
									{order.provider.email}
								</p>
								<p>
									<strong>Teléfono:</strong>{" "}
									{order.provider.phone}
								</p>
							</div>

							{/* Dirección */}
							{order.address && (
								<div className="text-sm text-gray-700 mt-4">
									<p className="font-semibold text-[var(--color-primary)]">
										Dirección:
									</p>
									<p>
										{[
											order.address.name,
											order.address.address,
											order.address.neighborhood,
											order.address.city?.name,
											order.address.region?.name,
											order.address.country?.name,
										]
											.filter(Boolean)
											.join(", ")}
									</p>
								</div>
							)}

							{/* Mapa */}
							{order.address?.lat && (
								<div className="mt-4">
									<MapAddress
										lat={Number(order.address.lat)}
										lng={Number(order.address.lng)}
										height="200px"
									/>
								</div>
							)}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
