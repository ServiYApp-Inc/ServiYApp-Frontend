"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faStickyNote,
	faCreditCard,
	faCheckCircle,
	faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";
import { useCartStore } from "@/app/store/useCartStore";

export default function CheckoutPage() {
	const { items, getTotal, clearCart } = useCartStore();
	const total = getTotal();
	const router = useRouter();

	const [notes, setNotes] = useState("");

	const handleCheckout = () => {
		if (items.length === 0) {
			alert("No tienes servicios en el carrito.");
			return;
		}

		// 🧠 Futuro: POST al backend
		console.log({ items, notes });
		clearCart();
		router.push("/checkout/success");
	};

	return (
		<main className="min-h-screen flex justify-center items-center px-4 py-8 bg-gray-50 font-nunito">
			<motion.section
				initial={{ opacity: 0, y: 15 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 space-y-6"
			>
				{/* Encabezado */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 border-b pb-4">
					<h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-primary)] tracking-tight">
						Confirmar pedido
					</h1>
					<p className="text-gray-500 mt-1 sm:mt-0 text-sm sm:text-base">
						Revisa tus servicios antes de pagar
					</p>
				</div>

				{/* Carrito */}
				<div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-inner space-y-4">
					<h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--color-primary)]">
						<FontAwesomeIcon icon={faShoppingBag} />
						Resumen del pedido
					</h2>

					{items.length === 0 ? (
						<p className="text-gray-500 text-sm italic">
							No tienes servicios en el carrito.
						</p>
					) : (
						<ul className="space-y-3">
							{items.map((item) => (
								<li
									key={item.id}
									className="flex justify-between items-center border-b border-gray-100 pb-2"
								>
									<div>
										<p className="font-semibold text-gray-700 leading-tight">
											{item.name}
										</p>
										<p className="text-xs text-gray-500">
											{item.quantity} × ${item.price}
										</p>
									</div>
									<p className="font-bold text-[var(--color-primary)] text-base sm:text-lg">
										${item.price * item.quantity}
									</p>
								</li>
							))}
						</ul>
					)}

					{/* Total */}
					<div className="flex justify-between items-center pt-3 border-t">
						<span className="text-gray-600 font-medium text-base">
							Total
						</span>
						<span className="text-2xl font-extrabold text-[var(--color-primary)]">
							${total}
						</span>
					</div>
				</div>

				{/* Notas adicionales */}
				<div>
					<label className="font-semibold text-gray-700 flex items-center gap-2 mb-2 text-sm sm:text-base">
						<FontAwesomeIcon
							icon={faStickyNote}
							className="text-[var(--color-primary)]"
						/>
						Notas adicionales
					</label>
					<textarea
						rows={2}
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder="Ej. Prefiero que traiga mis propios productos..."
						className="w-full border border-gray-300 rounded-2xl p-2 sm:p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
					></textarea>
				</div>

				{/* Método de pago */}
				<div>
					<label className="font-semibold text-gray-700 flex items-center gap-2 mb-2 text-sm sm:text-base">
						<FontAwesomeIcon
							icon={faCreditCard}
							className="text-[var(--color-primary)]"
						/>
						Método de pago
					</label>
					<select className="w-full border border-gray-300 rounded-2xl p-2 sm:p-3 text-gray-700 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all">
						<option>Mercado Pago</option>
					</select>
				</div>

				{/* Botón de confirmación */}
				<motion.button
					whileTap={{ scale: 0.97 }}
					onClick={handleCheckout}
					className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-[var(--color-primary)] text-white px-6 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold hover:bg-[var(--color-primary-dark,#1A2340)] shadow-md hover:shadow-lg transition-all"
				>
					<FontAwesomeIcon icon={faCheckCircle} className="text-lg sm:text-xl" />
					Confirmar y pagar
				</motion.button>
			</motion.section>
		</main>
	);
}
