"use client";

import { useState, useRef } from "react";
import { Api } from "@/app/services/api";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/auth.store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUpload,
	faFilePdf,
	faImage,
	faSpinner,
	faCamera,
	faXmark,
} from "@fortawesome/free-solid-svg-icons";

export default function UploadProviderDocumentsModal({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const { user, token } = useAuthStore();
	const providerId = user?.id;

	// Si no está abierto, no renderizar nada
	if (!isOpen) return null;

	// Validación básica
	if (!providerId || !token) {
		return (
			<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
				<div className="bg-white p-6 rounded-lg text-red-600">
					<h2 className="font-bold text-lg">Sesión no válida</h2>
					<p>Vuelve a iniciar sesión.</p>
				</div>
			</div>
		);
	}

	/* -------------------- Estados -------------------- */

	// Tabs
	const [activeTab, setActiveTab] = useState<"identity" | "bank">("identity");

	// Identidad
	const [idData, setIdData] = useState({
		documentType: "",
		documentNumber: "",
		description: "",
	});

	const [idFile, setIdFile] = useState<File | null>(null);
	const [idPhoto, setIdPhoto] = useState<File | null>(null);
	const [loadingIdentity, setLoadingIdentity] = useState(false);

	// Banco
	const [bankData, setBankData] = useState({
		bank: "",
		accountType: "",
		accountNumber: "",
	});

	const [bankFile, setBankFile] = useState<File | null>(null);
	const [loadingBank, setLoadingBank] = useState(false);

	// Cámara
	const [cameraOpen, setCameraOpen] = useState(false);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	/* -------------------- Cámara -------------------- */

	const openCamera = async () => {
		setCameraOpen(true);

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true });

			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				videoRef.current.play();
			}
		} catch {
			toast.error("No se pudo acceder a la cámara.");
		}
	};

	const takePhoto = () => {
		const video = videoRef.current;
		const canvas = canvasRef.current;

		if (!video || !canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

		canvas.toBlob((blob) => {
			if (blob) {
				const file = new File([blob], "selfie_verificacion.jpg", {
					type: "image/jpeg",
				});
				setIdPhoto(file);
				setCameraOpen(false);
			}
		}, "image/jpeg");
	};

	/* -------------------- Validaciones -------------------- */

	const validateIdentity = () => {
		if (!idFile || idFile.type !== "application/pdf")
			return toast.error("El documento debe ser un PDF.");

		if (!idPhoto) return toast.error("Falta la foto de verificación.");

		if (!idData.documentType || !idData.documentNumber)
			return toast.error("Completa todos los datos obligatorios.");

		return true;
	};

	const validateBank = () => {
		if (!bankFile || bankFile.type !== "application/pdf")
			return toast.error("El documento bancario debe ser un PDF.");

		if (!bankData.bank || !bankData.accountType || !bankData.accountNumber)
			return toast.error("Completa todos los datos bancarios.");

		return true;
	};

	/* -------------------- SUBMIT IDENTITY -------------------- */

	const submitIdentity = async () => {
		if (!validateIdentity()) return;

		const formData = new FormData();
		formData.append("documentType", idData.documentType);
		formData.append("documentNumber", idData.documentNumber);
		formData.append("description", idData.description);
		if (idFile) formData.append("file", idFile);
		if (idPhoto) formData.append("photoVerification", idPhoto);

		try {
			setLoadingIdentity(true);
			await Api.post(`provider-documents/${providerId}`, formData, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "multipart/form-data",
				},
			});

			toast.success("Documento de identidad enviado.");
			setIdFile(null);
			setIdPhoto(null);
		} catch (error: any) {
			toast.error(error?.response?.data?.message || "Error al enviar documento.");
		} finally {
			setLoadingIdentity(false);
		}
	};

	/* -------------------- SUBMIT BANK -------------------- */

	const submitBank = async () => {
		if (!validateBank()) return;

		const formData = new FormData();
		formData.append("bank", bankData.bank);
		formData.append("accountType", bankData.accountType);
		formData.append("accountNumber", bankData.accountNumber);
		if (bankFile) formData.append("accountFile", bankFile);

		try {
			setLoadingBank(true);

			await Api.post(`provider-documents/${providerId}`, formData, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "multipart/form-data",
				},
			});

			toast.success("Documento bancario enviado.");
			setBankFile(null);
		} catch (error: any) {
			toast.error(error?.response?.data?.message || "Error al enviar documento.");
		} finally {
			setLoadingBank(false);
		}
	};

	/* -------------------- Preview -------------------- */

	const FilePreview = ({ file }: { file: File | null }) => {
		if (!file) return null;

		return (
			<div className="mt-2 flex items-center gap-3 bg-gray-100 border rounded-lg px-3 py-2 shadow-sm">
				<FontAwesomeIcon
					icon={file.type === "application/pdf" ? faFilePdf : faImage}
					className="text-[var(--color-primary)] text-lg"
				/>
				<span className="text-xs truncate">{file.name}</span>
			</div>
		);
	};

	/* -------------------- RENDER -------------------- */

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div className="bg-white w-full max-w-xl rounded-2xl shadow-xl relative overflow-hidden">

				{/* HEADER */}
				<div className="flex items-center justify-between p-5 border-b bg-white/80">
					<h1 className="text-xl font-bold text-[var(--color-primary)]">
						Verificación de documentos
					</h1>

					<button onClick={onClose} className="text-gray-600 hover:text-red-500 text-xl">
						<FontAwesomeIcon icon={faXmark} />
					</button>
				</div>

				{/* TABS */}
				<div className="flex border-b">
					<button
						onClick={() => setActiveTab("identity")}
						className={`flex-1 py-3 font-semibold transition ${
							activeTab === "identity"
								? "text-[var(--color-primary)] border-b-4 border-[var(--color-primary)]"
								: "text-gray-500 hover:bg-gray-50"
						}`}
					>
						Documento de identidad
					</button>

					<button
						onClick={() => setActiveTab("bank")}
						className={`flex-1 py-3 font-semibold transition ${
							activeTab === "bank"
								? "text-[var(--color-primary)] border-b-4 border-[var(--color-primary)]"
								: "text-gray-500 hover:bg-gray-50"
						}`}
					>
						Datos bancarios
					</button>
				</div>

				{/* CONTENIDO DEL MODAL */}
				<div className="p-6 max-h-[70vh] overflow-y-auto">

					{/* --- TAB IDENTIDAD --- */}
					{activeTab === "identity" && (
						<div className="space-y-6">

							{/* Tipo */}
							<div>
								<label className="block text-sm font-semibold mb-1">
									Tipo de documento
								</label>
								<select
									value={idData.documentType}
									onChange={(e) => setIdData({ ...idData, documentType: e.target.value })}
									className="w-full border p-2 rounded"
								>
									<option value="">Selecciona...</option>
									<option value="INE">INE</option>
									<option value="Pasaporte">Pasaporte</option>
									<option value="DNI">DNI</option>
									<option value="Cédula">Cédula</option>
									<option value="Licencia">Licencia</option>
								</select>
							</div>

							{/* Número */}
							<div>
								<label className="block text-sm font-semibold mb-1">
									Número del documento
								</label>
								<input
									type="text"
									className="w-full border p-2 rounded"
									value={idData.documentNumber}
									placeholder="Ej. 12345678"
									onChange={(e) => setIdData({ ...idData, documentNumber: e.target.value })}
								/>
							</div>

							{/* PDF */}
							<div>
								<label className="block text-sm font-semibold mb-1">
									Documento (PDF)
								</label>

								<label className="cursor-pointer w-full border rounded-lg p-4 flex items-center justify-center gap-3 hover:bg-gray-50">
									<FontAwesomeIcon icon={faUpload} />
									<span className="text-sm">Subir PDF</span>
									<input
										type="file"
										accept="application/pdf"
										className="hidden"
										onChange={(e) => setIdFile(e.target.files?.[0] || null)}
									/>
								</label>

								<FilePreview file={idFile} />
							</div>

							{/* Selfie */}
							<div>
								<label className="block text-sm font-semibold mb-1">
									Foto de verificación
								</label>
								<p className="text-xs text-gray-500 mb-2">
									Sostén tu documento y tómate una selfie clara.
								</p>

								<div className="flex gap-3">
									<label className="flex-1 cursor-pointer border rounded-lg p-4 flex items-center justify-center hover:bg-gray-50">
										<FontAwesomeIcon icon={faImage} />
										<span className="text-sm ml-2">Subir imagen</span>
										<input
											type="file"
											accept="image/*"
											className="hidden"
											onChange={(e) => setIdPhoto(e.target.files?.[0] || null)}
										/>
									</label>

									<button
										onClick={openCamera}
										className="border rounded-lg p-4 hover:bg-gray-50"
									>
										<FontAwesomeIcon icon={faCamera} />
									</button>
								</div>

								<FilePreview file={idPhoto} />
							</div>

							{/* Botón enviar */}
							<button
								onClick={submitIdentity}
								disabled={loadingIdentity}
								className="w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
								style={{ background: "var(--color-primary)" }}
							>
								{loadingIdentity && <FontAwesomeIcon icon={faSpinner} spin />}
								Enviar documento de identidad
							</button>
						</div>
					)}

					{/* --- TAB BANCARIO --- */}
					{activeTab === "bank" && (
						<div className="space-y-6">

							{/* Banco */}
							<div>
								<label className="block text-sm font-semibold mb-1">Banco</label>
								<input
									type="text"
									className="w-full border p-2 rounded"
									placeholder="Ej. BBVA, Bancolombia..."
									value={bankData.bank}
									onChange={(e) => setBankData({ ...bankData, bank: e.target.value })}
								/>
							</div>

							{/* Tipo */}
							<div>
								<label className="block text-sm font-semibold mb-1">
									Tipo de cuenta
								</label>

								<select
									className="w-full border p-2 rounded bg-white"
									value={bankData.accountType}
									onChange={(e) => setBankData({ ...bankData, accountType: e.target.value })}
								>
									<option value="">Selecciona...</option>
									<option value="Ahorros">Ahorros</option>
									<option value="Corriente / Cheques">Corriente / Cheques</option>
									<option value="Débito">Débito</option>
									<option value="Nómina">Nómina</option>
									<option value="Cuenta digital">Cuenta digital</option>
								</select>
							</div>

							{/* Número */}
							<div>
								<label className="block text-sm font-semibold mb-1">Número de cuenta</label>
								<input
									type="text"
									className="w-full border p-2 rounded"
									placeholder="Ej. 1234567890"
									value={bankData.accountNumber}
									onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
								/>
							</div>

							{/* PDF */}
							<div>
								<label className="block text-sm font-semibold mb-1">
									Documento bancario (PDF)
								</label>

								<label className="cursor-pointer w-full border rounded-lg p-4 flex items-center justify-center gap-3 hover:bg-gray-50">
									<FontAwesomeIcon icon={faUpload} />
									<span className="text-sm">Subir comprobante</span>
									<input
										type="file"
										accept="application/pdf"
										className="hidden"
										onChange={(e) => setBankFile(e.target.files?.[0] || null)}
									/>
								</label>

								<FilePreview file={bankFile} />
							</div>

							{/* Botón */}
							<button
								onClick={submitBank}
								disabled={loadingBank}
								className="w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
								style={{ background: "var(--color-primary)" }}
							>
								{loadingBank && <FontAwesomeIcon icon={faSpinner} spin />}
								Enviar documento bancario
							</button>
						</div>
					)}
				</div>

				{/* ----- MODAL DE CÁMARA ----- */}
				{cameraOpen && (
					<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
						<div className="bg-white p-4 rounded-xl w-full max-w-md relative">
							<h3 className="text-lg font-bold mb-3">Tomar foto</h3>

							<video ref={videoRef} className="w-full rounded-lg" />
							<canvas ref={canvasRef} className="hidden"></canvas>

							<div className="flex justify-end gap-3 mt-4">
								<button
									className="px-4 py-2 border rounded"
									onClick={() => setCameraOpen(false)}
								>
									Cancelar
								</button>

								<button
									className="px-4 py-2 bg-[var(--color-primary)] text-white rounded"
									onClick={takePhoto}
								>
									Tomar foto
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
