"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCheckCircle,
	faShoppingCart,
	faPlus,
	faPenToSquare,
	faChevronDown,
	faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { Api } from "@/app/services/api";
import Link from "next/link";
import { useCartStore } from "@/app/store/useCartStore";
import { useRouter } from "next/navigation";
import { getAddresses } from "@/app/services/provider.service";
import { useAuthStore } from "@/app/store/auth.store";
import AddressFormModal from "@/app/components/AddressFormModal";
import IService from "@/app/interfaces/IService";



export default function ConfirmOrderPage() {
	const router = useRouter();
	const { addToCart } = useCartStore();
	const { token } = useAuthStore();

	const [service, setService] = useState<IService | null>(null);
	const [addresses, setAddresses] = useState<any[]>([]);
	const [selectedAddressId, setSelectedAddressId] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [addressToEdit, setAddressToEdit] = useState<any>(null);

	// ✅ Obtener servicio desde el query param
	useEffect(() => {
		if (typeof window === "undefined") return;

		const params = new URLSearchParams(window.location.search);
		const id = params.get("id");

		if (!id) return setLoading(false);

		(async () => {
			try {
				const { data } = await Api.get(`/services/find/${id}`);
				setService(data);
			} catch (error) {
				console.error("Error al cargar servicio:", error);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	// ✅ Obtener direcciones activas del usuario
	const fetchAddresses = async () => {
		try {
			const data = await getAddresses(token!);
			const active = Array.isArray(data)
				? data.filter((a) => a.status === true)
				: [];
			setAddresses(active);
		} catch (error) {
			console.error("Error al cargar direcciones:", error);
		}
	};

	useEffect(() => {
		if (token) fetchAddresses();
	}, [token]);

	// ✅ Confirmar pedido y enviar al carrito
	const handleConfirm = () => {
		if (!service) return;

		if (!selectedAddressId) {
			alert("Por favor selecciona una dirección antes de continuar.");
			return;
		}

		addToCart({
			id: service.id,
			name: service.name,
			price: service.price,
			providerId: service.provider.id,
			image: service?.photos?.[0],
			addressId: selectedAddressId,
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
				<p className="text-gray-600 mb-4">
					No se encontró el servicio.
				</p>
				<Link
					href="/user/services"
					className="text-[var(--color-primary)] underline font-medium"
				>
					Volver a servicios
				</Link>
			</main>
		);

	const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

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
						Revisa los detalles del servicio y selecciona una
						dirección.
					</p>
				</div>

				{/* Información del servicio */}
				<div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
					<img
						src={service?.photos?.[0] || "/placeholder.jpg"}
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
								<strong>Duración:</strong>{" "}
								{service.duration || "N/A"} min
							</p>
							<p>
								<strong>Profesional:</strong>{" "}
								{service.provider?.names}{" "}
								{service.provider?.surnames}
							</p>
							<p>
								<strong>Categoría:</strong>{" "}
								{service.category?.name || "No especificada"}
							</p>
						</div>
					</div>
				</div>

				{/* Dropdown de direcciones */}
				<div className="mb-8">
					<h3 className="text-lg font-semibold text-gray-700 mb-3">
						Dirección de envío
					</h3>

					{/* Trigger */}
					<div
						className="border rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-gray-400 transition"
						onClick={() => setIsDropdownOpen((v) => !v)}
					>
						{selectedAddress ? (
							<div>
								<p className="font-semibold text-[var(--color-primary)]">
									{selectedAddress.name}
								</p>
								<p className="text-sm text-gray-600 truncate max-w-[240px]">
									{selectedAddress.address},{" "}
									{selectedAddress.neighborhood},{" "}
									{selectedAddress.city?.name},{" "}
									{selectedAddress.region?.name},{" "}
									{selectedAddress.country?.name}
								</p>
							</div>
						) : (
							<p className="text-gray-500 text-sm">
								Selecciona una dirección
							</p>
						)}

						<FontAwesomeIcon
							icon={faChevronDown}
							className={`text-gray-500 transition-transform duration-200 ${
								isDropdownOpen ? "rotate-180" : ""
							}`}
						/>
					</div>

					{/* Dropdown */}
					<AnimatePresence>
						{isDropdownOpen && (
							<motion.div
								initial={{ opacity: 0, y: -5 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -5 }}
								transition={{ duration: 0.2 }}
								className="mt-2 border rounded-xl bg-white shadow-md p-2 max-h-60 overflow-y-auto custom-scroll"
							>
								{addresses.map((addr) => (
									<div
										key={addr.id}
										className={`p-3 rounded-lg flex justify-between items-start cursor-pointer transition-all ${
											selectedAddressId === addr.id
												? "bg-[var(--color-primary-light)] border border-[var(--color-primary)]"
												: "hover:bg-gray-100"
										}`}
										onClick={() => {
											setSelectedAddressId(addr.id);
											setIsDropdownOpen(false);
										}}
									>
										<div className="text-sm">
											<p className="font-semibold text-[var(--color-primary)]">
												{addr.name}
											</p>
											<p className="text-gray-600 text-xs">
												{addr.address},{" "}
												{addr.neighborhood},{" "}
												{addr.city?.name},{" "}
												{addr.region?.name},{" "}
												{addr.country?.name}
											</p>
										</div>

										{/* Editar dirección */}
										<button
											className="text-gray-500 hover:text-[var(--color-primary)]"
											onClick={(e) => {
												e.stopPropagation();
												setAddressToEdit(addr);
												setIsModalOpen(true);
											}}
										>
											<FontAwesomeIcon
												icon={faPenToSquare}
											/>
										</button>
									</div>
								))}

								{/* + Agregar nueva */}
								<button
									className="w-full mt-2 flex items-center gap-2 text-[var(--color-primary)] font-semibold p-2 hover:bg-gray-100 rounded-lg"
									onClick={() => {
										setAddressToEdit(null);
										setIsModalOpen(true);
									}}
								>
									<FontAwesomeIcon icon={faPlus} />
									Agregar nueva dirección
								</button>
							</motion.div>
						)}
					</AnimatePresence>
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
						Continuar
						<FontAwesomeIcon icon={faArrowRight} />
					</button>
				</div>
			</motion.section>

			{/* Modal dirección */}
			<AddressFormModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSuccess={fetchAddresses}
				address={addressToEdit}
			/>
		</main>
	);
}
