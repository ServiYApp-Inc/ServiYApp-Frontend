"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Api } from "@/app/services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ResetPasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Leer parámetros de la URL
	const [token, setToken] = useState<string | null>(null);
	const [id, setId] = useState<string | null>(null);
	const [role, setRole] = useState<string | null>(null);

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// 🔹 Leer parámetros al montar el componente
	useEffect(() => {
		const t = searchParams.get("token");
		const uid = searchParams.get("id");
		const r = searchParams.get("type");

		setToken(t);
		setId(uid);
		setRole(r);
	}, [searchParams]);
	console.log(role);
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!password || !confirmPassword) {
			toast.error("Por favor, completa ambos campos.");
			return;
		}
		if (password !== confirmPassword) {
			toast.error("Las contraseñas no coinciden.");
			return;
		}
		if (!id || !role) {
			toast.error("Faltan datos para procesar la solicitud.");
			return;
		}

		try {
			setIsSubmitting(true);

			// 🔹 Endpoint dinámico según el rol
			let endpoint = "";
			if (role === "provider") endpoint = `providers/${id}`;
			else endpoint = `users/${id}`;

			console.log("📡 Enviando PATCH a:", endpoint);

			await Api.patch(
				endpoint,
				{ password },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			toast.success("Contraseña actualizada correctamente.");
			setTimeout(() => {
				if (role === "provider") router.push("/loginProvider");
				else router.push("/loginUser");
			}, 2000);
		} catch (error: any) {
			console.error("❌ Error en reset:", error);
			const msg =
				error?.response?.data?.message ||
				"Error al actualizar la contraseña.";
			toast.error(msg);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div
			className="flex flex-col items-center justify-center min-h-screen px-4"
			style={{ backgroundColor: "var(--background)" }}
		>
			<ToastContainer position="top-right" />

			<div
				className="w-full max-w-md rounded-2xl shadow-sm p-8 border"
				style={{
					backgroundColor: "var(--color-bg-light)",
					borderColor: "var(--color-bg-hover)",
				}}
			>
				<h1
					className="text-2xl font-bold text-center mb-2"
					style={{ color: "var(--color-primary)" }}
				>
					Restablecer contraseña
				</h1>

				<p className="text-center text-sm mb-6 text-gray-600">
					Ingresa tu nueva contraseña. Este enlace es temporal.
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Nueva contraseña */}
					<div className="relative">
						<FontAwesomeIcon
							icon={faLock}
							className="absolute left-3 top-3 text-gray-400"
							style={{ width: "14px", height: "14px" }}
						/>
						<input
							type={showPassword ? "text" : "password"}
							placeholder="Nueva contraseña"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none"
						/>
					</div>

					{/* Confirmar contraseña */}
					<div className="relative">
						<FontAwesomeIcon
							icon={faLock}
							className="absolute left-3 top-3 text-gray-400"
							style={{ width: "14px", height: "14px" }}
						/>
						<input
							type={showPassword ? "text" : "password"}
							placeholder="Confirmar contraseña"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-3 text-gray-400"
						>
							<FontAwesomeIcon
								icon={showPassword ? faEyeSlash : faEye}
								style={{ width: "14px", height: "14px" }}
							/>
						</button>
					</div>

					{/* Botón enviar */}
					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full py-2 rounded-lg font-semibold transition-colors"
						style={{
							backgroundColor: "var(--color-primary)",
							color: "var(--color-bg-light)",
						}}
					>
						{isSubmitting
							? "Actualizando..."
							: "Cambiar contraseña"}
					</button>
				</form>
			</div>
		</div>
	);
}
