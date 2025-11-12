"use client";

import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUser,
	faPhone,
	faCity,
	faMapMarkerAlt,
	faGlobe,
	faSpinner,
	faIdBadge,
} from "@fortawesome/free-solid-svg-icons";
import ReactCountryFlag from "react-country-flag";
import { toast } from "react-toastify";
import { useAuthStore } from "@/app/store/auth.store";
import IProvider from "@/app/interfaces/IProvider";
import {
	getCountries,
	getRegionsByCountry,
	getCitiesByRegion,
	updateProvider,
} from "@/app/services/provider.service";

const providerSchema = Yup.object().shape({
	names: Yup.string()
		.trim()
		.min(2, "Debe tener al menos 2 caracteres")
		.required("El nombre es obligatorio"),
	surnames: Yup.string()
		.trim()
		.min(2, "Debe tener al menos 2 caracteres")
		.required("Los apellidos son obligatorios"),
	userName: Yup.string()
		.trim()
		.min(3, "Debe tener al menos 3 caracteres")
		.required("El nombre de usuario es obligatorio"),
	address: Yup.string().required("La dirección es obligatoria"),
	phone: Yup.string()
		.matches(/^[0-9]{8,15}$/, "Número inválido (solo dígitos).")
		.required("El teléfono es obligatorio"),
	countryId: Yup.string().required("Selecciona un país"),
	regionId: Yup.string().required("Selecciona una región"),
	cityId: Yup.string().required("Selecciona una ciudad"),
});

interface EditProviderFormProps {
	onSuccess: () => void;
}

export default function EditProviderForm({ onSuccess }: EditProviderFormProps) {
	const { user, token, setAuth } = useAuthStore();
	const provider = user as IProvider;

	const [countries, setCountries] = useState<
		{ id: string; name: string; code: string; lada: string }[]
	>([]);
	const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
	const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		getCountries().then(setCountries);
	}, []);

	const handleCountryChange = async (
		countryId: string,
		setFieldValue: (field: string, value: any) => void
	) => {
		setFieldValue("countryId", countryId);
		setFieldValue("regionId", "");
		setFieldValue("cityId", "");
		try {
			const data = await getRegionsByCountry(countryId);
			setRegions(data);
			setCities([]);
		} catch {
			toast.error("Error al cargar regiones.");
		}
	};

	const handleRegionChange = async (
		regionId: string,
		setFieldValue: (field: string, value: any) => void
	) => {
		setFieldValue("regionId", regionId);
		setFieldValue("cityId", "");
		try {
			const data = await getCitiesByRegion(regionId);
			setCities(data);
		} catch {
			toast.error("Error al cargar ciudades.");
		}
	};

	const handleSubmit = async (values: any) => {
		setLoading(true);
		try {
			const selectedCountry = countries.find(
				(c) => c.id === values.countryId
			);
			const lada = selectedCountry?.lada?.replace("+", "") || "";
			const fullPhone = `${lada}${values.phone}`;

			const { data } = await updateProvider(
				provider.id,
				{ ...values, phone: fullPhone },
				token!
			);

			setAuth({ token: token!, role: "provider", user: data });
						onSuccess();
		} catch (error: any) {
			console.error(error);
			toast.error(
				error?.response?.data?.message || "Error al actualizar perfil"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Formik
			initialValues={{
				names: provider?.names || "",
				surnames: provider?.surnames || "",
				userName: provider?.userName || "",
				phone: provider?.phone ? provider.phone.slice(-10) : "",
				address: provider?.address || "",
				countryId: provider?.country?.id || "",
				regionId: provider?.region?.id || "",
				cityId: provider?.city?.id || "",
			}}
			validationSchema={providerSchema}
			onSubmit={handleSubmit}
			enableReinitialize
		>
			{({ values, setFieldValue }) => {
				const selectedCountry = countries.find(
					(c) => c.id === values.countryId
				);

				return (
					<Form className="space-y-5 text-gray-700">
						{/* Nombres y Apellidos */}
						<div className="grid md:grid-cols-2 gap-4">
							<div className="relative">
								<FontAwesomeIcon
									icon={faUser}
									className="absolute left-3 top-3 text-gray-400"
								/>
								<Field
									type="text"
									name="names"
									placeholder="Nombres"
									className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
								/>
								<ErrorMessage
									name="names"
									component="p"
									className="text-red-500 text-xs mt-1"
								/>
							</div>

							<div className="relative">
								<FontAwesomeIcon
									icon={faUser}
									className="absolute left-3 top-3 text-gray-400"
								/>
								<Field
									type="text"
									name="surnames"
									placeholder="Apellidos"
									className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
								/>
								<ErrorMessage
									name="surnames"
									component="p"
									className="text-red-500 text-xs mt-1"
								/>
							</div>
						</div>

						{/* Nombre de usuario */}
						<div className="relative">
							<FontAwesomeIcon
								icon={faIdBadge}
								className="absolute left-3 top-3 text-gray-400"
							/>
							<Field
								type="text"
								name="userName"
								placeholder="Nombre de usuario"
								className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
							/>
							<ErrorMessage
								name="userName"
								component="p"
								className="text-red-500 text-xs mt-1"
							/>
						</div>

						{/* País */}
						<div className="relative">
							<FontAwesomeIcon
								icon={faGlobe}
								className="absolute left-3 top-3 text-gray-400"
							/>
							<Field
								as="select"
								name="countryId"
								value={values.countryId}
								onChange={(e: any) =>
									handleCountryChange(
										e.target.value,
										setFieldValue
									)
								}
								className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
							>
								<option value="">Selecciona país</option>
								{countries.map((c) => (
									<option key={c.id} value={c.id}>
										{c.name}
									</option>
								))}
							</Field>
							<ErrorMessage
								name="countryId"
								component="p"
								className="text-red-500 text-xs mt-1"
							/>
						</div>

						{/* Región */}
						<div className="relative">
							<FontAwesomeIcon
								icon={faCity}
								className="absolute left-3 top-3 text-gray-400"
							/>
							<Field
								as="select"
								name="regionId"
								value={values.regionId}
								onChange={(e: any) =>
									handleRegionChange(
										e.target.value,
										setFieldValue
									)
								}
								className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
							>
								<option value="">Selecciona región</option>
								{regions.map((r) => (
									<option key={r.id} value={r.id}>
										{r.name}
									</option>
								))}
							</Field>
							<ErrorMessage
								name="regionId"
								component="p"
								className="text-red-500 text-xs mt-1"
							/>
						</div>

						{/* Ciudad */}
						<div className="relative">
							<FontAwesomeIcon
								icon={faCity}
								className="absolute left-3 top-3 text-gray-400"
							/>
							<Field
								as="select"
								name="cityId"
								value={values.cityId}
								onChange={(e: any) =>
									setFieldValue("cityId", e.target.value)
								}
								className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
							>
								<option value="">Selecciona ciudad</option>
								{cities.map((c) => (
									<option key={c.id} value={c.id}>
										{c.name}
									</option>
								))}
							</Field>
							<ErrorMessage
								name="cityId"
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

						{/* Dirección */}
						<div className="relative">
							<FontAwesomeIcon
								icon={faMapMarkerAlt}
								className="absolute left-3 top-3 text-gray-400"
							/>
							<Field
								type="text"
								name="address"
								placeholder="Dirección"
								className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
							/>
							<ErrorMessage
								name="address"
								component="p"
								className="text-red-500 text-xs mt-1"
							/>
						</div>

						{/* Botón */}
						<motion.button
							type="submit"
							whileTap={{ scale: 0.97 }}
							disabled={loading}
							className="w-full bg-[var(--color-primary)] text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all"
						>
							{loading && (
								<FontAwesomeIcon
									icon={faSpinner}
									spin
									className="text-white"
								/>
							)}
							{loading ? "Guardando..." : "Guardar cambios"}
						</motion.button>
					</Form>
				);
			}}
		</Formik>
	);
}
