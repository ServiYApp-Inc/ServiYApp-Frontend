"use client";

import { useState, useRef } from "react";
import { Api } from "@/app/services/api";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/auth.store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUpload,
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

	if (!isOpen) return null;
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

	/* -------------------- ESTADOS -------------------- */
	const [step, setStep] = useState<"identity" | "bank" | "done">("identity");

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

	/* -------------------- CÁMARA -------------------- */
	const openCamera = async () => {
		setCameraOpen(true);
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
			});

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

	/* -------------------- VALIDACIONES -------------------- */
	const validateImage = (file: File | null) => {
		if (!file) return false;

		const validTypes = [
			"image/jpg",
			"image/jpeg",
			"image/png",
			"image/webp",
		];

		return validTypes.includes(file.type);
	};

	const validateIdentity = () => {
		if (!validateImage(idFile))
			return toast.error(
				"El documento debe ser una imagen (JPG, PNG, JPEG)."
			);

		if (!validateImage(idPhoto))
			return toast.error("La foto debe ser una imagen válida.");

		if (!idData.documentType || !idData.documentNumber)
			return toast.error("Completa todos los datos obligatorios.");

		return true;
	};

	const validateBank = () => {
		if (!validateImage(bankFile))
			return toast.error(
				"El comprobante bancario debe ser una imagen (JPG, PNG)."
			);

		if (!bankData.bank || !bankData.accountType || !bankData.accountNumber)
			return toast.error("Completa todos los datos bancarios.");

		return true;
	};

	/* -------------------- SUBMIT IDENTIDAD -------------------- */
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
			setStep("bank");
		} catch (error: any) {
			toast.error(
				error?.response?.data?.message || "Error al enviar documento."
			);
		} finally {
			setLoadingIdentity(false);
		}
	};

	/* -------------------- SUBMIT BANK -------------------- */
	const submitBank = async () => {
		if (!validateBank()) return;

		const formData = new FormData();
		formData.append("documentType", bankData.accountType);
		formData.append("documentNumber", bankData.accountNumber);

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

			toast.success("Datos bancarios enviados.");
			setStep("done");
		} catch (error: any) {
			toast.error(
				error?.response?.data?.message || "Error al enviar documento."
			);
		} finally {
			setLoadingBank(false);
		}
	};

	/* -------------------- PREVIEW -------------------- */
	const FilePreview = ({ file }: { file: File | null }) => {
		if (!file) return null;

		return (
			<div className="mt-2 flex items-center gap-3 bg-gray-100 border rounded-lg px-3 py-2 shadow-sm">
				<FontAwesomeIcon
					icon={faImage}
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
				<div className="flex items-center justify-between p-5 border-b">
					<h1 className="text-xl font-bold text-[var(--color-primary)]">
						Verificación de documentos
					</h1>

					<button
						onClick={onClose}
						className="text-gray-600 hover:text-red-500 text-xl"
					>
						<FontAwesomeIcon icon={faXmark} />
					</button>
				</div>

				{/* STEPS */}
				<div className="flex border-b">
					<div
						className={`flex-1 text-center py-3 font-semibold ${
							step === "identity"
								? "text-[var(--color-primary)] border-b-4 border-[var(--color-primary)]"
								: "text-gray-400"
						}`}
					>
						1. Identidad
					</div>

					<div
						className={`flex-1 text-center py-3 font-semibold ${
							step === "bank"
								? "text-[var(--color-primary)] border-b-4 border-[var(--color-primary)]"
								: "text-gray-400"
						}`}
					>
						2. Datos bancarios
					</div>

					<div
						className={`flex-1 text-center py-3 font-semibold ${
							step === "done"
								? "text-[var(--color-primary)] border-b-4 border-[var(--color-primary)]"
								: "text-gray-400"
						}`}
					>
						3. Finalizado
					</div>
				</div>

				{/* CONTENIDO */}
				<div className="p-6 max-h-[70vh] overflow-y-auto">
					{/* PASO 1 – IDENTIDAD */}
					{step === "identity" && (
						<div className="space-y-6">
							<div>
								<label className="block text-sm font-semibold mb-1">
									Tipo de documento
								</label>
								<select
									value={idData.documentType}
									onChange={(e) =>
										setIdData({
											...idData,
											documentType: e.target.value,
										})
									}
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

							<div>
								<label className="block text-sm font-semibold mb-1">
									Número del documento
								</label>
								<input
									type="text"
									className="w-full border p-2 rounded"
									placeholder="Ej. 12345678"
									value={idData.documentNumber}
									onChange={(e) =>
										setIdData({
											...idData,
											documentNumber: e.target.value,
										})
									}
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold mb-1">
									Documento (Imagen)
								</label>

								<label className="cursor-pointer w-full border rounded-lg p-4 flex items-center justify-center gap-3 hover:bg-gray-50">
									<FontAwesomeIcon icon={faUpload} />
									<span className="text-sm">
										Subir imagen
									</span>
									<input
										type="file"
										accept="image/*"
										className="hidden"
										onChange={(e) =>
											setIdFile(
												e.target.files?.[0] || null
											)
										}
									/>
								</label>

								<FilePreview file={idFile} />
							</div>

							<div>
								<label className="block text-sm font-semibold mb-1">
									Foto de verificación
								</label>
								<p className="text-xs text-gray-500 mb-2">
									Sostén tu documento y tómate una selfie
									clara.
								</p>

								<div className="flex gap-3">
									<label className="flex-1 cursor-pointer border rounded-lg p-4 flex items-center justify-center hover:bg-gray-50">
										<FontAwesomeIcon icon={faImage} />
										<span className="text-sm ml-2">
											Subir imagen
										</span>
										<input
											type="file"
											accept="image/*"
											className="hidden"
											onChange={(e) =>
												setIdPhoto(
													e.target.files?.[0] || null
												)
											}
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

							<button
								onClick={submitIdentity}
								disabled={loadingIdentity}
								className="w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
								style={{ background: "var(--color-primary)" }}
							>
								{loadingIdentity && (
									<FontAwesomeIcon icon={faSpinner} spin />
								)}
								Enviar documento de identidad
							</button>
						</div>
					)}

					{/* PASO 2 – BANCO */}
					{step === "bank" && (
						<div className="space-y-6">
							<div>
								<label className="block text-sm font-semibold mb-1">
									Nombre del banco
								</label>
								<input
									type="text"
									className="w-full border p-2 rounded"
									placeholder="Ej. BBVA, Bancolombia..."
									value={bankData.bank}
									onChange={(e) =>
										setBankData({
											...bankData,
											bank: e.target.value,
										})
									}
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold mb-1">
									Tipo de cuenta
								</label>
								<select
									className="w-full border p-2 rounded bg-white"
									value={bankData.accountType}
									onChange={(e) =>
										setBankData({
											...bankData,
											accountType: e.target.value,
										})
									}
								>
									<option value="">Selecciona...</option>
									<option value="Débito">Débito</option>
									<option value="Ahorros">Ahorros</option>
									<option value="Corriente / Cheques">
										Corriente / Cheques
									</option>
									<option value="Nómina">Nómina</option>
									<option value="Cuenta digital">
										Cuenta digital
									</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-semibold mb-1">
									Número de cuenta
								</label>
								<input
									type="text"
									className="w-full border p-2 rounded"
									placeholder="Ej. 1234567890"
									value={bankData.accountNumber}
									onChange={(e) =>
										setBankData({
											...bankData,
											accountNumber: e.target.value,
										})
									}
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold mb-1">
									Extracto bancario (Imagen)
								</label>

								<label className="cursor-pointer w-full border rounded-lg p-4 flex items-center justify-center gap-3 hover:bg-gray-50">
									<FontAwesomeIcon icon={faUpload} />
									<span className="text-sm">
										Subir imagen
									</span>
									<input
										type="file"
										accept="image/*"
										className="hidden"
										onChange={(e) =>
											setBankFile(
												e.target.files?.[0] || null
											)
										}
									/>
								</label>

								<FilePreview file={bankFile} />
							</div>

							<button
								onClick={submitBank}
								disabled={loadingBank}
								className="w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
								style={{ background: "var(--color-primary)" }}
							>
								{loadingBank && (
									<FontAwesomeIcon icon={faSpinner} spin />
								)}
								Enviar datos bancarios
							</button>
						</div>
					)}

					{/* PASO 3 – FINALIZADO */}
					{step === "done" && (
						<div className="text-center py-10">
							<h2 className="text-2xl font-semibold text-[var(--color-primary)] mb-4">
								Tu información ha sido enviada
							</h2>

							<p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
								Tus documentos están siendo revisados por un
								administrador de ServiYApp. Te notificaremos
								cuando tu cuenta sea verificada.
							</p>

							<button
								onClick={onClose}
								className="mt-6 px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg shadow"
							>
								Cerrar
							</button>
						</div>
					)}
				</div>

				{/* MODAL DE CÁMARA */}
				{cameraOpen && (
					<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
						<div className="bg-white p-4 rounded-xl w-full max-w-md relative">
							<h3 className="text-lg font-bold mb-3">
								Tomar foto
							</h3>

							<video
								ref={videoRef}
								className="w-full rounded-lg"
							/>
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
