"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Api } from "@/app/services/api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function ProviderDocumentsUpload() {
	const params = useSearchParams();
	const router = useRouter();

	const providerId = params.get("id");
	const token = params.get("token");

	const [file, setFile] = useState<File | null>(null);
	const [photoVerification, setPhotoVerification] = useState<File | null>(null);
	const [accountFile, setAccountFile] = useState<File | null>(null);

	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!providerId || !token) {
			return toast.error("No se encontraron los datos necesarios.");
		}

		const formData = new FormData();
		if (file) formData.append("file", file);
		if (photoVerification) formData.append("photoVerification", photoVerification);
		if (accountFile) formData.append("accountFile", accountFile);

		try {
			setLoading(true);

			await Api.post(`/provider-documents/${providerId}`, formData, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "multipart/form-data",
				},
			});

			toast.success("Documentos enviados correctamente.");
			router.push("/dashboard/provider");
		} catch (error) {
			console.error(error);
			toast.error("No se pudo enviar los documentos.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className="flex items-center justify-center min-h-screen p-4"
			style={{ backgroundColor: "var(--background)" }}
		>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="w-full max-w-lg shadow-lg rounded-2xl p-8"
				style={{
					backgroundColor: "var(--color-bg-light)",
					border: "1px solid var(--color-card-border)",
				}}
			>
				<h1
					className="text-2xl font-semibold mb-6 text-center"
					style={{ color: "var(--color-primary)" }}
				>
					Subir documentos del proveedor
				</h1>

				<form onSubmit={handleSubmit} className="flex flex-col gap-5">

					<div>
						<label className="block text-sm font-medium mb-1">
							Identificación oficial
						</label>
						<input
							type="file"
							accept="image/*,application/pdf"
							onChange={(e) => setFile(e.target.files?.[0] || null)}
							className="w-full border p-2 rounded-lg text-sm"
							style={{
								borderColor: "var(--color-card-border)",
								backgroundColor: "var(--color-bg-light)",
							}}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">
							Foto de verificación
						</label>
						<input
							type="file"
							accept="image/*"
							onChange={(e) => setPhotoVerification(e.target.files?.[0] || null)}
							className="w-full border p-2 rounded-lg text-sm"
							style={{
								borderColor: "var(--color-card-border)",
								backgroundColor: "var(--color-bg-light)",
							}}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">
							Comprobante bancario
						</label>
						<input
							type="file"
							accept="image/*,application/pdf"
							onChange={(e) => setAccountFile(e.target.files?.[0] || null)}
							className="w-full border p-2 rounded-lg text-sm"
							style={{
								borderColor: "var(--color-card-border)",
								backgroundColor: "var(--color-bg-light)",
							}}
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full py-2 mt-2 font-medium rounded-lg text-white"
						style={{
							backgroundColor: "var(--color-primary)",
							opacity: loading ? 0.7 : 1,
						}}
					>
						{loading ? "Enviando..." : "Enviar documentos"}
					</button>
				</form>
			</motion.div>
		</div>
	);
}
