"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUser,
	faEnvelope,
	faMapMarkerAlt,
	faGlobe,
	faCity,
	faPenToSquare,
	faCircleCheck,
	faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import ReactCountryFlag from "react-country-flag";
import EditProviderForm from "@/app/components/EditProviderForm";
import UploadProfilePicture from "@/app/components/UploadProfilePicture";
import { Api } from "@/app/services/api";
import IProvider from "@/app/interfaces/IProvider";
import UploadProviderDocumentsModal from "@/app/components/ProviderDocumentsUpload";

const ProfileItem = dynamic(() => import("@/app/components/ProfileItem"), {
	ssr: false,
});

// 💡 NUEVO TYIPO PARA STATUS
type VerificationStatus = {
	state: "approved" | "pending" | "rejected" | "null";
	comment: string | null;
};

export default function ProviderProfilePage() {
	const { user, token, setAuth } = useAuthStore();
	const provider = user as IProvider;

	const [currentProvider, setCurrentProvider] = useState<IProvider | null>(
		provider
	);
	const [showEdit, setShowEdit] = useState(false);
	const [showUpload, setShowUpload] = useState(false);
	const [showDocumentsModal, setShowDocumentsModal] = useState(false);

	// ⭐ Status debe ser un objeto, no un string
	const [status, setStatus] = useState<VerificationStatus>({
		state: "null",
		comment: null,
	});

	/* ---------------------------------------------------------
	   🔍 VERIFICACIÓN DE DOCUMENTOS (últimos 2)
	---------------------------------------------------------- */

	useEffect(() => {
		const fetchVerification = async () => {
			try {
				const { data } = await Api.get("provider-documents/me", {
					headers: { Authorization: `Bearer ${token}` },
				});

				// Si no hay docs
				if (!data || data.length === 0) {
					setStatus({ state: "null", comment: null });
					return;
				}

				// Ordenar por fecha desc
				const sorted = [...data].sort(
					(a, b) =>
						new Date(b.date).getTime() - new Date(a.date).getTime()
				);

				// Tomar los 2 más recientes
				const lastTwo = sorted.slice(0, 2);
				const states = lastTwo.map((d) => d.status);
				const comments = lastTwo.map((d) => d.comment);

				const allApproved = states.every((s) => s === "approved");
				const allPending = states.every((s) => s === "pending");
				const allRejected = states.every((s) => s === "rejected");

				if (allApproved) {
					setStatus({ state: "approved", comment: null });
					return;
				}

				if (allPending) {
					setStatus({ state: "pending", comment: null });
					return;
				}

				if (allRejected) {
					setStatus({
						state: "rejected",
						comment:
							comments[0] ||
							"El administrador no dejó ningún mensaje",
					});
					return;
				}

				// Mezcla → usar el último documento
				const latest = sorted[0];
				setStatus({
					state: latest.status,
					comment:
						latest.comment ||
						"El administrador no dejó ningún mensaje",
				});
			} catch (error) {
				console.error("Error verificando documentos:", error);
				setStatus({ state: "null", comment: null });
			}
		};

		fetchVerification();
	}, [token]);

	/* ---------------------------------------------------------
	   🔁 Refresh provider
	---------------------------------------------------------- */

	const refreshProvider = async () => {
		try {
			if (!provider?.id || !token) return;
			const { data } = await Api.get(`/providers/${provider.id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setAuth({ token, role: "provider", user: data });
			setCurrentProvider(data);
		} catch (error) {
			console.error("Error actualizando datos:", error);
		}
	};

	useEffect(() => {
		setCurrentProvider(provider);
	}, [provider]);

	if (!currentProvider) return null;

	/* ---------------------------------------------------------
	   RENDER PAGE
	---------------------------------------------------------- */

	return (
		<main className="max-w-6xl mx-auto mt-10 px-4 font-nunito">
			{/* ---------------- HEADER ---------------- */}
			<section className="relative bg-[var(--color-primary)] text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg">
				<div className="flex items-center gap-8 flex-col md:flex-row">
					{/* FOTO */}
					<div className="relative group w-36 h-36">
						{provider?.profilePicture ? (
							<img
								src={provider.profilePicture}
								alt="Provider profile"
								className="w-36 h-36 rounded-full border-4 border-white object-cover shadow-lg transition group-hover:opacity-80"
							/>
						) : (
							<div className="w-36 h-36 rounded-full border-4 border-white flex items-center justify-center bg-white/20 shadow-lg">
								<FontAwesomeIcon
									icon={faUser}
									className="text-4xl text-gray-200"
								/>
							</div>
						)}

						{/* EDITAR FOTO */}
						<button
							onClick={() => setShowUpload(true)}
							className="absolute bottom-2 right-2 bg-white text-[var(--color-primary)] rounded-full p-2 shadow hover:bg-gray-100 transition"
						>
							<FontAwesomeIcon icon={faPenToSquare} />
						</button>
					</div>

					{/* DATOS */}
					<div className="text-center md:text-left">
						<h2 className="text-4xl font-bold capitalize">
							{currentProvider.names} {currentProvider.surnames}
						</h2>
						<p className="text-lg opacity-90">
							{currentProvider.email}
						</p>

						{/* CHIP DE VERIFICACIÓN */}
						{status.state === "approved" && (
							<div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold shadow">
								<FontAwesomeIcon
									icon={faCircleCheck}
									className="text-green-600"
								/>
								Proveedor verificado
							</div>
						)}

						<button
							onClick={() => setShowEdit(true)}
							className="mt-4 px-4 py-2 bg-white text-[var(--color-primary)] font-semibold rounded-lg flex items-center gap-2 hover:bg-gray-100 transition mx-auto md:mx-0"
						>
							<FontAwesomeIcon icon={faPenToSquare} />
							Editar perfil
						</button>
					</div>
				</div>
			</section>

			{/* ---------------- VERIFICACIÓN ---------------- */}
			{status.state !== "approved" && (
				<section className="mt-10 bg-white border border-gray-200 rounded-3xl shadow-md p-8">
					<div className="flex items-center gap-4">
						<div
							className={`w-12 h-12 rounded-full flex items-center justify-center ${
								status.state === "pending"
									? "bg-yellow-100"
									: "bg-red-100"
							}`}
						>
							<FontAwesomeIcon
								icon={faCircleExclamation}
								className={`w-7 h-7 ${
									status.state === "pending"
										? "text-yellow-600"
										: "text-red-600"
								}`}
							/>
						</div>

						<div>
							<h2 className="text-xl font-bold text-[var(--color-primary)]">
								{status.state === "pending" &&
									"Documentos en revisión"}
								{status.state === "rejected" &&
									"Tus documentos fueron rechazados"}
								{status.state === "null" &&
									"Aún no estás verificado"}
							</h2>

							<p className="text-gray-600 text-sm">
								{status.state === "pending" &&
									"Nuestro equipo está revisando tus documentos. Te notificaremos cuando sean aprobados."}

								{status.state === "rejected" &&
									(status.comment ||
										"El administrador no dejó ningún mensaje")}

								{status.state === "null" &&
									"Sube tus documentos para completar tu verificación y empezar a trabajar."}
							</p>
						</div>
					</div>

					<button
						onClick={() => setShowDocumentsModal(true)}
						className="mt-6 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold shadow hover:bg-[var(--color-primary-hover)] transition-all"
					>
						Subir documentos
					</button>
				</section>
			)}

			{/* ---------------- INFORMACIÓN ---------------- */}
			<section className="mt-10 bg-white border border-gray-200 rounded-3xl shadow-md p-8">
				<h3 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
					Información del proveedor
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
					{/* NOMBRE */}
					<div className="flex items-center gap-3">
						<FontAwesomeIcon
							icon={faUser}
							className="text-[var(--color-primary)]"
						/>
						<p className="font-medium">
							<span className="text-gray-500 block text-sm">
								Nombre completo
							</span>
							{currentProvider.names} {currentProvider.surnames}
						</p>
					</div>

					{/* CORREO */}
					<div className="flex items-center gap-3">
						<FontAwesomeIcon
							icon={faEnvelope}
							className="text-[var(--color-primary)]"
						/>
						<p className="font-medium">
							<span className="text-gray-500 block text-sm">
								Correo
							</span>
							{currentProvider.email}
						</p>
					</div>

					{/* DIRECCIÓN */}
					<div className="flex items-center gap-3">
						<FontAwesomeIcon
							icon={faMapMarkerAlt}
							className="text-[var(--color-primary)]"
						/>
						<p className="font-medium">
							<span className="text-gray-500 block text-sm">
								Dirección
							</span>
							{currentProvider.address || "No especificada"}
						</p>
					</div>

					{/* PAÍS */}
					<div className="flex items-center gap-3">
						<FontAwesomeIcon
							icon={faGlobe}
							className="text-[var(--color-primary)]"
						/>
						<div className="font-medium flex items-center gap-2">
							<span className="text-gray-500 block text-sm">
								País
							</span>
							{currentProvider?.country ? (
								<div className="flex items-center gap-2">
									<ReactCountryFlag
										countryCode={
											currentProvider.country.code
										}
										svg
										style={{
											width: "1.3em",
											height: "1.3em",
										}}
									/>
									<span>{currentProvider.country.name}</span>
								</div>
							) : (
								"No especificado"
							)}
						</div>
					</div>

					{/* CIUDAD / REGIÓN */}
					<div className="flex items-center gap-3">
						<FontAwesomeIcon
							icon={faCity}
							className="text-[var(--color-primary)]"
						/>
						<p className="font-medium">
							<span className="text-gray-500 block text-sm">
								Ciudad / Región
							</span>
							{currentProvider.region?.name ||
							currentProvider.city?.name
								? `${currentProvider.region?.name || ""}${
										currentProvider.city
											? `, ${currentProvider.city.name}`
											: ""
								  }`
								: "No especificada"}
						</p>
					</div>
				</div>
			</section>

			{/* ---------------- MODALES ---------------- */}
			<AnimatePresence>
				{/* EDITAR PERFIL */}
				{showEdit && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							transition={{ duration: 0.25 }}
							className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto"
						>
							<button
								onClick={() => setShowEdit(false)}
								className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
							>
								×
							</button>

							<EditProviderForm
								onSuccess={async () => {
									await refreshProvider();
									setShowEdit(false);
									toast.success(
										"Perfil actualizado correctamente"
									);
								}}
							/>
						</motion.div>
					</motion.div>
				)}

				{/* CAMBIAR FOTO */}
				{showUpload && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							transition={{ duration: 0.25 }}
							className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative"
						>
							<button
								onClick={() => setShowUpload(false)}
								className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
							>
								×
							</button>

							<h3 className="text-xl font-bold text-[var(--color-primary)] mb-6 text-center">
								Cambiar foto de perfil
							</h3>

							<UploadProfilePicture
								role="provider"
								onSuccess={async () => {
									await refreshProvider();
									setShowUpload(false);
									toast.success("Foto actualizada");
								}}
							/>
						</motion.div>
					</motion.div>
				)}

				{/* SUBIR DOCUMENTOS */}
				{showDocumentsModal && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							transition={{ duration: 0.25 }}
							className="bg-white rounded-3xl p-6 shadow-xl relative max-h-[50vh] overflow-y-auto"
						>
							<button
								onClick={() => setShowDocumentsModal(false)}
								className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
							>
								×
							</button>

							<UploadProviderDocumentsModal
								isOpen={true}
								onClose={() => setShowDocumentsModal(false)}
							/>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
