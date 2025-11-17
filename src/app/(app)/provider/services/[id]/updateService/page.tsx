"use client";

import { useState, useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuthStore } from "@/app/store/auth.store";
import { getCategories } from "@/app/services/provider.service";
import { getOneService, updateService } from "../../../serviceRegister/service.service";
import { useRouter, useParams, notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowLeft,
	faCamera,
	faImage,
} from "@fortawesome/free-solid-svg-icons";

// =====================
// VALIDACIÓN (foto opcional en UPDATE)
// =====================
const ServiceSchema = Yup.object().shape({
	name: Yup.string().required("El nombre es obligatorio").min(3),
	description: Yup.string().required("La descripción es obligatoria").min(10),
	price: Yup.number().required("El precio es obligatorio").positive(),
	duration: Yup.number()
		.required("La duración es obligatoria")
		.oneOf([15, 30, 45, 60, 75, 90, 120], "Duración inválida"),
	categoryId: Yup.string().required("La categoría es obligatoria"),
	photoFile: Yup.mixed(), // OPCIONAL
});

export default function ServiceUpdateForm() {
	const router = useRouter();
	const { id } = useParams();
	const { user } = useAuthStore();

	const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
	const [service, setService] = useState<any>(null);
	const [preview, setPreview] = useState<string | null>(null);

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	// =====================
	// CATEGORÍAS
	// =====================
	useEffect(() => {
		(async () => {
			const res = await getCategories();
			setCategories(res);
		})();
	}, []);

	// =====================
	// CARGAR SERVICIO
	// =====================
	useEffect(() => {
		if (!id) return;

		(async () => {
			try {
				const data = await getOneService(id as string);
				setService(data);
				setPreview(data?.photos?.[0] || null);
			} catch (err) {
				notFound();
			}
		})();
	}, [id]);

	if (!service) {
		return (
			<div className="flex justify-center items-center h-screen text-gray-500">
				Cargando servicio...
			</div>
		);
	}

	// =====================
	// ENVÍO DEL FORMULARIO
	// =====================
	const handleSubmit = async (values: any) => {
		if (!user) return alert("Usuario no autenticado");

		const formData = new FormData();

		formData.append("name", values.name);
		formData.append("description", values.description);
		formData.append("price", values.price);
		formData.append("duration", values.duration);
		formData.append("categoryId", values.categoryId);

		// Foto nueva SOLO si la cambia
		if (values.photoFile) {
			formData.append("photos", values.photoFile);
		}

		try {
			await updateService(id as string, formData);
			alert("Servicio actualizado correctamente");
			router.back();
		} catch (err) {
			console.error(err);
			alert("Error actualizando servicio");
		}
	};

	return (
		<div className="flex flex-col items-center">
			<div className="max-w-lg w-full mx-auto p-6 bg-white rounded-2xl shadow-lg text-[var(--color-primary)]">
				<h2 className="text-2xl font-semibold mb-4 text-center">
					Modificar servicio
				</h2>

				<Formik
					enableReinitialize
					initialValues={{
						name: service.name,
						description: service.description,
						price: service.price,
						duration: service.duration,
						categoryId: service.category?.id || "",
						photoFile: null,
					}}
					validationSchema={ServiceSchema}
					onSubmit={handleSubmit}
				>
					{({ setFieldValue, isSubmitting }) => (
						<Form className="space-y-4">
							{/* Nombre */}
							<div>
								<label className="block mb-1 font-medium">
									Nombre del servicio
								</label>
								<Field
									name="name"
									className="w-full p-2 rounded border border-gray-600"
								/>
								<ErrorMessage name="name" component="p" className="text-red-400 text-sm" />
							</div>

							{/* Descripción */}
							<div>
								<label className="block mb-1 font-medium">
									Descripción
								</label>
								<Field
									as="textarea"
									name="description"
									className="w-full p-2 rounded border border-gray-600"
								/>
								<ErrorMessage name="description" component="p" className="text-red-400 text-sm" />
							</div>

							{/* Precio */}
							<div>
								<label className="block mb-1 font-medium">Precio</label>
								<Field
									type="number"
									name="price"
									className="w-full p-2 rounded border border-gray-600"
								/>
								<ErrorMessage name="price" component="p" className="text-red-400 text-sm" />
							</div>

							{/* FOTO */}
							<div>
								<label className="block mb-1 font-medium">
									Foto del servicio
								</label>

								<div className="flex flex-col items-center gap-4">
									{/* Preview */}
									<div className="relative w-40 h-40 rounded-xl overflow-hidden border-4 border-[var(--color-primary)]">
										{preview ? (
											<img src={preview} className="w-full h-full object-cover" />
										) : (
											<div className="w-full h-full flex items-center justify-center bg-gray-100">
												<FontAwesomeIcon icon={faImage} className="text-gray-400 text-3xl" />
											</div>
										)}
									</div>

									<input
										type="file"
										ref={fileInputRef}
										accept="image/*"
										className="hidden"
										onChange={(e) => {
											const file = e.target.files?.[0] || null;
											if (!file) return;
											setPreview(URL.createObjectURL(file));
											setFieldValue("photoFile", file);
										}}
									/>

									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="px-5 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[#1b2a5e] transition"
									>
										<FontAwesomeIcon icon={faCamera} /> Cambiar imagen
									</button>

									<ErrorMessage name="photoFile" component="p" className="text-red-400 text-sm" />
								</div>
							</div>

							{/* Duración */}
							<div>
								<label className="block mb-1 font-medium">Duración</label>
								<Field
									as="select"
									name="duration"
									className="w-full p-2 rounded border border-gray-600"
								>
									<option value="">Seleccionar...</option>
									{[15, 30, 45, 60, 75, 90, 120].map((m) => (
										<option key={m} value={m}>
											{m} min
										</option>
									))}
								</Field>
								<ErrorMessage name="duration" component="p" className="text-red-400 text-sm" />
							</div>

							{/* Categoría */}
							<div>
								<label className="block mb-1 font-medium">Categoría</label>
								<Field
									as="select"
									name="categoryId"
									className="w-full p-2 rounded border border-gray-600"
								>
									<option value="">Seleccionar...</option>
									{categories.map((c) => (
										<option key={c.id} value={c.id}>
											{c.name}
										</option>
									))}
								</Field>
								<ErrorMessage name="categoryId" component="p" className="text-red-400 text-sm" />
							</div>

							{/* BOTÓN */}
							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full bg-[var(--color-primary)] text-white py-2 rounded-lg hover:scale-105 transition mt-3"
							>
								{isSubmitting ? "Guardando..." : "Guardar cambios"}
							</button>
						</Form>
					)}
				</Formik>
			</div>

			<button
				onClick={() => router.back()}
				className="max-w-[200px] py-1 px-2 text-white bg-[var(--color-primary)] rounded-lg mt-5 hover:scale-105 transition"
			>
				<FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
				Volver a Servicios
			</button>
		</div>
	);
}
