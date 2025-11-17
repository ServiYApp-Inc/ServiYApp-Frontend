"use client";

import * as Yup from "yup";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faEnvelope,
	faLock,
	faEye,
	faEyeSlash,
	faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { ErrorMessage, Field, Form, Formik } from "formik";
import "react-toastify/dist/ReactToastify.css";

import { Api } from "@/app/services/api";
import { useAuthStore } from "@/app/store/auth.store";
import { toast } from "react-toastify";

type Role = "provider" | "user";

interface LoginFormProps {
	role: Role;
}

const loginSchema = Yup.object().shape({
	email: Yup.string()
		.email("El formato del correo electrónico no es válido.")
		.required("El correo electrónico es obligatorio."),
	password: Yup.string().required("La contraseña es obligatoria."),
});

export default function LoginForm({ role }: LoginFormProps) {
	const router = useRouter();
	const setAuth = useAuthStore((s) => s.setAuth);
	const [showPassword, setShowPassword] = useState(false);

	// 🟣 Estado del modal "Olvidaste tu contraseña"
	const [showForgotModal, setShowForgotModal] = useState(false);
	const [forgotEmail, setForgotEmail] = useState("");
	const [isSending, setIsSending] = useState(false);

	const handleSubmit = async (values: {
		email: string;
		password: string;
	}) => {
		try {
			const endpoint =
				role === "provider"
					? "/auth/login/provider"
					: "/auth/login/user";

			const { data } = await Api.post(endpoint, values);

			setAuth({
				token: data.access_token,
				role: data.user?.role || "provider",
				user: data.provider || data.user,
			});

			toast.success("Inicio de sesión exitoso", { autoClose: 2000 });
			// Si es provider y no ha completado su registro (documentos)
			if (role === "provider") {
				const providerData = data.provider;

				if (providerData.isCompleted === false) {
					toast.info(
						"Tu cuenta aún no está verificada. Completa tu identificación en el perfil."
					);
					setTimeout(() => {
						router.replace(`/provider/profile`);
					}, 3000);
				}
			}

			// 🧠 Si hay una ruta previa guardada, redirige allí primero
			setTimeout(() => {
				const redirectPath = localStorage.getItem("redirectAfterLogin");

				if (redirectPath) {
					router.replace(redirectPath);
					localStorage.removeItem("redirectAfterLogin");
					return;
				}

				// 🚀 Si no había ruta guardada, usa los defaults
				if (role === "provider") {
					router.push("/provider/dashboard");
					return;
				}

				if (role === "user") {
					const userRole = data.user?.role?.toLowerCase();
					if (userRole === "admin") router.push("/admin/dashboard");
					else router.push("/user/services");
					return;
				}
			}, 2000);
		} catch (error: any) {
			console.error(error);
			const msg =
				error?.response?.data?.message ||
				"Credenciales incorrectas o error en el servidor.";
			toast.error(msg, { autoClose: 2500 });
		}
	};

	const handleForgotPassword = async () => {
		if (!forgotEmail) {
			toast.error("Por favor, ingresa tu correo electrónico.");
			return;
		}

		try {
			setIsSending(true);

			// ✅ Usa plural porque así está en tu backend
			const endpoint =
				role === "provider"
					? "/auth/providers/forgot-password"
					: "/auth/users/forgot-password";

			console.log(
				"📨 Enviando solicitud a:",
				endpoint,
				"con email:",
				forgotEmail
			);

			const { data } = await Api.post(endpoint, { email: forgotEmail });

			toast.success("Correo de recuperación enviado con éxito.");
			setForgotEmail("");
			setShowForgotModal(false);
		} catch (error: any) {
			console.error("Error en forgot password:", error);

			const msg =
				error?.response?.data?.message ||
				`No se pudo enviar el correo de recuperación.`;
			toast.error(msg);
		} finally {
			setIsSending(false);
		}
	};

	const handleGoogle = () => {
		const base =
			process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/";
		const endpoint =
			role === "provider" ? "auth/google/provider" : "auth/google/user";
		window.location.href = `${base}${endpoint}`;
	};

	return (
		<div
			className="flex flex-col items-center justify-center min-h-screen px-4"
			style={{ backgroundColor: "var(--background)" }}
		>
			{/* Modal Olvidaste tu contraseña */}
			{showForgotModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div
						className="bg-white rounded-2xl p-6 w-full max-w-sm relative"
						style={{
							backgroundColor: "var(--color-bg-light)",
							color: "var(--color-foreground)",
						}}
					>
						<button
							onClick={() => setShowForgotModal(false)}
							className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
						>
							<FontAwesomeIcon icon={faTimes} />
						</button>

						<h2
							className="text-lg font-semibold mb-2 text-center"
							style={{ color: "var(--color-primary)" }}
						>
							¿Olvidaste tu contraseña?
						</h2>
						<p className="text-sm text-center mb-4">
							Ingresa tu correo electrónico y te enviaremos un
							enlace para restablecerla.
						</p>

						<div className="relative mb-4">
							<FontAwesomeIcon
								icon={faEnvelope}
								className="absolute left-3 top-3 text-gray-400"
								style={{ width: "14px", height: "14px" }}
							/>
							<input
								type="email"
								placeholder="Correo electrónico"
								value={forgotEmail}
								onChange={(e) => setForgotEmail(e.target.value)}
								className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none"
							/>
						</div>

						<button
							onClick={handleForgotPassword}
							disabled={isSending}
							className="w-full py-2 rounded-lg font-semibold"
							style={{
								backgroundColor: "var(--color-primary)",
								color: "var(--color-bg-light)",
							}}
						>
							{isSending ? "Enviando..." : "Enviar correo"}
						</button>
					</div>
				</div>
			)}

			{/* FORM LOGIN */}
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
					Inicio de Sesión
				</h1>

				<p
					className="text-center mb-6 text-sm"
					style={{ color: "var(--color-foreground)" }}
				>
					{role === "provider"
						? "Inicia sesión como prestador para gestionar tus servicios"
						: "Inicia sesión para reservar servicios de belleza a domicilio"}
				</p>

				<Formik
					initialValues={{ email: "", password: "" }}
					validationSchema={loginSchema}
					onSubmit={handleSubmit}
				>
					{({ isSubmitting, isValid }) => (
						<Form className="space-y-4">
							{/* Correo */}
							<div className="relative">
								<FontAwesomeIcon
									icon={faEnvelope}
									className="fa-icon absolute left-3 top-3 text-gray-400"
									style={{ width: "14px", height: "14px" }}
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

							{/* Contraseña con toggle */}
							<div className="relative">
								<FontAwesomeIcon
									icon={faLock}
									className="fa-icon absolute left-3 top-3 text-gray-400"
									style={{ width: "14px", height: "14px" }}
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
										className="fa-icon"
										style={{
											width: "14px",
											height: "14px",
										}}
									/>
								</button>
								<ErrorMessage
									name="password"
									component="p"
									className="text-red-500 text-xs mt-1"
								/>
							</div>

							{/* Botón abrir modal */}
							<button
								type="button"
								onClick={() => setShowForgotModal(true)}
								className="block text-right text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded"
								style={{ color: "var(--color-primary)" }}
							>
								¿Olvidaste tu contraseña?
							</button>

							{/* Botón principal */}
							<button
								type="submit"
								disabled={!isValid || isSubmitting}
								className="w-full font-semibold py-2 rounded-lg flex justify-center items-center transition-colors"
								style={{
									backgroundColor: "var(--color-primary)",
									color: "var(--color-bg-light)",
								}}
							>
								{isSubmitting
									? "Cargando..."
									: "Iniciar Sesión"}
							</button>

							{/* Divider */}
							<div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-2">
								<span className="w-1/4 border-b border-gray-300"></span>
								<span>O intenta</span>
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
									className="fa-icon"
									style={{ width: "14px", height: "14px" }}
								/>
								Iniciar Sesión con Google
							</button>

							{/* Enlace a registro */}
							<p className="text-center text-sm mt-4 text-gray-600">
								¿No tienes cuenta?{" "}
								<a
									href="/registerUser"
									className="font-semibold hover:underline"
									style={{ color: "var(--color-primary)" }}
								>
									Regístrate
								</a>
							</p>
						</Form>
					)}
				</Formik>
			</div>
		</div>
	);
}
