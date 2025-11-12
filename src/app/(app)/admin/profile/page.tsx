"use client";

import { useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import UploadProfilePicture from "@/app/components/UploadProfilePicture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faPenToSquare,
	faUser,
	faEnvelope,
	faPhone,
	faIdBadge,
	faCalendarAlt,
	faToggleOn,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import EditUserForm from "@/app/components/EditUserForm"; // puedes crear uno específico para admin si es necesario

export default function AdminProfilePage() {
	const { user } = useAuthStore();
	const [showEdit, setShowEdit] = useState(false);
	const [showUpload, setShowUpload] = useState(false);

	return (
		<main className="max-w-5xl mx-auto mt-10 px-4 font-nunito">
			{/* ENCABEZADO PERFIL */}
			<section className="bg-[var(--color-primary)] text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg transition-all">
				{/* FOTO PERFIL */}
				<div className="flex items-center gap-6 relative">
					<div className="relative group w-36 h-36">
						{user?.profilePicture ? (
							<img
								src={user.profilePicture}
								alt="Foto de perfil"
								className="w-36 h-36 rounded-full border-4 border-white object-cover shadow-lg group-hover:opacity-80 transition-all duration-300"
							/>
						) : (
							<div className="w-36 h-36 rounded-full border-4 border-white flex items-center justify-center bg-white/20 shadow-lg">
								<FontAwesomeIcon
									icon={faUser}
									className="text-4xl text-gray-200"
								/>
							</div>
						)}

						{/* ICONO EDITAR FOTO */}
						<button
							onClick={() => setShowUpload(true)}
							className="absolute bottom-2 right-2 bg-white text-[var(--color-primary)] rounded-full p-2 shadow-md hover:bg-gray-100 transition-all"
							title="Editar foto de perfil"
						>
							<FontAwesomeIcon
								icon={faPenToSquare}
								className="w-4 h-4"
							/>
						</button>
					</div>

					{/* INFO BÁSICA */}
					<div>
						<h2 className="text-3xl font-bold tracking-tight">
							{user?.names} {user?.surnames}
						</h2>
						<p className="text-lg opacity-90">{user?.email}</p>
						<p className="italic text-sm opacity-80 mt-1">
							Administrador del sistema
						</p>

						<button
							onClick={() => setShowEdit(true)}
							className="mt-4 px-4 py-2 bg-white text-[var(--color-primary)] font-semibold rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-all"
						>
							<FontAwesomeIcon icon={faPenToSquare} />
							Editar perfil
						</button>
					</div>
				</div>
			</section>

			{/* INFORMACIÓN ADMINISTRATIVA */}
			<section className="mt-10 bg-white border border-gray-200 rounded-3xl shadow-md p-8">
				<h3 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
					Información del administrador
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
					{/* Correo */}
					<div className="flex items-center gap-3">
						<FontAwesomeIcon
							icon={faEnvelope}
							className="text-[var(--color-primary)] w-5 h-5"
						/>
						<p className="font-medium">
							<span className="text-gray-500 block text-sm">
								Correo electrónico
							</span>
							{user?.email}
						</p>
					</div>

					{/* Teléfono */}
					<div className="flex items-center gap-3">
						<FontAwesomeIcon
							icon={faPhone}
							className="text-[var(--color-primary)] w-5 h-5"
						/>
						<p className="font-medium">
							<span className="text-gray-500 block text-sm">
								Teléfono
							</span>
							{user?.phone || "No registrado"}
						</p>
					</div>

					{/* Rol */}
					<div className="flex items-center gap-3">
						<FontAwesomeIcon
							icon={faUser}
							className="text-[var(--color-primary)] w-5 h-5"
						/>
						<p className="font-medium">
							<span className="text-gray-500 block text-sm">
								Rol
							</span>
							Administrador
						</p>
					</div>
				</div>
			</section>

			{/* MODAL EDITAR PERFIL */}
			<AnimatePresence>
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
							className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative"
						>
							<button
								onClick={() => setShowEdit(false)}
								className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
							>
								×
							</button>

							<EditUserForm
								onSuccess={() => {
									setShowEdit(false);
									toast.success(
										"Perfil actualizado correctamente"
									);
								}}
							/>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* MODAL SUBIR FOTO */}
			<AnimatePresence>
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
							className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative"
						>
							<button
								onClick={() => setShowUpload(false)}
								className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
							>
								×
							</button>

							<UploadProfilePicture
								role="admin"
								onSuccess={() => {
									setShowUpload(false);
									toast.success(
										"Foto actualizada correctamente"
									);
								}}
							/>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
