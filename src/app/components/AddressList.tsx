"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import AddressFormModal from "./AddressFormModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faHome,
	faMapMarkerAlt,
	faGlobe,
	faPenToSquare,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { deactivateAddress, getAddresses } from "../services/provider.service";
import { toast } from "react-toastify";
import MapAddress from "./MapAddress";

export default function AddressList() {
	const { token } = useAuthStore();
	const [addresses, setAddresses] = useState<any[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchAddresses = async () => {
		try {
			setLoading(true);
			const data = await getAddresses(token!);

			// ✅ Filtrar solo direcciones activas
			const active = Array.isArray(data)
				? data.filter((a) => a.status === true)
				: [];
			console.log(data);
			setAddresses(active);
		} catch (error: any) {
			if (error?.status === 404 || error?.response?.status === 404) {
				setAddresses([]);
			} else {
				console.error("Error al cargar direcciones:", error);
			}
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("¿Seguro que quieres eliminar esta dirección?")) return;

		try {
			await deactivateAddress(id, token!);
			toast.success("Dirección eliminada correctamente");
			fetchAddresses();
		} catch (err: any) {
			console.error("Error al eliminar dirección:", err);
			toast.error(
				err.response?.data?.message || "Error al eliminar dirección"
			);
		}
	};

	useEffect(() => {
		if (token) fetchAddresses();
	}, [token]);

	return (
		<section className="bg-white border border-gray-200 rounded-3xl shadow-md p-8">
			<div className="flex justify-between items-center mb-6">
				<h3 className="text-2xl font-bold text-[var(--color-primary)]">
					Direcciones guardadas
				</h3>

				<button
					onClick={() => {
						setSelectedAddress(null);
						setIsModalOpen(true);
					}}
					className="px-5 py-2 bg-[var(--color-primary)] text-white rounded-lg font-semibold hover:bg-[var(--color-primary-hover)] transition-all"
				>
					Agregar nueva
				</button>
			</div>

			{/* ESTADOS */}
			{loading ? (
				<p className="text-gray-500 text-sm">Cargando direcciones...</p>
			) : addresses.length === 0 ? (
				<p className="text-gray-500 text-sm">
					No tienes direcciones registradas todavía.
				</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{addresses.map((a) => (
						<div
							key={a.id}
							className="border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
						>
							{/* Nombre */}
							<h4 className="text-lg font-bold text-[var(--color-primary)] mb-3">
								{a.name}
							</h4>

							<div className="flex flex-col gap-3 text-gray-700">
								{/* Dirección */}
								<div className="flex items-start gap-3">
									<FontAwesomeIcon
										icon={faHome}
										className="text-[var(--color-primary)] w-5 h-5 mt-1"
									/>
									<p className="font-medium">
										<span className="block text-gray-500 text-sm">
											Dirección
										</span>
										{a.address}
									</p>
								</div>

								{/* Colonia / Ciudad / Estado */}
								<div className="flex items-start gap-3">
									<FontAwesomeIcon
										icon={faMapMarkerAlt}
										className="text-[var(--color-primary)] w-5 h-5 mt-1"
									/>
									<p className="font-medium">
										<span className="block text-gray-500 text-sm">
											Colonia / Ciudad / Estado
										</span>
										{a.neighborhood}, {a.city?.name},{" "}
										{a.region?.name}
									</p>
								</div>

								{/* País */}
								<div className="flex items-start gap-3">
									<FontAwesomeIcon
										icon={faGlobe}
										className="text-[var(--color-primary)] w-5 h-5 mt-1"
									/>
									<p className="font-medium">
										<span className="block text-gray-500 text-sm">
											País
										</span>
										{a.country?.name}
									</p>
								</div>
							</div>
							{/* MAPA */}
							{a.lat && a.lng && (
								<div className="mt-4">
									<MapAddress
										lat={a.lat}
										lng={a.lng}
										height="200px"
									/>
								</div>
							)}
							{/* Botones */}
							<div className="flex justify-end gap-4 mt-4">
								<button
									onClick={() => {
										setSelectedAddress(a);
										setIsModalOpen(true);
									}}
									className="flex items-center gap-2 text-[var(--color-primary)] font-semibold hover:underline transition-all"
								>
									<FontAwesomeIcon icon={faPenToSquare} />
									Editar
								</button>

								<button
									onClick={() => handleDelete(a.id)}
									className="flex items-center gap-2 text-red-500 font-semibold hover:underline transition-all"
								>
									<FontAwesomeIcon icon={faTrash} />
									Eliminar
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* MODAL */}
			<AddressFormModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSuccess={fetchAddresses}
				address={selectedAddress}
			/>
		</section>
	);
}
