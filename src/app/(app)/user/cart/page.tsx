"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTrashAlt,
	faMinus,
	faPlus,
	faArrowRight,
	faMapMarkerAlt,
	faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import { useCartStore } from "@/app/store/useCartStore";
import { getAddressById } from "@/app/services/provider.service";
import { useAuthStore } from "@/app/store/auth.store";

interface IAddressFull {
	id: string;
	name: string;
	address: string;
	neighborhood?: string;
	city?: { name: string };
	region?: { name: string };
	country?: { name: string };
}

export default function CartPage() {
	const router = useRouter();
	const { token } = useAuthStore();
	const { items, addToCart, removeFromCart, clearCart, getTotal } =
		useCartStore();
	const total = getTotal();

	// 🔥 State para direcciones cargadas
	const [addressesMap, setAddressesMap] = useState<Record<string, IAddressFull | null>>({});

	// ✅ Obtener direcciones únicas del carrito
	const uniqueAddressIds = [...new Set(items.map((i) => i.addressId))];

	// ✅ Cargar direcciones desde backend
	useEffect(() => {
		if (!token || uniqueAddressIds.length === 0) return;

		(async () => {
			const map: Record<string, IAddressFull | null> = {};

			for (const id of uniqueAddressIds) {
				try {
					const data = await getAddressById(id, token);
					map[id] = data;
				} catch {
					map[id] = null; // Si no existe o fue eliminada
				}
			}

			setAddressesMap(map);
		})();
	}, [token, items]);

	const handleContinue = () => {
		alert("✨ Estamos terminando la pasarela de pago, vuelve pronto ✨");
	};

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
					Revisa tus servicios antes de continuar.
				</p>

				{/* Si no hay items */}
				{items.length === 0 ? (
					<div className="text-center text-gray-600 py-20">
						<p className="mb-4">Tu carrito está vacío 🛍️</p>
						<button
							onClick={() => router.push("/user/services")}
							className="text-[var(--color-primary)] font-semibold underline"
						>
							Explorar servicios
						</button>
					</div>
				) : (
					<>
						{/* ✅ Agrupación por dirección */}
						{uniqueAddressIds.map((addrId) => {
							const group = items.filter((i) => i.addressId === addrId);
							const address = addressesMap[addrId];

							return (
								<div
									key={addrId}
									className="border border-gray-200 rounded-2xl p-5 mb-8"
								>
									{/* Dirección */}
									<div className="mb-4">
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
												⚠️ Esta dirección fue eliminada o no existe
											</p>
										)}
									</div>

									{/* Items de esta dirección */}
									<ul className="space-y-3">
										{group.map((item) => (
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

													{/* Cantidad */}
													<div className="flex items-center gap-2 mt-2">
														<button
															onClick={() =>
																addToCart({ ...item, quantity: -1 })
															}
															className="w-7 h-7 flex items-center justify-center border rounded-lg hover:bg-gray-100 text-gray-600"
														>
															<FontAwesomeIcon icon={faMinus} />
														</button>
														<span className="px-2 font-medium">{item.quantity}</span>
														<button
															onClick={() =>
																addToCart({ ...item, quantity: 1 })
															}
															className="w-7 h-7 flex items-center justify-center border rounded-lg hover:bg-gray-100 text-gray-600"
														>
															<FontAwesomeIcon icon={faPlus} />
														</button>
													</div>
												</div>

												<div className="text-right">
													<p className="text-lg font-semibold text-[var(--color-primary)]">
														${item.price * item.quantity}
													</p>
													<button
														onClick={() => removeFromCart(item.id)}
														className="text-sm text-red-600 hover:underline mt-1"
													>
														<FontAwesomeIcon icon={faTrashAlt} className="mr-1" />
														Quitar
													</button>
												</div>
											</li>
										))}
									</ul>
								</div>
							);
						})}

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
									<p className="text-gray-500 text-sm">Total:</p>
									<p className="text-3xl font-extrabold text-[var(--color-primary)]">
										${total}
									</p>
								</div>

								<motion.button
									whileTap={{ scale: 0.97 }}
									onClick={handleContinue}
									className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-8 py-3 rounded-2xl text-lg font-semibold hover:opacity-90 shadow-md hover:shadow-lg transition-all"
								>
									Pagar
									<FontAwesomeIcon icon={faShoppingCart} />
								</motion.button>
							</div>
						</div>
					</>
				)}
			</section>
		</main>
	);
}
