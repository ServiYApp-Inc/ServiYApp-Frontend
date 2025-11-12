"use client";

import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import { useAuthStore } from "@/app/store/auth.store";
import {
	createAddress,
	getCitiesByRegion,
	getRegionsByCountry,
	updateAddress,
} from "../services/provider.service";

const addressSchema = Yup.object().shape({
	name: Yup.string()
		.required("El nombre identificador es obligatorio.")
		.min(3, "Debe tener al menos 3 caracteres.")
		.max(50, "Máximo 50 caracteres."),
	address: Yup.string()
		.required("La dirección completa es obligatoria.")
		.min(5, "Debe tener al menos 5 caracteres.")
		.max(150, "Máximo 150 caracteres."),
	neighborhood: Yup.string().max(100, "Máximo 100 caracteres."),
	buildingType: Yup.string().max(50, "Máximo 50 caracteres."),
	comments: Yup.string().max(200, "Máximo 200 caracteres."),
	regionId: Yup.string().required("Selecciona una región."),
	cityId: Yup.string().required("Selecciona una ciudad."),
});

export default function AddressFormModal({
	isOpen,
	onClose,
	onSuccess,
	address,
}: {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	address?: any;
}) {
	const { token, user } = useAuthStore();
	const [regions, setRegions] = useState<any[]>([]);
	const [cities, setCities] = useState<any[]>([]);

	const userCountryId = user?.country?.id;
	const userCountryName = user?.country?.name;

	useEffect(() => {
		if (userCountryId) getRegionsByCountry(userCountryId).then(setRegions);
	}, [userCountryId]);

	useEffect(() => {
		if (address?.region?.id)
			getCitiesByRegion(address.region.id).then(setCities);
	}, [address]);

	const handleRegionChange = async (id: string) => {
		setCities(await getCitiesByRegion(id));
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center px-4"
				onClick={onClose}
			>
				<motion.div
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.9, opacity: 0 }}
					onClick={(e) => e.stopPropagation()}
					className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-200 relative 
					max-h-[92vh] flex flex-col"
				>
					{/* Cerrar modal */}
					<button
						onClick={onClose}
						className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold z-20"
					>
						×
					</button>

					{/* Encabezado fijo */}
					<h2 className="text-2xl font-bold text-[var(--color-primary)] py-5 px-8 text-center border-b sticky top-0">
						{address ? "Editar dirección" : "Nueva dirección"}
					</h2>

					{/* Contenido scrollable */}
					<div className="px-8 py-6 overflow-y-auto">
						<Formik
							initialValues={{
								name: address?.name || "",
								address: address?.address || "",
								neighborhood: address?.neighborhood || "",
								buildingType: address?.buildingType || "",
								comments: address?.comments || "",
								countryId: userCountryId || "",
								regionId: address?.region?.id || "",
								cityId: address?.city?.id || "",
							}}
							validationSchema={addressSchema}
							enableReinitialize
							onSubmit={async (values, { setSubmitting, resetForm }) => {
								try {
									if (address) {
										await updateAddress(address.id, values, token!);
										toast.success("Dirección actualizada correctamente");
									} else {
										const payload = {
											...values,
											status: true,
											countryId: userCountryId,
											userId: user?.id,
										};

										console.log("📦 Payload enviado:", payload);

										await createAddress(payload, token!);
										toast.success("Dirección creada correctamente");
										resetForm();
									}
									onSuccess();
									onClose();
								} catch (err: any) {
									console.error("Error al guardar dirección:", err);
									toast.error(
										err.response?.data?.message ||
											"Error al guardar la dirección"
									);
								} finally {
									setSubmitting(false);
								}
							}}
						>
							{({ isSubmitting, setFieldValue }) => (
								<Form className="space-y-4 text-gray-700">
									{/* Nombre identificador */}
									<div>
										<label className="block text-sm text-gray-500 mb-1">
											Nombre de la dirección
										</label>
										<Field
											name="name"
											placeholder="Ej. Casa, Oficina, Departamento"
											className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
										/>
										<ErrorMessage
											name="name"
											component="p"
											className="text-red-500 text-sm mt-1"
										/>
									</div>

									{/* Dirección completa */}
									<div>
										<label className="block text-sm text-gray-500 mb-1">
											Dirección (calle y número)
										</label>
										<Field
											name="address"
											placeholder="Ej. Av. de los Cedros #125"
											className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
										/>
										<ErrorMessage
											name="address"
											component="p"
											className="text-red-500 text-sm mt-1"
										/>
									</div>

									{/* Barrio */}
									<div>
										<label className="block text-sm text-gray-500 mb-1">
											Barrio o zona (opcional)
										</label>
										<Field
											name="neighborhood"
											placeholder="Ej. Col. Reforma"
											className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
										/>
										<ErrorMessage
											name="neighborhood"
											component="p"
											className="text-red-500 text-sm mt-1"
										/>
									</div>

									{/* Tipo de edificación */}
									<div>
										<label className="block text-sm text-gray-500 mb-1">
											Tipo de edificación
										</label>
										<Field
											as="select"
											name="buildingType"
											className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
										>
											<option value="">Selecciona una opción</option>
											<option value="Casa">Casa</option>
											<option value="Departamento">Departamento</option>
											<option value="Oficina">Oficina</option>
											<option value="Local comercial">Local comercial</option>
											<option value="Otro">Otro</option>
										</Field>
										<ErrorMessage
											name="buildingType"
											component="p"
											className="text-red-500 text-sm mt-1"
										/>
									</div>

									{/* Comentarios */}
									<div>
										<label className="block text-sm text-gray-500 mb-1">
											Comentarios adicionales (opcional)
										</label>
										<Field
											as="textarea"
											name="comments"
											rows={3}
											placeholder="Ej. Tocar el timbre azul o dejar el paquete en recepción."
											className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none resize-none"
										/>
										<ErrorMessage
											name="comments"
											component="p"
											className="text-red-500 text-sm mt-1"
										/>
									</div>

									{/* País readonly */}
									<div>
										<label className="block text-sm text-gray-500 mb-1">
											País
										</label>
										<input
											type="text"
											value={userCountryName || "No especificado"}
											readOnly
											className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
										/>
									</div>

									{/* Región */}
									<div>
										<label className="block text-sm text-gray-500 mb-1">
											Estado / Región
										</label>
										<Field
											as="select"
											name="regionId"
											className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
											onChange={(e: any) => {
												setFieldValue("regionId", e.target.value);
												handleRegionChange(e.target.value);
											}}
										>
											<option value="">Selecciona una región</option>
											{regions.map((r) => (
												<option key={r.id} value={r.id}>
													{r.name}
												</option>
											))}
										</Field>
										<ErrorMessage
											name="regionId"
											component="p"
											className="text-red-500 text-sm mt-1"
										/>
									</div>

									{/* Ciudad */}
									<div>
										<label className="block text-sm text-gray-500 mb-1">
											Ciudad
										</label>
										<Field
											as="select"
											name="cityId"
											className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
										>
											<option value="">Selecciona una ciudad</option>
											{cities.map((c) => (
												<option key={c.id} value={c.id}>
													{c.name}
												</option>
											))}
										</Field>
										<ErrorMessage
											name="cityId"
											component="p"
											className="text-red-500 text-sm mt-1"
										/>
									</div>

									{/* Botones */}
									<div className="flex justify-end gap-3 mt-6 pb-3">
										<button
											type="button"
											onClick={onClose}
											className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
										>
											Cancelar
										</button>

										<button
											type="submit"
											disabled={isSubmitting}
											className="px-5 py-2 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-hover)] transition-all"
										>
											{isSubmitting
												? "Guardando..."
												: address
												? "Guardar cambios"
												: "Guardar dirección"}
										</button>
									</div>
								</Form>
							)}
						</Formik>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
