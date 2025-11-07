"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { Api } from "@/app/services/api";
import Link from "next/link";
import { useCartStore } from "@/app/store/useCartStore";
import { useRouter } from "next/navigation";

interface IService {
	id: string;
	name: string;
	description?: string;
	price: number;
	photo?: string;
	duration?: number;
	provider?: { names?: string; surnames?: string };
	category?: { name?: string };
}

export default function ConfirmOrderPage() {
	const router = useRouter();
	const { addToCart } = useCartStore();

	const [service, setService] = useState<IService | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// ✅ Obtener el parámetro "id" del query string con window.location
		if (typeof window !== "undefined") {
			const params = new URLSearchParams(window.location.search);
			const id = params.get("id");

			if (!id) {
				setLoading(false);
				return;
			}

			const fetchService = async () => {
				try {
					const { data } = await Api.get(`/services/find/${id}`);
					setService(data);
				} catch (error) {
					console.error("Error al cargar servicio:", error);
				} finally {
					setLoading(false);
				}
			};

			fetchService();
		}
	}, []);

	const handleConfirm = () => {
		if (!service) return;
		addToCart({
			id: service.id,
			name: service.name,
			price: service.price,
			image: service.photo,
			quantity: 1,
		});
		router.push("/user/cart");
	};

	if (loading)
		return (
			<div className="flex justify-center items-center h-screen text-gray-500 text-lg">
				Cargando servicio...
			</div>
		);

	if (!service)
		return (
			<main className="min-h-screen flex flex-col items-center justify-center">
				<p className="text-gray-600 mb-4">No se encontró el servicio.</p>
				<Link
					href="/user/services"
					className="text-[var(--color-primary)] underline font-medium"
				>
					Volver a servicios
				</Link>
			</main>
		);

	return (
		<main
			className="min-h-screen flex items-center justify-center px-4"
			style={{ backgroundColor: "var(--background)" }}
		>
			<motion.section
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-8 md:p-10 font-nunito"
			>
				{/* Encabezado */}
				<div className="text-center mb-8">
					<FontAwesomeIcon
						icon={faCheckCircle}
						className="text-[var(--color-primary)] text-4xl mb-3"
					/>
					<h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">
						Confirmación de pedido
					</h1>
					<p className="text-gray-600">
						Revisa los detalles del servicio antes de continuar.
					</p>
				</div>

				{/* Información del servicio */}
				<div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
					<img
						src={service.photo || "/placeholder.jpg"}
						alt={service.name}
						className="w-36 h-36 rounded-2xl object-cover shadow-md"
					/>

					<div className="flex-1">
						<h2 className="text-xl font-bold text-[var(--color-primary)] mb-1">
							{service.name}
						</h2>
						<p className="text-gray-600 text-sm mb-2">
							{service.description ||
								"Este servicio aún no tiene una descripción."}
						</p>

						<div className="text-gray-600 text-sm space-y-1">
							<p>
								<strong>Duración:</strong> {service.duration || "N/A"} min
							</p>
							<p>
								<strong>Profesional:</strong>{" "}
								{service.provider?.names} {service.provider?.surnames}
							</p>
							<p>
								<strong>Categoría:</strong>{" "}
								{service.category?.name || "No especificada"}
							</p>
						</div>
					</div>
				</div>

				{/* Total */}
				<div className="flex justify-between items-center border-t pt-5 mt-4">
					<span className="text-lg font-semibold text-gray-600">
						Total:
					</span>
					<span className="text-3xl font-extrabold text-[var(--color-primary)]">
						${service.price}
					</span>
				</div>

				{/* Botones */}
				<div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
					<Link
						href="/user/services"
						className="px-6 py-3 rounded-lg border text-gray-700 font-medium hover:bg-gray-50 transition"
					>
						Volver
					</Link>

					<button
						onClick={handleConfirm}
						className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition"
						style={{ backgroundColor: "var(--color-primary)" }}
					>
						<FontAwesomeIcon icon={faShoppingCart} />
						Confirmar pedido
					</button>
				</div>
			</motion.section>
		</main>
	);
}
