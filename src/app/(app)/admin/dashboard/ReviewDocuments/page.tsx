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
	const { token } = useAuthStore.getState();

	/* ----------------------- CARGAR DOCUMENTOS ----------------------- */
	const loadDocuments = async () => {
		try {
			setLoading(true);

			 // obtiene el token actual

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

	const handleReview = async (status: "APPROVED" | "REJECTED") => {
		if (!selectedDoc) return;

		try {
			setDecisionLoading(true);

			await Api.patch(
				`provider-documents/admin/review/${selectedDoc.id}`,
				{
					status,
					comment: status === "REJECTED" ? comment : undefined,
				}
			);

			toast.success(
				status === "APPROVED"
					? "Documento aprobado"
					: "Documento rechazado"
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
		<div className="p-6">
			<h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
				Documentos pendientes por revisar
			</h1>

			{loading ? (
				<div className="flex justify-center py-20">
					<FontAwesomeIcon
						icon={faSpinner}
						spin
						className="text-3xl"
					/>
				</div>
			) : documents.length === 0 ? (
				<p className="text-gray-600">No hay documentos pendientes.</p>
			) : (
				<div className="overflow-x-auto border rounded-xl shadow bg-white">
					<table className="w-full text-sm">
						<thead className="bg-gray-100 text-left">
							<tr>
								<th className="p-3">Proveedor</th>
								<th className="p-3">Documento</th>
								<th className="p-3">Fecha</th>
								<th className="p-3 text-center">Acciones</th>
							</tr>
						</thead>

						<tbody>
							{documents.map((doc) => (
								<tr
									key={doc.id}
									className="border-b hover:bg-gray-50 transition"
								>
									<td className="p-3">
										<div className="font-semibold">
											{doc.provider.names}{" "}
											{doc.provider.surnames}
										</div>
										<div className="text-gray-500 text-xs">
											{doc.provider.email}
										</div>
									</td>

									<td className="p-3">
										<span className="font-semibold">
											{doc.documentType}
										</span>
										<div className="text-xs text-gray-500">
											#{doc.documentNumber}
										</div>
									</td>

									<td className="p-3 text-gray-600">
										{new Date(
											doc.date
										).toLocaleDateString()}
									</td>

									<td className="p-3 text-center">
										<button
											className="px-3 py-1 rounded bg-[var(--color-primary)] text-white hover:bg-opacity-90"
											onClick={() => setSelectedDoc(doc)}
										>
											<FontAwesomeIcon icon={faEye} />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* ----------------------- MODAL DE REVISIÓN ----------------------- */}

			{selectedDoc && (
				<div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
					<div className="bg-white rounded-xl max-w-xl w-full shadow-lg p-6 relative">
						{/* Cerrar */}
						<button
							className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
							onClick={() => setSelectedDoc(null)}
						>
							<FontAwesomeIcon icon={faTimes} size="lg" />
						</button>

						<h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">
							Revisión de documento
						</h2>

						{/* Datos del proveedor */}
						<div className="mb-4">
							<h3 className="font-semibold">Proveedor</h3>
							<p>
								{selectedDoc.provider.names}{" "}
								{selectedDoc.provider.surnames}
							</p>
							<p className="text-gray-500 text-sm">
								{selectedDoc.provider.email} ·{" "}
								{selectedDoc.provider.phone}
							</p>
						</div>

						{/* Documento */}
						<div className="mb-4">
							<h3 className="font-semibold mb-1">Documento</h3>

							<p>
								<strong>{selectedDoc.documentType}</strong> — #
								{selectedDoc.documentNumber}
							</p>

							<div className="flex flex-col gap-3 mt-3">
								{/* PDF */}
								{selectedDoc.file && (
									<a
										href={selectedDoc.file}
										target="_blank"
										className="text-blue-600 underline text-sm"
									>
										Abrir documento PDF
									</a>
								)}

								{/* Foto verificación */}
								{selectedDoc.photoVerification && (
									<img
										src={selectedDoc.photoVerification}
										alt="Selfie"
										className="w-40 rounded shadow"
									/>
								)}

								{/* Extracto bancario */}
								{selectedDoc.accountFile && (
									<a
										href={selectedDoc.accountFile}
										target="_blank"
										className="text-blue-600 underline text-sm"
									>
										Abrir extracto bancario
									</a>
								)}
							</div>
						</div>

						{/* Comentario (solo si se rechaza) */}
						<div className="mt-4">
							<label className="text-sm font-semibold">
								Comentario (opcional si apruebas)
							</label>
							<textarea
								className="w-full border rounded p-2 text-sm mt-1"
								rows={3}
								placeholder="Motivo del rechazo..."
								value={comment}
								onChange={(e) => setComment(e.target.value)}
							/>
						</div>

						{/* Botones */}
						<div className="flex justify-between mt-6">
							<button
								className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
								disabled={decisionLoading}
								onClick={() => handleReview("REJECTED")}
							>
								{decisionLoading ? (
									<FontAwesomeIcon icon={faSpinner} spin />
								) : (
									"Rechazar"
								)}
							</button>

							<button
								className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
								disabled={decisionLoading}
								onClick={() => handleReview("APPROVED")}
							>
								{decisionLoading ? (
									<FontAwesomeIcon icon={faSpinner} spin />
								) : (
									"Aprobar"
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
