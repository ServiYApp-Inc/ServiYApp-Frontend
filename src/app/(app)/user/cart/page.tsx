"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTrashAlt,
	faMapMarkerAlt,
	faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import { useCartStore } from "@/app/store/useCartStore";
import { getAddressById } from "@/app/services/provider.service";
import { useAuthStore } from "@/app/store/auth.store";
import { createOrderAndPayment } from "./order.service";

interface IAddressFull {
	id: string;
	name: string;
	address: string;
	neighborhood?: string;
	city?: { name: string };
	region?: { name: string };
	country?: { name: string };
}

// ⭐ Helper global
const getCurrencyByCountry = (countryName?: string) => {
	if (!countryName) return "MXN"; // default

	const normalized = countryName.toLowerCase();

	if (normalized.includes("colombia")) return "COP";
	if (normalized.includes("méxico") || normalized.includes("mexico")) return "MXN";
	if (normalized.includes("argentina")) return "ARS";

	return "MXN"; // fallback
};

export default function CartPage() {
	const router = useRouter();
	const { token, user } = useAuthStore();
	const { item, clearCart, getTotal, removeFromCart } = useCartStore();
	const total = getTotal();

	const [address, setAddress] = useState<IAddressFull | null>(null);
	const [loading, setLoading] = useState(false);

	// Cargar dirección
	useEffect(() => {
		if (!item || !token) return;

		(async () => {
			try {
				const data = await getAddressById(item.addressId, token);
				setAddress(data);
			} catch {
				setAddress(null);
			}
		})();
	}, [item, token]);

	const handlePay = async () => {
		if (!item || !user) return;
		setLoading(true);

		try {
			// Detecta país dinámicamente
			const userCountry = address?.country?.name || user?.country?.name;
			const currency = getCurrencyByCountry(userCountry);

			console.log("🌎 Moneda detectada:", currency);

			const { order, payment } = await createOrderAndPayment({
				providerId: item.providerId,
				userId: user.id,
				serviceId: item.id,
				addressId: item.addressId,
				amount: item.price,
				description: item.name,
				payerEmail: user.email,
				currency,
			});

			console.log("✅ Orden creada:", order);
			console.log("✅ Pago creado:", payment);

			if (payment?.init_point) {
				clearCart();
				window.location.href = payment.init_point;
			} else {
				alert("No se recibió un enlace de pago válido");
			}
		} catch (error) {
			console.error("❌ Error al procesar el pago:", error);
			alert("Ocurrió un error al procesar tu orden. Intenta de nuevo.");
		} finally {
			setLoading(false);
		}
	};

	// Carrito vacío
	if (!item) {
		return (
			<main className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] text-gray-600">
				<p className="mb-4 text-lg">Tu carrito está vacío 🛍️</p>
				<button
					onClick={() => router.push("/user/services")}
					className="text-[var(--color-primary)] font-semibold underline hover:text-[var(--color-primary-hover)]"
				>
					Explorar servicios
				</button>
			</main>
		);
	}

	return (
		<main
			className="min-h-screen px-4 py-10 flex justify-center"
			style={{ backgroundColor: "var(--background)" }}
		>
			<section className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-8 md:p-10 font-nunito">

				<h1 className="text-3xl font-bold text-[var(--color-primary)] mb-1">
					Tu carrito
				</h1>

				<p className="text-gray-500 mb-6">
					Revisa tu servicio antes de continuar con el pago.
				</p>

				{/* Dirección */}
				<div className="border border-gray-200 rounded-2xl p-5 mb-6">
					<h3 className="flex items-center gap-2 font-semibold text-[var(--color-primary)] text-lg">
						<FontAwesomeIcon icon={faMapMarkerAlt} />
						Entrega en: {address?.name || "(Dirección no encontrada)"}
					</h3>
					{address ? (
						<p className="text-sm text-gray-600 leading-tight mt-1">
							{address.address} <br />
							{address.neighborhood && `${address.neighborhood}, `}
							{address.city?.name}, {address.region?.name} <br />
							{address.country?.name}
						</p>
					) : (
						<p className="text-sm text-red-500">
							Esta dirección fue eliminada o no existe
						</p>
					)}
				</div>

				{/* Servicio */}
				<div className="border border-gray-200 rounded-2xl p-5 flex justify-between items-center">
					<div>
						<p className="font-semibold text-gray-700 leading-tight">
							{item.name}
						</p>
						<p className="text-lg font-semibold text-[var(--color-primary)] mt-1">
							${item.price}
						</p>
					</div>

					<button
						onClick={removeFromCart}
						className="text-sm text-red-600 hover:underline mt-1"
					>
						<FontAwesomeIcon icon={faTrashAlt} className="mr-1" />
						Quitar
					</button>
				</div>

				{/* Total */}
				<div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-6">
					<button
						onClick={clearCart}
						className="text-sm text-gray-500 underline hover:text-gray-700"
					>
						Vaciar carrito
					</button>

					<div className="flex items-center gap-8">
						<div className="text-right">
							<p className="text-gray-500 text-sm">Total:</p>
							<p className="text-3xl font-extrabold text-[var(--color-primary)]">
								${total}
							</p>
						</div>

						<motion.button
							whileTap={{ scale: 0.97 }}
							onClick={handlePay}
							disabled={loading}
							className={`flex items-center justify-center gap-2 ${
								loading
									? "bg-gray-400 cursor-not-allowed"
									: "bg-[var(--color-primary)] hover:opacity-90"
							} text-white px-8 py-3 rounded-2xl text-lg font-semibold shadow-md hover:shadow-lg transition-all`}
						>
							{loading ? "Procesando..." : "Pagar"}
							<FontAwesomeIcon icon={faShoppingCart} />
						</motion.button>
					</div>
				</div>

			</section>
		</main>
	);
}
