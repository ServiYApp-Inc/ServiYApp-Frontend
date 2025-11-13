"use client";

import { useState } from "react";
import { Api } from "@/app/services/api";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/auth.store";

export default function UploadProviderDocuments() {
	const { user, token } = useAuthStore();

	const providerId = user?.id;

	if (!providerId || !token) {
		return (
			<div className="p-6 text-center">
				<h2>No se encontró tu sesión o tu ID de proveedor.</h2>
				<p>Inicia sesión nuevamente.</p>
			</div>
		);
	}

	/* -------------------- ESTADOS -------------------- */

	// Documento de identidad
	const [idFile, setIdFile] = useState<File | null>(null);
	const [idPhoto, setIdPhoto] = useState<File | null>(null);
	const [idData, setIdData] = useState({
		documentType: "",
		documentNumber: "",
		description: "",
	});

	// Documento bancario
	const [bankFile, setBankFile] = useState<File | null>(null);
	const [bankData, setBankData] = useState({
		bank: "",
		accountType: "",
		accountNumber: "",
	});

	const [loadingIdentity, setLoadingIdentity] = useState(false);
	const [loadingBank, setLoadingBank] = useState(false);

	/* -------------------- VALIDACIONES -------------------- */

	const validateIdentity = () => {
		if (!idFile || idFile.type !== "application/pdf") {
			toast.error("El documento de identidad debe ser un PDF.");
			return false;
		}

		if (!idPhoto || !idPhoto.type.startsWith("image/")) {
			toast.error("La foto de verificación debe ser una imagen.");
			return false;
		}

		if (!idData.documentType || !idData.documentNumber) {
			toast.error("Completa todos los datos de identidad.");
			return false;
		}

		return true;
	};

	const validateBank = () => {
		if (!bankFile || bankFile.type !== "application/pdf") {
			toast.error("El documento bancario debe ser un PDF.");
			return false;
		}

		if (
			!bankData.bank ||
			!bankData.accountType ||
			!bankData.accountNumber
		) {
			toast.error("Completa todos los datos bancarios.");
			return false;
		}

		return true;
	};

	/* -------------------- SUBMIT IDENTIDAD -------------------- */

	const submitIdentity = async () => {
		if (!providerId || !token) return toast.error("Faltan parámetros.");
		if (!validateIdentity()) return;

		const formData = new FormData();
		formData.append("documentType", idData.documentType);
		formData.append("documentNumber", idData.documentNumber);
		formData.append("description", idData.description);

		// Archivos reales
		if (idFile) formData.append("file", idFile);
		if (idPhoto) formData.append("photoVerification", idPhoto);

		try {
			setLoadingIdentity(true);
			await Api.patch(
				`providers/${providerId}provider-documents/`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			toast.success("Documento de identidad enviado.");
		} catch (error: any) {
			toast.error(
				error?.response?.data?.message || "Error al subir documento."
			);
		} finally {
			setLoadingIdentity(false);
		}
	};

	/* -------------------- SUBMIT BANCO -------------------- */

	const submitBank = async () => {
		if (!providerId || !token) return toast.error("Faltan parámetros.");
		if (!validateBank()) return;

		const formData = new FormData();
		formData.append("bank", bankData.bank);
		formData.append("accountType", bankData.accountType);
		formData.append("accountNumber", bankData.accountNumber);

		if (bankFile) formData.append("accountFile", bankFile);

		try {
			setLoadingBank(true);
			await Api.patch(
				`providers/${providerId}provider-documents/`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			toast.success("Documento bancario enviado.");
		} catch (error: any) {
			toast.error(
				error?.response?.data?.message || "Error al subir documento."
			);
		} finally {
			setLoadingBank(false);
		}
	};

	return (
		<div className="max-w-xl mx-auto p-6 space-y-12">
			{/* -------------------- DOCUMENTO DE IDENTIDAD -------------------- */}
			<section
				className="p-5 rounded-xl border"
				style={{ backgroundColor: "var(--color-bg-light)" }}
			>
				<h2
					className="text-lg font-semibold mb-3"
					style={{ color: "var(--color-primary)" }}
				>
					Documento de identidad
				</h2>

				<div className="space-y-4">
					<input
						type="text"
						placeholder="Tipo de documento (INE, Pasaporte...)"
						className="border p-2 rounded w-full"
						value={idData.documentType}
						onChange={(e) =>
							setIdData({
								...idData,
								documentType: e.target.value,
							})
						}
					/>

					<input
						type="text"
						placeholder="Número de documento"
						className="border p-2 rounded w-full"
						value={idData.documentNumber}
						onChange={(e) =>
							setIdData({
								...idData,
								documentNumber: e.target.value,
							})
						}
					/>

					<textarea
						placeholder="Descripción (opcional)"
						className="border p-2 rounded w-full"
						value={idData.description}
						onChange={(e) =>
							setIdData({
								...idData,
								description: e.target.value,
							})
						}
					/>

					<label className="block">Documento (PDF)</label>
					<input
						type="file"
						accept="application/pdf"
						onChange={(e) => setIdFile(e.target.files?.[0] || null)}
						className="border p-2 rounded w-full"
					/>

					<label className="block">
						Foto de verificación (imagen)
					</label>
					<input
						type="file"
						accept="image/*"
						onChange={(e) =>
							setIdPhoto(e.target.files?.[0] || null)
						}
						className="border p-2 rounded w-full"
					/>

					<button
						onClick={submitIdentity}
						disabled={loadingIdentity}
						className="w-full py-2 text-white font-semibold rounded"
						style={{
							backgroundColor: "var(--color-primary)",
							opacity: loadingIdentity ? 0.7 : 1,
						}}
					>
						{loadingIdentity
							? "Enviando..."
							: "Enviar documento de identidad"}
					</button>
				</div>
			</section>

			{/* -------------------- DOCUMENTO BANCARIO -------------------- */}
			<section
				className="p-5 rounded-xl border"
				style={{ backgroundColor: "var(--color-bg-light)" }}
			>
				<h2
					className="text-lg font-semibold mb-3"
					style={{ color: "var(--color-primary)" }}
				>
					Documento bancario
				</h2>

				<div className="space-y-4">
					<input
						type="text"
						placeholder="Banco"
						className="border p-2 rounded w-full"
						value={bankData.bank}
						onChange={(e) =>
							setBankData({ ...bankData, bank: e.target.value })
						}
					/>

					<input
						type="text"
						placeholder="Tipo de cuenta"
						className="border p-2 rounded w-full"
						value={bankData.accountType}
						onChange={(e) =>
							setBankData({
								...bankData,
								accountType: e.target.value,
							})
						}
					/>

					<input
						type="text"
						placeholder="Número de cuenta"
						className="border p-2 rounded w-full"
						value={bankData.accountNumber}
						onChange={(e) =>
							setBankData({
								...bankData,
								accountNumber: e.target.value,
							})
						}
					/>

					<label className="block">Comprobante bancario (PDF)</label>
					<input
						type="file"
						accept="application/pdf"
						onChange={(e) =>
							setBankFile(e.target.files?.[0] || null)
						}
						className="border p-2 rounded w-full"
					/>

					<button
						onClick={submitBank}
						disabled={loadingBank}
						className="w-full py-2 text-white font-semibold rounded"
						style={{
							backgroundColor: "var(--color-primary)",
							opacity: loadingBank ? 0.7 : 1,
						}}
					>
						{loadingBank
							? "Enviando..."
							: "Enviar documento bancario"}
					</button>
				</div>
			</section>
		</div>
	);
}
