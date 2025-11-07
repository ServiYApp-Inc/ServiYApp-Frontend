"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTrashAlt,
	faMinus,
	faPlus,
	faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { useCartStore } from "@/app/store/useCartStore";

export default function CartPage() {
	const router = useRouter();
	const { items, addToCart, removeFromCart, clearCart, getTotal } =
		useCartStore();
	const total = getTotal();

	return (
		<main
			className="min-h-screen px-4 py-10 flex justify-center"
			style={{ backgroundColor: "var(--background)" }}
		>
			<section className="w-full max-w-5xl bg-white rounded-3xl shadow-lg p-8 md:p-10 font-nunito">
				<h1 className="text-3xl font-bold text-[var(--color-primary)] mb-1">
					Tu carrito
				</h1>
				<p className="text-gray-500 mb-6">
					Revisa tus servicios antes de continuar al pago.
				</p>

				{/* Si no hay items */}
				{items.length === 0 ? (
					<div className="text-center text-gray-600 py-20">
						<p className="mb-4">Tu carrito está vacío 🛍️</p>
						<Link
							href="/user/services"
							className="text-[var(--color-primary)] font-semibold underline"
						>
							Explorar servicios
						</Link>
					</div>
				) : (
					<>
						{/* Lista de items */}
						<div className="space-y-4">
							{items.map((item) => (
								<div
									key={item.id}
									className="flex items-center justify-between border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
								>
									<div className="flex items-center gap-4">
										<img
											src={
												item.image || "/placeholder.jpg"
											}
											alt={item.name}
											className="w-20 h-20 rounded-xl object-cover border"
										/>
										<div>
											<h2 className="font-semibold text-lg text-[var(--color-primary)]">
												{item.name}
											</h2>
											<p className="text-gray-500 text-sm">
												${item.price} c/u
											</p>

											{/* Controles de cantidad */}
											<div className="flex items-center gap-2 mt-2">
												<button
													onClick={() =>
														addToCart({
															...item,
															quantity: -1,
														})
													}
													className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100 text-gray-600"
												>
													<FontAwesomeIcon
														icon={faMinus}
													/>
												</button>
												<span className="px-2 font-medium">
													{item.quantity}
												</span>
												<button
													onClick={() =>
														addToCart({
															...item,
															quantity: 1,
														})
													}
													className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100 text-gray-600"
												>
													<FontAwesomeIcon
														icon={faPlus}
													/>
												</button>
											</div>
										</div>
									</div>

									<div className="text-right">
										<p className="text-lg font-semibold text-[var(--color-primary)]">
											${item.price * item.quantity}
										</p>
										<button
											onClick={() =>
												removeFromCart(item.id)
											}
											className="text-sm text-red-600 hover:underline mt-1"
										>
											<FontAwesomeIcon
												icon={faTrashAlt}
												className="mr-1"
											/>
											Quitar
										</button>
									</div>
								</div>
							))}
						</div>

						{/* Total + botones */}
						<div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-6">
							<button
								onClick={clearCart}
								className="text-sm text-gray-500 underline hover:text-gray-700"
							>
								Vaciar carrito
							</button>

							<div className="flex items-center gap-8">
								<div className="text-right">
									<p className="text-gray-500 text-sm">
										Total:
									</p>
									<p className="text-3xl font-extrabold text-[var(--color-primary)]">
										${total}
									</p>
								</div>

								<motion.button
									whileTap={{ scale: 0.97 }}
									onClick={() =>
										router.push("/user/order/checkout")
									}
									className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-8 py-3 rounded-2xl text-lg font-semibold hover:opacity-90 shadow-md hover:shadow-lg transition-all"
								>
									Ir al pago
									<FontAwesomeIcon icon={faArrowRight} />
								</motion.button>
							</div>
						</div>
					</>
				)}
			</section>
		</main>
	);
}
