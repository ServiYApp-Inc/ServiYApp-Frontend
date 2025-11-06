"use client";

import { useCartStore } from "../../../store/useCartStore";

export default function CartPage() {
	const { items, removeFromCart, getTotal, clearCart } = useCartStore();

	return (
		<div className="min-h-screen bg-gradient-to-b text-white py-10 px-4 font-nunito">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-4xl font-bold mb-10 text-center text-black">
					🛒 Tu Carrito
				</h1>

				{items.length === 0 ? (
					<p className="text-gray-400 text-center text-lg">
						Tu carrito está vacío.
					</p>
				) : (
					<div className="space-y-5">
						{items.map((item) => (
							<div
								key={item.id}
								className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-800 p-5 rounded-2xl shadow-lg border border-red-700/40"
							>
								<div>
									<h2 className="font-semibold text-lg">
										{item.name}
									</h2>
									<p className="text-sm text-gray-400">
										${item.price} × {item.quantity}
									</p>
								</div>

								<button
									onClick={() => removeFromCart(item.id)}
									className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition-all duration-200 shadow"
								>
									Quitar
								</button>
							</div>
						))}

						<div className="mt-8 bg-gray-800 border border-red-700/40 rounded-2xl shadow-xl p-6 text-right">
							<p className="text-lg font-semibold mb-4">
								Total:{" "}
								<span className="text-red-400">
									${getTotal().toFixed(2)}
								</span>
							</p>

							<div className="flex gap-3 justify-end">
								<button
									onClick={clearCart}
									className="bg-gray-700 hover:bg-gray-800 px-5 py-2 rounded-lg transition-all duration-200"
								>
									Vaciar carrito
								</button>

								<button
									onClick={() => console.log("Ir al pago")}
									className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md"
								>
									Continuar al pago
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
