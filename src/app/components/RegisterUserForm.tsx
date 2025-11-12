"use client";

import * as Yup from "yup";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faEnvelope,
	faLock,
	faUser,
	faGlobe,
	faPhone,
	faEye,
	faEyeSlash,
	faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { ErrorMessage, Field, Form, Formik } from "formik";
import "react-toastify/dist/ReactToastify.css";
import ReactCountryFlag from "react-country-flag";
import { getCountries } from "../services/provider.service";
import { Api } from "@/app/services/api";
import { useAuthStore } from "@/app/store/auth.store";
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
	email: Yup.string()
		.email("Correo electrónico no válido.")
		.required("El correo electrónico es obligatorio."),
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
	phone: Yup.string()
		.matches(/^[0-9]{8,12}$/, "Solo números (8–12 dígitos).")
		.required("El teléfono es obligatorio."),
	country: Yup.string().required("Selecciona un país."),
});

export default function RegisterUserForm() {
	const router = useRouter();
	const { setAuth } = useAuthStore();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [countries, setCountries] = useState<any[]>([]);

	useEffect(() => {
		const fetchCountries = async () => {
			const data = await getCountries();
			setCountries(data);
		};
		fetchCountries();
	}, []);

	const handleSubmit = async (
		values: any,
		{ setSubmitting, resetForm }: any
	) => {
		try {
			const selectedCountry = countries.find(
				(c) => c.id === values.country
			);
			const lada = selectedCountry?.lada?.replace("+", "") || "";
			const fullPhone = `${lada}${values.phone}`;

			const payload = {
				names: values.names,
				surnames: values.surnames,
				email: values.email,
				password: values.password,
				phone: fullPhone,
				role: "user",
				country: values.country,
			};

			const { data } = await Api.post("/auth/register/user", payload);

			// ✅ Si el backend devuelve token y user → autenticar directamente
			if (data?.access_token && data?.user) {
				setAuth({
					token: data.access_token,
					role: data.user.role || "",
					user: data.user,
				});

				toast.success("¡Registro exitoso! Bienvenida", {
					autoClose: 2000,
				});
				resetForm();
				setTimeout(() => router.push("/user/dashboard"), 2000);
			} else {
				toast.warning(
					"Registro completado. Inicia sesión manualmente.",
					{ autoClose: 2500 }
				);
				setTimeout(() => router.push("/loginUser"), 2000);
			}
		} catch (error: any) {
			const msg =
				error?.response?.data?.message ||
				"Error al registrar usuario. Intenta nuevamente.";
			toast.error(msg, { autoClose: 2500 });
		} finally {
			setSubmitting(false);
		}
	};

	const handleGoogle = () => {
		const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/";
		window.location.href = `${base}auth/google/user`;
	};

	return (
		<div
			className="flex flex-col items-center justify-center min-h-screen px-4"
			style={{ backgroundColor: "var(--background)" }}
		>
			
			<div
				className="w-full max-w-md rounded-2xl shadow-sm p-8 border"
				style={{
					backgroundColor: "var(--color-bg-light)",
					borderColor: "var(--color-bg-hover)",
				}}
			>
				<h1
					className="text-2xl font-bold text-center mb-1"
					style={{ color: "var(--color-primary)" }}
				>
					Crea tu cuenta
				</h1>
				<p
					className="text-center mb-6 text-sm"
					style={{ color: "var(--color-foreground)" }}
				>
					Regístrate para disfrutar de nuestros servicios de belleza
				</p>

				<Formik
					initialValues={{
						names: "",
						surnames: "",
						email: "",
						password: "",
						confirmPassword: "",
						phone: "",
						country: "",
					}}
					validationSchema={registerSchema}
					onSubmit={handleSubmit}
				>
					{({ values, setFieldValue, isSubmitting, isValid }) => (
						<Form className="space-y-4">
							{/* Nombre */}
							<div className="relative">
								<FontAwesomeIcon
									icon={faUser}
									className="absolute left-3 top-3 text-gray-400 w-3.5 h-3.5"
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
									className="absolute left-3 top-3 text-gray-400 w-3.5 h-3.5"
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

							{/* Correo */}
							<div className="relative">
								<FontAwesomeIcon
									icon={faEnvelope}
									className="absolute left-3 top-3 text-gray-400 w-3.5 h-3.5"
								/>
								<Field
									type="email"
									name="email"
									placeholder="Correo electrónico"
									className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none"
								/>
								<ErrorMessage
									name="email"
									component="p"
									className="text-red-500 text-xs mt-1"
								/>
							</div>

							{/* País */}
							<div className="relative">
								<FontAwesomeIcon
									icon={faGlobe}
									className="absolute left-3 top-3 text-gray-400 w-3.5 h-3.5"
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

							{/* Teléfono */}
							<div className="relative flex items-center">
								<FontAwesomeIcon
									icon={faPhone}
									className="absolute left-3 top-3 text-gray-400 w-3.5 h-3.5"
								/>
								<div className="absolute left-9 top-2 flex items-center gap-1 w-[85px]">
									{values.country ? (
										<>
											<ReactCountryFlag
												countryCode={
													countries.find(
														(c) =>
															c.id ===
															values.country
													)?.code
												}
												svg
												style={{
													width: "1.3em",
													height: "1.3em",
													marginRight: "3px",
												}}
											/>
											<span className="text-sm font-medium text-gray-700">
												{
													countries.find(
														(c) =>
															c.id ===
															values.country
													)?.lada
												}
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

							{/* Contraseña */}
							<div className="relative">
								<FontAwesomeIcon
									icon={faLock}
									className="absolute left-3 top-3 text-gray-400 w-3.5 h-3.5"
								/>
								<Field
									type={showPassword ? "text" : "password"}
									name="password"
									placeholder="Contraseña"
									className="w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none"
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
										className="w-3.5 h-3.5"
									/>
								</button>
								<ErrorMessage
									name="password"
									component="p"
									className="text-red-500 text-xs mt-1"
								/>
							</div>

							{/* Confirmar contraseña */}
							<div className="relative">
								<FontAwesomeIcon
									icon={faLock}
									className="absolute left-3 top-3 text-gray-400 w-3.5 h-3.5"
								/>
								<Field
									type={
										showConfirmPassword
											? "text"
											: "password"
									}
									name="confirmPassword"
									placeholder="Confirmar contraseña"
									className="w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none"
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
										className="w-3.5 h-3.5"
									/>
								</button>
								<ErrorMessage
									name="confirmPassword"
									component="p"
									className="text-red-500 text-xs mt-1"
								/>
							</div>

							{/* Botón principal */}
							<button
								type="submit"
								disabled={!isValid || isSubmitting}
								className="w-full font-semibold py-2 rounded-lg flex justify-center items-center"
								style={{
									backgroundColor: "var(--color-primary)",
									color: "var(--color-bg-light)",
								}}
							>
								{isSubmitting ? (
									<FontAwesomeIcon
										icon={faSpinner}
										spin
										className="w-3.5 h-3.5"
									/>
								) : (
									"Registrarme"
								)}
							</button>

							{/* Divider */}
							<div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-2">
								<span className="w-1/4 border-b border-gray-300"></span>
								<span>O continúa con</span>
								<span className="w-1/4 border-b border-gray-300"></span>
							</div>

							{/* Google */}
							<button
								type="button"
								onClick={handleGoogle}
								className="w-full flex items-center justify-center gap-2 font-medium py-2 rounded-lg border transition-colors"
								style={{
									borderColor: "var(--color-primary)",
									backgroundColor: "var(--color-bg-light)",
									color: "var(--color-primary)",
								}}
							>
								<FontAwesomeIcon
									icon={faGoogle}
									className="w-3.5 h-3.5"
								/>
								Registrarme con Google
							</button>

							{/* Enlace al login */}
							<p className="text-center text-sm mt-4 text-gray-600">
								¿Ya tienes una cuenta?{" "}
								<Link
									href="/loginUser"
									className="font-semibold hover:underline"
									style={{
										color: "var(--color-primary)",
									}}
								>
									Inicia sesión
								</Link>
							</p>
						</Form>
					)}
				</Formik>
			</div>
		</div>
	);
}
