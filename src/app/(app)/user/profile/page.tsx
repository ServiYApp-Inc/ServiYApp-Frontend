"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import EditProviderForm from "@/app/components/EditProviderForm";
import UploadProfilePicture from "@/app/components/UploadProfilePicture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faBell,
	faCalendar,
	faGear,
	faPenToSquare,
	faUser,
	faEnvelope,
	faMapMarkerAlt,
	faGlobe,
	faCity,
} from "@fortawesome/free-solid-svg-icons";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import ReactCountryFlag from "react-country-flag";
import { Api } from "@/app/services/api";
import IProvider from "@/app/interfaces/IProvider";

const ProfileItem = dynamic(() => import("@/app/components/ProfileItem"), {
	ssr: false,
});

export default function ProviderProfilePage() {
	const { user, token, setAuth } = useAuthStore();
	const provider = user as IProvider;
	const [showEdit, setShowEdit] = useState(false);
	const [showUpload, setShowUpload] = useState(false);

	// Refresca datos del proveedor desde el backend
	const refreshProvider = async () => {
		try {
			if (!provider?.id || !token) return;
			const { data } = await Api.get(`/providers/${provider.id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setAuth({ token, role: "provider", user: data });
		} catch (error) {
			console.error("Error refrescando proveedor:", error);
		}
	};

	return (
		<main className="max-w-6xl mx-auto mt-10 px-4 font-nunito">
			{/* HEADER */}
			<section className="relative bg-[var(--color-primary)] text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg transition-all">
				{/* FOTO + ICONO */}
				<div className="flex items-center gap-6 relative">
					<div className="relative group w-36 h-36">
						{/* Imagen o placeholder */}
						{provider?.profilePicture ? (
							<img
								src={provider.profilePicture}
								alt="Provider profile"
								className="w-36 h-36 rounded-full border-4 border-white object-cover shadow-lg transition-all duration-300 group-hover:opacity-80"
							/>
						) : (
							<div className="w-36 h-36 rounded-full border-4 border-white flex items-center justify-center bg-white/20 shadow-lg group-hover:opacity-80 transition-all duration-300">
								<FontAwesomeIcon
									icon={faUser}
									className="text-4xl text-gray-200"
								/>
							</div>
						)}

						{/* BOTÓN DE EDITAR FOTO (lapicito) */}
						<button
							onClick={() => setShowUpload(true)}
							className="absolute bottom-2 right-2 bg-white text-[var(--color-primary)] rounded-full p-2 shadow-md hover:bg-gray-100 transition-all opacity-90 hover:opacity-100"
							title="Editar foto de perfil"
						>
							<FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
						</button>
					</div>

					{/* INFO PROVEEDOR */}
					<div>
						<h2 className="text-4xl font-bold tracking-tight capitalize">
							{provider?.names} {provider?.surnames}
						</h2>
						<p className="text-lg opacity-90">{provider?.email}</p>

						<button
							onClick={() => setShowEdit(true)}
							className="mt-4 px-4 py-2 bg-white text-[var(--color-primary)] font-semibold rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-all"
						>
							<FontAwesomeIcon icon={faPenToSquare} />
							Editar perfil
						</button>
					</div>
				</div>

				{/* ESTADÍSTICAS */}
				<div className="flex justify-center md:justify-end gap-10">
					<div className="text-center">
						<p className="text-4xl font-bold">8</p>
						<p className="text-lg opacity-80">Servicios</p>
					</div>
					<div className="text-center">
						<p className="text-4xl font-bold">14</p>
						<p className="text-lg opacity-80">Turnos</p>
					</div>
					<div className="text-center">
						<p className="text-4xl font-bold">5</p>
						<p className="text-lg opacity-80">Reseñas</p>
					</div>
				</div>
			</section>

			{/* INFORMACIÓN PERSONAL */}
			<section className="mt-10 bg-white border border-gray-200 rounded-3xl shadow-md p-8">
				<h3 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
					Información del proveedor
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
					{/* Nombre */}
					<div className="flex items-center gap-3">
						<FontAwesomeIcon
							icon={faUser}
							className="text-[var(--color-primary)] w-5 h-5"
						/>
						<p className="font-medium">
							<span className="text-gray-500 block text-sm">Nombre completo</span>
							{provider?.names} {provider?.surnames}
						</p>
					</div>

					{/* Correo */}
					<div className="flex items-center gap-3">
						<FontAwesomeIcon
							icon={faEnvelope}
							className="text-[var(--color-primary)] w-5 h-5"
						/>
						<p className="font-medium">
							<span className="text-gray-500 block text-sm">Correo electrónico</span>
							{provider?.email}
						</p>
					</div>

					{/* Dirección */}
					<div className="flex items-center gap-3">
						<FontAwesomeIcon
							icon={faMapMarkerAlt}
							className="text-[var(--color-primary)] w-5 h-5"
						/>
						<p className="font-medium">
							<span className="text-gray-500 block text-sm">Dirección</span>
							{provider?.address || "No especificada"}
						</p>
					</div>

					{/* País */}
					<div className="flex items-center gap-3">
						<FontAwesomeIcon
							icon={faGlobe}
							className="text-[var(--color-primary)] w-5 h-5"
						/>
						<div className="font-medium flex items-center gap-2">
							<span className="text-gray-500 block text-sm">País</span>
							{provider?.country ? (
								<div className="flex items-center gap-2">
									<ReactCountryFlag
										countryCode={provider.country.code}
										svg
										style={{ width: "1.3em", height: "1.3em" }}
									/>
									<span>{provider.country.name}</span>
								</div>
							) : (
								"No especificado"
							)}
						</div>
					</div>

					{/* Región / Ciudad */}
					<div className="flex items-center gap-3">
						<FontAwesomeIcon
							icon={faCity}
							className="text-[var(--color-primary)] w-5 h-5"
						/>
						<p className="font-medium">
							<span className="text-gray-500 block text-sm">Ciudad / Región</span>
							{provider?.region?.name ||
							provider?.city?.name ? (
								`${provider.region?.name || ""}${
									provider.city ? `, ${provider.city.name}` : ""
								}`
							) : (
								"No especificada"
							)}
						</p>
					</div>
				</div>
			</section>

			{/* SECCIÓN INFERIOR */}
			<section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* MI CUENTA */}
				<div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-md flex flex-col gap-5">
					<h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">
						Mi cuenta
					</h3>

					<ProfileItem icon={faCalendar} label="Turnos programados" />
					<ProfileItem icon={faStar} label="Mis reseñas" />
					<ProfileItem icon={faBell} label="Notificaciones" />
					<ProfileItem icon={faGear} label="Configuración" />
				</div>

				{/* INFO EXTRA */}
				<div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-md flex flex-col items-center justify-center text-center text-gray-500">
					<p className="text-lg">
						Aquí podrás ver tus próximos turnos, estadísticas y administrar tus servicios.
					</p>
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

							<EditProviderForm
								onSuccess={async () => {
									await refreshProvider();
									setShowEdit(false);
									toast.success("Perfil actualizado correctamente", {
										position: "top-center",
										autoClose: 2000,
									});
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
								role="provider"
								onSuccess={async () => {
									await refreshProvider();
									setShowUpload(false);
									toast.success("Foto actualizada correctamente", {
										position: "top-center",
										autoClose: 2000,
									});
								}}
							/>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
