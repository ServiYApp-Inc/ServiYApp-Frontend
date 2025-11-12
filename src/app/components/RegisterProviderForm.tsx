"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUser,
	faEnvelope,
	faPhone,
	faLock,
	faGlobe,
	faCity,
	faMapMarkerAlt,
	faEye,
	faEyeSlash,
	faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import ReactCountryFlag from "react-country-flag";
import "react-toastify/dist/ReactToastify.css";
import {
	getCitiesByRegion,
	getCountries,
	getRegionsByCountry,
	registerProvider,
} from "../services/provider.service";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/auth.store";
import { toast } from "react-toastify";

const registerSchema = Yup.object().shape({
	names: Yup.string()
		.matches(
			/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/,
			"Solo letras y espacios (2–50 caracteres)."
		)
		.required("El nombre es obligatorio."),
	surnames: Yup.string()
		.matches(
			/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/,
			"Solo letras y espacios (2–50 caracteres)."
		)
		.required("El apellido es obligatorio."),
	userName: Yup.string()
		.matches(
			/^[a-zA-Z0-9.]+$/,
			"Solo se permiten letras, números y puntos."
		)
		.min(3)
		.max(20)
		.required("El nombre de usuario es obligatorio."),
	email: Yup.string()
		.email("Correo electrónico no válido.")
		.required("El correo es obligatorio."),
	password: Yup.string()
		.min(8, "Debe tener al menos 8 caracteres.")
		.matches(/[A-Z]/, "Debe incluir una mayúscula.")
		.matches(/[a-z]/, "Debe incluir una minúscula.")
		.matches(/\d/, "Debe incluir un número.")
		.matches(/[@$!%*?&]/, "Debe incluir un símbolo especial.")
		.required("La contraseña es obligatoria."),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref("password")], "Las contraseñas no coinciden.")
		.required("Confirma tu contraseña."),
	countryId: Yup.string().required("Selecciona un país."),
	regionId: Yup.string().required("Selecciona una región."),
	cityId: Yup.string().required("Selecciona una ciudad."),
	address: Yup.string()
		.min(3, "La dirección es demasiado corta.")
		.required("La dirección es obligatoria."),
	phone: Yup.string()
		.matches(/^[0-9]{8,10}$/, "Solo números (8–10 dígitos).")
		.required("El teléfono es obligatorio."),
});

export default function RegisterProviderForm() {
	const router = useRouter();
	const { setAuth } = useAuthStore();
	const [countries, setCountries] = useState<any[]>([]);
	const [regions, setRegions] = useState<any[]>([]);
	const [cities, setCities] = useState<any[]>([]);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	useEffect(() => {
		const fetchCountriesData = async () => {
			try {
				const data = await getCountries();
				setCountries(data);
			} catch (error) {
				console.error("Error cargando países:", error);
			}
		};
		fetchCountriesData();
	}, []);

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -30 }}
			transition={{ duration: 0.4 }}
			className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 md:px-8 py-6"
			style={{ backgroundColor: "var(--background)" }}
		>
			

			<div
				className="w-full max-w-md rounded-2xl shadow-sm p-6 sm:p-8 md:p-10 border"
				style={{
					backgroundColor: "var(--color-bg-light)",
					borderColor: "var(--color-bg-hover)",
				}}
			>
				<h1
					className="text-2xl font-bold text-center mb-1"
					style={{ color: "var(--color-primary)" }}
				>
					Crea tu cuenta de proveedor
				</h1>
				<p
					className="text-center mb-6 text-sm"
					style={{ color: "var(--color-foreground)" }}
				>
					Regístrate o continúa con Google
				</p>

				<Formik
					initialValues={{
						names: "",
						surnames: "",
						userName: "",
						email: "",
						password: "",
						confirmPassword: "",
						countryId: "",
						regionId: "",
						cityId: "",
						address: "",
						phone: "",
					}}
					validationSchema={registerSchema}
					onSubmit={async (values, { setSubmitting }) => {
						try {
							const selectedCountry = countries.find(
								(c) => c.id === values.countryId
							);
							const phone = `${
								selectedCountry?.lada?.replace("+", "") || ""
							}${values.phone}`;

							const payload = {
								...values,
								phone,
							};

							const res = await registerProvider(payload);
							const { access_token, provider } = res;

							if (access_token && provider) {
								setAuth({
									token: access_token,
									role: "provider",
									user: provider,
								});

								toast.success(
									"¡Registro exitoso! Bienvenida a ServiYApp"
								);
								setTimeout(
									() => router.push("/provider/dashboard"),
									2000
								);
							} else {
								toast.warning(
									"Registro completado. Inicia sesión manualmente.",
									{
										autoClose: 2500,
									}
								);
								setTimeout(
									() => router.push("/loginProvider"),
									2000
								);
							}
						} catch (error: any) {
							console.error(
								"Error en el registro:",
								error.response?.data
							);
							if (error.response?.status === 409) {
								Swal.fire({
									icon: "error",
									title: "Correo ya registrado",
									text: "Por favor usa otro correo electrónico",
								});
							} else {
								Swal.fire({
									icon: "error",
									title: "Error en el registro",
									text: "Intenta nuevamente más tarde.",
								});
							}
						} finally {
							setSubmitting(false);
						}
					}}
				>
					{({ values, setFieldValue, isSubmitting, isValid }) => (
						<Form className="space-y-4">
							{/* Nombre y Apellido */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								<div className="relative">
									<FontAwesomeIcon
										icon={faUser}
										className="absolute left-3 top-3 text-gray-400"
									/>
									<Field
										type="text"
										name="names"
										placeholder="Nombres"
										className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2"
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
										className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2"
									/>
									<ErrorMessage
										name="surnames"
										component="p"
										className="text-red-500 text-xs mt-1"
									/>
								</div>
							</div>

							{/* Email */}
							<div className="relative">
								<FontAwesomeIcon
									icon={faEnvelope}
									className="absolute left-3 top-3 text-gray-400"
								/>
								<Field
									type="email"
									name="email"
									placeholder="Correo electrónico"
									className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2"
								/>
								<ErrorMessage
									name="email"
									component="p"
									className="text-red-500 text-xs mt-1"
								/>
							</div>

							{/* Username */}
							<div className="relative">
								<FontAwesomeIcon
									icon={faUser}
									className="absolute left-3 top-3 text-gray-400"
								/>
								<Field
									type="text"
									name="userName"
									placeholder="Nombre de usuario"
									className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2"
								/>
								<ErrorMessage
									name="userName"
									component="p"
									className="text-red-500 text-xs mt-1"
								/>
							</div>

							{/* País */}
							<div className="relative w-full">
								<FontAwesomeIcon
									icon={faGlobe}
									className="absolute left-3 top-3 text-gray-400"
								/>
								<Field
									as="select"
									name="countryId"
									className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-white focus:ring-2"
									onChange={async (e: any) => {
										const countryId = e.target.value;
										setFieldValue("countryId", countryId);
										setFieldValue("regionId", "");
										setFieldValue("cityId", "");
										const data = await getRegionsByCountry(
											countryId
										);
										setRegions(data);
									}}
								>
									<option value="">Selecciona un país</option>
									{countries.map((c) => (
										<option key={c.id} value={c.id}>
											{c.name}
										</option>
									))}
								</Field>
							</div>

							{/* Región */}
							<div className="relative w-full">
								<FontAwesomeIcon
									icon={faCity}
									className="absolute left-3 top-3 text-gray-400"
								/>
								<Field
									as="select"
									name="regionId"
									disabled={!values.countryId}
									className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 disabled:opacity-60"
									onChange={async (e: any) => {
										const regionId = e.target.value;
										setFieldValue("regionId", regionId);
										setFieldValue("cityId", "");
										const data = await getCitiesByRegion(
											regionId
										);
										setCities(data);
									}}
								>
									<option value="">
										{values.countryId
											? "Selecciona una región"
											: "Selecciona un país"}
									</option>
									{regions.map((r) => (
										<option key={r.id} value={r.id}>
											{r.name}
										</option>
									))}
								</Field>
							</div>

							{/* Ciudad */}
							<div className="relative w-full">
								<FontAwesomeIcon
									icon={faCity}
									className="absolute left-3 top-3 text-gray-400"
								/>
								<Field
									as="select"
									name="cityId"
									disabled={!values.regionId}
									className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 disabled:opacity-60"
								>
									<option value="">
										{values.regionId
											? "Selecciona una ciudad"
											: "Selecciona una región"}
									</option>
									{cities.map((c) => (
										<option key={c.id} value={c.id}>
											{c.name}
										</option>
									))}
								</Field>
							</div>

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
									className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2"
								/>
							</div>

							{/* Teléfono */}
							<div className="relative flex items-center">
								<FontAwesomeIcon
									icon={faPhone}
									className="absolute left-3 top-3 text-gray-400"
								/>
								<div
									className="absolute left-9 top-2 flex items-center gap-1"
									style={{ width: "95px" }}
								>
									{values.countryId ? (
										<>
											<ReactCountryFlag
												countryCode={
													countries.find(
														(c) =>
															c.id ===
															values.countryId
													)?.code || "MX"
												}
												svg
												style={{
													width: "1.3em",
													height: "1.3em",
													marginRight: "4px",
												}}
											/>
											<span className="text-sm text-gray-700 font-medium">
												{countries
													.find(
														(c) =>
															c.id ===
															values.countryId
													)
													?.lada?.replace("+", "") ||
													"52"}
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
									className="w-full pl-[125px] pr-3 py-2 border rounded-lg text-sm focus:ring-2"
								/>
							</div>

							{/* Contraseña */}
							<div className="relative">
								<FontAwesomeIcon
									icon={faLock}
									className="absolute left-3 top-3 text-gray-400"
								/>
								<Field
									type={showPassword ? "text" : "password"}
									name="password"
									placeholder="Contraseña"
									className="w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:ring-2"
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="absolute right-3 top-3 text-gray-400"
								>
									<FontAwesomeIcon
										icon={showPassword ? faEyeSlash : faEye}
									/>
								</button>
							</div>

							{/* Confirmar contraseña */}
							<div className="relative">
								<FontAwesomeIcon
									icon={faLock}
									className="absolute left-3 top-3 text-gray-400"
								/>
								<Field
									type={
										showConfirmPassword
											? "text"
											: "password"
									}
									name="confirmPassword"
									placeholder="Confirmar contraseña"
									className="w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:ring-2"
								/>
								<button
									type="button"
									onClick={() =>
										setShowConfirmPassword(
											!showConfirmPassword
										)
									}
									className="absolute right-3 top-3 text-gray-400"
								>
									<FontAwesomeIcon
										icon={
											showConfirmPassword
												? faEyeSlash
												: faEye
										}
									/>
								</button>
							</div>

							{/* Botón principal */}
							<button
								type="submit"
								disabled={!isValid || isSubmitting}
								style={{
									backgroundColor: "var(--color-primary)",
								}}
								className="w-full font-semibold text-white py-2 rounded-lg text-sm sm:text-base flex justify-center items-center"
							>
								{isSubmitting ? (
									<FontAwesomeIcon icon={faSpinner} spin />
								) : (
									"Registrarme"
								)}
							</button>

							{/* Divider y Google */}
							<div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500 mt-2">
								<span className="w-1/4 border-b border-gray-300"></span>
								<span>O intenta</span>
								<span className="w-1/4 border-b border-gray-300"></span>
							</div>

							<button
								type="button"
								className="w-full flex items-center justify-center gap-2 font-medium py-2 rounded-lg border text-sm sm:text-base"
								style={{
									borderColor: "var(--color-primary)",
									backgroundColor: "var(--color-bg-light)",
									color: "var(--color-primary)",
								}}
								onClick={() => {
									window.location.href = `${process.env.NEXT_PUBLIC_API_URL}auth/google/provider`;
								}}
							>
								<FontAwesomeIcon icon={faGoogle} />
								Registrarme con Google
							</button>
						</Form>
					)}
				</Formik>
			</div>
		</motion.div>
	);
}
