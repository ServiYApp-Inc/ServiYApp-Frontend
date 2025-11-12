"use client";

import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUser,
	faPhone,
	faGlobe,
	faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import ReactCountryFlag from "react-country-flag";
import { toast } from "react-toastify";
import { Api } from "@/app/services/api";
import { useAuthStore } from "@/app/store/auth.store";

const profileSchema = Yup.object().shape({
	names: Yup.string()
		.min(2, "Demasiado corto.")
		.required("El nombre es obligatorio."),
	surnames: Yup.string()
		.min(2, "Demasiado corto.")
		.required("Los apellidos son obligatorios."),
	phone: Yup.string()
		.matches(/^[0-9]{8,15}$/, "Número inválido (solo dígitos).")
		.required("El teléfono es obligatorio."),
	country: Yup.string().required("Selecciona un país."),
});

export default function EditUserForm({ onSuccess }: { onSuccess?: () => void }) {
	const { user, token, setAuth } = useAuthStore();
	const [loading, setLoading] = useState(false);
	const [countries, setCountries] = useState<
		{ id: string; name: string; code: string; lada: string }[]
	>([]);

	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const { data } = await Api.get("/locations/countries");
				setCountries(data);
			} catch (error) {
				console.error("Error al cargar países:", error);
				toast.error("No se pudieron cargar los países.");
			}
		};
		fetchCountries();
	}, []);

	const handleSubmit = async (values: any) => {
		if (!token) {
			toast.error("Tu sesión expiró. Inicia sesión nuevamente.");
			return;
		}

		setLoading(true);
		try {
			const selectedCountry = countries.find((c) => c.id === values.country);
			const lada = selectedCountry?.lada?.replace("+", "") || "";
			const fullPhone = `${lada}${values.phone}`;

			await Api.patch(
				`/users/${user?.id}`,
				{
					names: values.names,
					surnames: values.surnames,
					phone: fullPhone,
					country: values.country,
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			// ✅ Ahora traemos el usuario completo actualizado
			const { data: freshUser } = await Api.get(`/users/${user?.id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			setAuth({ token, role: freshUser.role, user: freshUser });

			onSuccess?.(); // ✅ cerrar modal y refrescar vista
		} catch (err) {
			console.error("Error al actualizar usuario:", err);
			toast.error("No se pudo actualizar tu perfil.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className="w-full max-w-md mx-auto rounded-2xl shadow-sm p-6 border"
			style={{
				backgroundColor: "var(--color-bg-light)",
				borderColor: "var(--color-bg-hover)",
			}}
		>
			<h2
				className="text-2xl font-bold text-center mb-1"
				style={{ color: "var(--color-primary)" }}
			>
				Editar perfil
			</h2>
			<p className="text-center mb-6 text-sm text-gray-600">
				Actualiza tu información personal
			</p>

			<Formik
				initialValues={{
					names: user?.names || "",
					surnames: user?.surnames || "",
					phone: user?.phone ? user.phone.slice(-10) : "",
					country: user?.country?.id || "",
				}}
				validationSchema={profileSchema}
				onSubmit={handleSubmit}
				enableReinitialize
			>
				{({ values, setFieldValue }) => {
					const selectedCountry = countries.find(
						(c) => c.id === values.country
					);
					return (
						<Form className="space-y-4">
							{/* Nombre */}
							<div className="relative">
								<FontAwesomeIcon
									icon={faUser}
									className="absolute left-3 top-3 text-gray-400"
									style={{ width: "14px", height: "14px" }}
								/>
								<Field
									type="text"
									name="names"
									placeholder="Nombre(s)"
									className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none"
								/>
								<ErrorMessage
									name="names"
									component="p"
									className="text-red-500 text-xs mt-1"
								/>
							</div>

							{/* Apellidos */}
							<div className="relative">
								<FontAwesomeIcon
									icon={faUser}
									className="absolute left-3 top-3 text-gray-400"
									style={{ width: "14px", height: "14px" }}
								/>
								<Field
									type="text"
									name="surnames"
									placeholder="Apellidos"
									className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none"
								/>
								<ErrorMessage
									name="surnames"
									component="p"
									className="text-red-500 text-xs mt-1"
								/>
							</div>

							{/* País */}
							<div className="relative">
								<FontAwesomeIcon
									icon={faGlobe}
									className="absolute left-3 top-3 text-gray-400"
									style={{ width: "14px", height: "14px" }}
								/>
								<Field
									as="select"
									name="country"
									className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-white focus:ring-2"
									onChange={(e: any) =>
										setFieldValue("country", e.target.value)
									}
								>
									<option value="">Selecciona un país</option>
									{countries.map((c) => (
										<option key={c.id} value={c.id}>
											{c.name}
										</option>
									))}
								</Field>
								<ErrorMessage
									name="country"
									component="p"
									className="text-red-500 text-xs mt-1"
								/>
							</div>

							{/* Teléfono con LADA */}
							<div className="relative flex items-center">
								<FontAwesomeIcon
									icon={faPhone}
									className="absolute left-3 top-3 text-gray-400"
									style={{ width: "14px", height: "14px" }}
								/>
								<div className="absolute left-9 top-2 flex items-center gap-1 w-[85px]">
									{selectedCountry ? (
										<>
											<ReactCountryFlag
												countryCode={selectedCountry.code}
												svg
												style={{
													width: "1.3em",
													height: "1.3em",
													marginRight: "3px",
												}}
											/>
											<span className="text-sm font-medium text-gray-700">
												{selectedCountry.lada}
											</span>
										</>
									) : (
										<span className="text-sm text-gray-400">
											LADA
										</span>
									)}
								</div>
								<Field
									type="tel"
									name="phone"
									placeholder="Teléfono"
									className="w-full pl-[120px] pr-3 py-2 border rounded-lg text-sm focus:ring-2"
								/>
							</div>
							<ErrorMessage
								name="phone"
								component="p"
								className="text-red-500 text-xs mt-1"
							/>

							{/* Botón guardar */}
							<button
								type="submit"
								disabled={loading}
								className="w-full font-semibold py-2 rounded-lg flex justify-center items-center transition-all duration-200"
								style={{
									backgroundColor: "var(--color-primary)",
									color: "white",
									opacity: loading ? 0.85 : 1,
								}}
							>
								{loading ? (
									<>
										<FontAwesomeIcon
											icon={faSpinner}
											spin
											className="mr-2"
										/>
										Guardando...
									</>
								) : (
									"Guardar cambios"
								)}
							</button>
						</Form>
					);
				}}
			</Formik>
		</div>
	);
}
