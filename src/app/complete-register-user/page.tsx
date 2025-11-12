"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faPhone,
	faGlobe,
	faLock,
	faEye,
	faEyeSlash,
	faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import ReactCountryFlag from "react-country-flag";
import { getCountries } from "../services/provider.service";
import { useAuthStore } from "@/app/store/auth.store";
import { toast } from "react-toastify";

const completeSchema = Yup.object().shape({
	createPassword: Yup.boolean(),
	password: Yup.string().when("createPassword", {
		is: true,
		then: (schema) =>
			schema
				.min(8, "Debe tener al menos 8 caracteres.")
				.matches(/[A-Z]/, "Debe incluir una mayúscula.")
				.matches(/[a-z]/, "Debe incluir una minúscula.")
				.matches(/\d/, "Debe incluir un número.")
				.matches(/[@$!%*?&]/, "Debe incluir un símbolo especial.")
				.required("La contraseña es obligatoria."),
	}),
	confirmPassword: Yup.string().when("createPassword", {
		is: true,
		then: (schema) =>
			schema
				.oneOf([Yup.ref("password")], "Las contraseñas no coinciden.")
				.required("Confirma tu contraseña."),
	}),
	country: Yup.string().required("Selecciona un país."),
	phone: Yup.string()
		.matches(/^[0-9]{8,12}$/, "Solo números (8–12 dígitos).")
		.required("El teléfono es obligatorio."),
});

export default function CompleteRegisterUser() {
	const router = useRouter();
	const [showPassword, setShowPassword] = React.useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
	const [countries, setCountries] = useState<any[]>([]);
	const setAuth = useAuthStore((s) => s.setAuth);

	// 🔹 Guardar token, id y rol desde query params
	useEffect(() => {
		if (typeof window !== "undefined") {
			const searchParams = new URLSearchParams(window.location.search);
			const t = searchParams.get("token");
			const id = searchParams.get("id");
			const role = searchParams.get("role");
			if (t && id) {
				localStorage.setItem("access_token", t);
				localStorage.setItem("user_id", id);
			}
			if (role) localStorage.setItem("user_role", role);
		}
	}, []);

	// 🔹 Cargar países
	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const data = await getCountries();
				setCountries(data);
			} catch (err) {
				console.error("Error al cargar países:", err);
			}
		};
		fetchCountries();
	}, []);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
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
					Completa tu perfil
				</h1>
				<p
					className="text-center mb-6 text-sm"
					style={{ color: "var(--color-foreground)" }}
				>
					Falta poco para terminar tu registro
				</p>

				<Formik
					initialValues={{
						createPassword: false,
						password: "",
						confirmPassword: "",
						phone: "",
						country: "",
					}}
					validationSchema={completeSchema}
					onSubmit={async (values, { setSubmitting }) => {
						try {
							const token = localStorage.getItem("access_token");
							const userId = localStorage.getItem("user_id");
							if (!userId || !token)
								throw new Error(
									"Faltan datos de autenticación."
								);

							const selectedCountry = countries.find(
								(c) => c.id === values.country
							);
							const lada =
								selectedCountry?.lada?.replace("+", "") || "";
							const fullPhone = `${lada}${values.phone}`;

							const payload: any = {
								phone: fullPhone,
								country: values.country,
							};

							if (values.createPassword && values.password)
								payload.password = values.password;

							const { data } = await axios.patch(
								`${process.env.NEXT_PUBLIC_API_URL}users/complete/${userId}`,
								payload,
								{
									headers: {
										Authorization: `Bearer ${token}`,
										"Content-Type": "application/json",
									},
								}
							);

							// Guardar sesión actualizada en Zustand
							setAuth({
								token: data.access_token,
								role: data.user.role,
								user: data.user,
							});

							toast.success("¡Perfil completado correctamente!", {
								autoClose: 1500,
							});

							setTimeout(
								() => router.push("/user/dashboard"),
								1500
							);
						} catch (error: any) {
							console.error("Error completando perfil:", error);
							Swal.fire({
								icon: "error",
								title: "Error al guardar",
								text: "Ocurrió un problema, intenta más tarde.",
							});
						} finally {
							setSubmitting(false);
						}
					}}
				>
					{({ values, setFieldValue, isSubmitting, isValid }) => (
						<Form className="space-y-4">
							{/* CHECKBOX */}
							<div className="flex items-center gap-2">
								<Field
									type="checkbox"
									name="createPassword"
									className="w-4 h-4 accent-color-primary"
								/>
								<label className="text-sm text-gray-700 select-none">
									¿Deseas crear una contraseña?
								</label>
							</div>

							{/* PASSWORD FIELDS */}
							{values.createPassword && (
								<div className="space-y-3">
									{/* PASSWORD */}
									<div className="relative">
										<FontAwesomeIcon
											icon={faLock}
											className="absolute left-3 top-3 text-gray-400"
										/>
										<Field
											type={
												showPassword
													? "text"
													: "password"
											}
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
												icon={
													showPassword
														? faEyeSlash
														: faEye
												}
											/>
										</button>
										<ErrorMessage
											name="password"
											component="p"
											className="text-red-500 text-xs mt-1"
										/>
									</div>

									{/* CONFIRM PASSWORD */}
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
										<ErrorMessage
											name="confirmPassword"
											component="p"
											className="text-red-500 text-xs mt-1"
										/>
									</div>
								</div>
							)}

							{/* COUNTRY */}
							<div className="relative">
								<FontAwesomeIcon
									icon={faGlobe}
									className="absolute left-3 top-3 text-gray-400"
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

							{/* PHONE */}
							<div className="relative flex items-center">
								<FontAwesomeIcon
									icon={faPhone}
									className="absolute left-3 top-3 text-gray-400"
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

							{/* SUBMIT */}
							<button
								type="submit"
								disabled={!isValid || isSubmitting}
								style={{
									backgroundColor: "var(--color-primary)",
								}}
								className={`w-full font-semibold text-white py-2 rounded-lg text-sm sm:text-base flex justify-center items-center ${
									!isValid || isSubmitting
										? "cursor-not-allowed"
										: ""
								}`}
							>
								{isSubmitting ? (
									<FontAwesomeIcon icon={faSpinner} spin />
								) : (
									"Guardar perfil"
								)}
							</button>
						</Form>
					)}
				</Formik>
			</div>
		</motion.div>
	);
}
