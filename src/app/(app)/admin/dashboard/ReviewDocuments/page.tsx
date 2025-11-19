"use client";

import { useEffect, useState } from "react";
import { Api } from "@/app/services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCheck,
	faTimes,
	faSpinner,
	faEye,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useAuthStore } from "@/app/store/auth.store";
import { motion, AnimatePresence } from "framer-motion";

interface PendingDocument {
	id: string;
	documentType: string;
	documentNumber: string;
	file: string;
	photoVerification: string;
	accountFile: string | null;
	date: string;

	provider: {
		names: string;
		surnames: string;
		email: string;
		phone: string;
		country?: { name: string };
		region?: { name: string };
		city?: { name: string };
	};
}

export default function AdminPendingDocumentsPage() {
	const [documents, setDocuments] = useState<PendingDocument[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedDoc, setSelectedDoc] = useState<PendingDocument | null>(
		null
	);
	const [decisionLoading, setDecisionLoading] = useState(false);
	const [comment, setComment] = useState("");
	const { token } = useAuthStore();

	/* ----------------------- CARGAR DOCUMENTOS ----------------------- */

	const loadDocuments = async () => {
		try {
			setLoading(true);

			const { data } = await Api.get("provider-documents/admin/pending", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			setDocuments(data);
		} catch (err) {
			toast.error("Error al cargar documentos pendientes");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadDocuments();
	}, []);

	/* ----------------------- APROBAR / RECHAZAR ----------------------- */

	const handleReview = async (status: "approved" | "rejected") => {
		if (!selectedDoc) return;

		try {
			setDecisionLoading(true);

			await Api.patch(
				`provider-documents/admin/review/${selectedDoc.id}`,
				{
					status,
					comment: status === "rejected" ? comment : undefined,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			toast.success(
				status === "approved"
					? "Documento aprobado correctamente"
					: "Documento rechazado correctamente"
			);

			setSelectedDoc(null);
			setComment("");
			loadDocuments();
		} catch (e) {
			toast.error("Error al actualizar documento");
		} finally {
			setDecisionLoading(false);
		}
	};

	/* ----------------------- RENDER ----------------------- */

	return (
		<main className="max-w-7xl mx-auto mt-10 px-4 font-nunito">
			<h1 className="text-3xl font-bold text-[var(--color-primary)] mb-6 flex items-center gap-3">
				Revisión de Documentos
			</h1>

			{/* ---------------- TABLE ---------------- */}
			{loading ? (
				<div className="text-center text-gray-500 py-5">
					<FontAwesomeIcon icon={faSpinner} spin /> Cargando...
				</div>
			) : documents.length === 0 ? (
				<p className="text-center text-gray-500 py-8">
					No hay documentos pendientes
				</p>
			) : (
				<table className="w-full text-[13px] border-collapse">
					<thead>
						<tr className="border-b bg-gray-200 text-left">
							<th className="py-3 px-4">Proveedor</th>
							<th className="py-3 px-4">Documento</th>
							<th className="py-3 px-4">Fecha</th>
							<th className="py-3 px-4 text-center">Acciones</th>
						</tr>
					</thead>

					<tbody>
						{documents.map((doc) => (
							<tr
								key={doc.id}
								className="border-b hover:bg-gray-50"
							>
								<td className="py-3 px-4">
									<div className="font-bold capitalize text-[var(--color-primary)]">
										{doc.provider.names}{" "}
										{doc.provider.surnames}
									</div>
									<div className="text-xs text-gray-500">
										{doc.provider.email}
									</div>
								</td>

								<td className="py-3 px-4">
									<span className="font-semibold">
										{doc.documentType}
									</span>
									<div className="text-xs text-gray-500">
										#{doc.documentNumber}
									</div>
								</td>

								<td className="py-3 px-4">
									{new Date(doc.date).toLocaleDateString()}
								</td>

								<td className="py-3 px-4 text-center">
									<button
										onClick={() => setSelectedDoc(doc)}
										className="text-[var(--color-primary)]"
									>
										<FontAwesomeIcon icon={faEye} />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			{/* ---------------- MODAL ---------------- */}
			<AnimatePresence>
				{selectedDoc && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
						onClick={(e) => {
							if (e.target === e.currentTarget)
								setSelectedDoc(null);
						}}
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="bg-white p-6 w-full max-w-lg rounded-2xl shadow-xl relative"
						>
							<button
								onClick={() => setSelectedDoc(null)}
								className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
							>
								<FontAwesomeIcon icon={faTimes} size="lg" />
							</button>

							<h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">
								Detalles del Documento
							</h2>

							{/* Proveedor */}
							<p className="text-sm mb-1">
								<strong>Proveedor:</strong>{" "}
								{selectedDoc.provider.names}{" "}
								{selectedDoc.provider.surnames}
							</p>

							<p className="text-sm mb-1">
								<strong>Email:</strong>{" "}
								{selectedDoc.provider.email}
							</p>

							<p className="text-sm mb-1">
								<strong>Teléfono:</strong>{" "}
								{selectedDoc.provider.phone}
							</p>

							{/* Documento */}
							{/* Documento */}
							<p className="text-sm mt-4 mb-2">
								<strong>Documento enviado:</strong>
							</p>

							<div className="space-y-5">
								{/* Imagen del documento principal */}
								{selectedDoc.file && (
									<div>
										<img
											src={selectedDoc.file}
											alt="Documento de identidad"
											className="w-40 rounded-lg shadow border"
										/>
										<a
											href={selectedDoc.file}
											target="_blank"
											className="block text-blue-600 underline text-xs mt-1"
										>
											Ver imagen en grande
										</a>
									</div>
								)}

								{/* Foto de verificación (selfie) */}
								{selectedDoc.photoVerification && (
									<div>
										<img
											src={selectedDoc.photoVerification}
											alt="Foto de verificación"
											className="w-40 rounded-lg shadow border"
										/>
										<a
											href={selectedDoc.photoVerification}
											target="_blank"
											className="block text-blue-600 underline text-xs mt-1"
										>
											Ver imagen en grande
										</a>
									</div>
								)}

								{/* Extracto bancario (imagen) */}
								{selectedDoc.accountFile && (
									<div>
										<img
											src={selectedDoc.accountFile}
											alt="Documento bancario"
											className="w-40 rounded-lg shadow border"
										/>
										<a
											href={selectedDoc.accountFile}
											target="_blank"
											className="block text-blue-600 underline text-xs mt-1"
										>
											Ver imagen en grande
										</a>
									</div>
								)}
							</div>

							{/* Comentarios */}
							<div className="mt-4">
								<label className="font-semibold text-sm">
									Comentario (opcional)
								</label>
								<textarea
									className="w-full border rounded-lg p-2 mt-1 text-sm"
									rows={3}
									placeholder="Motivo del rechazo..."
									value={comment}
									onChange={(e) => setComment(e.target.value)}
								/>
							</div>

							{/* Acciones */}
							<div className="flex justify-end gap-3 mt-6">
								<button
									onClick={() => handleReview("rejected")}
									className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
								>
									{decisionLoading ? (
										<FontAwesomeIcon
											icon={faSpinner}
											spin
										/>
									) : (
										"Rechazar"
									)}
								</button>

								<button
									onClick={() => handleReview("approved")}
									className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
								>
									{decisionLoading ? (
										<FontAwesomeIcon
											icon={faSpinner}
											spin
										/>
									) : (
										"Aprobar"
									)}
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
