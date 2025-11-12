"use client";

import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCamera,
	faSpinner,
	faImage,
	faCheck,
	faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { Api } from "@/app/services/api";
import { toast } from "react-toastify";
import { useAuthStore } from "@/app/store/auth.store";

interface UploadProfilePictureProps {
	onSuccess?: () => void;
	role?: "user" | "provider" | "admin";
	endpointBase?: string;
}

export default function UploadProfilePicture({
	onSuccess,
	role,
	endpointBase,
}: UploadProfilePictureProps) {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [uploading, setUploading] = useState(false);
	const [preview, setPreview] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const { user, token, setAuth } = useAuthStore();

	const base =
		endpointBase ||
		(role === "provider"
			? "providers"
			: role === "admin"
			? "admins"
			: "users");

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Selecciona una imagen válida (JPG o PNG)");
			return;
		}
		if (file.size > 3 * 1024 * 1024) {
			toast.error("La imagen no debe pesar más de 3 MB");
			return;
		}

		setSelectedFile(file);
		setPreview(URL.createObjectURL(file));
	};

	const handleConfirmUpload = async () => {
		if (!selectedFile) return;
		if (!user?.id) {
			toast.error("No se encontró el usuario en sesión");
			return;
		}

		const formData = new FormData();
		formData.append("file", selectedFile);

		setUploading(true);
		try {
			const { data } = await Api.patch(
				`/${base}/${user.id}/upload-profile`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			setAuth({
				token: token!,
				role: role || (user as any).role,
				user: {
					...(user as any),
					profilePicture: data.profilePicture,
				},
			});

			setPreview(null);
			setSelectedFile(null);
			onSuccess?.();
		} catch (error: any) {
			console.error("Error:", error.response?.data || error);
			toast.error(
				error.response?.data?.message || "Error al subir la foto."
			);
		} finally {
			setUploading(false);
		}
	};

	const handleChooseAnother = () => {
		setPreview(null);
		setSelectedFile(null);
		fileInputRef.current?.click();
	};

	return (
		<div className="flex flex-col items-center gap-6 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 w-full max-w-sm transition-all">
			{/* PREVIEW */}
			<div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-[var(--color-primary)] shadow-md hover:shadow-xl transition-all">
				{preview || user?.profilePicture ? (
					<img
						src={preview || user?.profilePicture!}
						alt="Preview"
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
						<FontAwesomeIcon icon={faImage} className="text-3xl" />
					</div>
				)}

				{/* Icono flotante */}
				{!preview && (
					<div
						className="absolute bottom-2 right-2 bg-[var(--color-primary)] text-white p-2 rounded-full shadow-md cursor-pointer hover:opacity-90 transition"
						onClick={() => fileInputRef.current?.click()}
					>
						<FontAwesomeIcon icon={faCamera} />
					</div>
				)}
			</div>

			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				accept="image/*"
				onChange={handleFileChange}
			/>

			{/* BOTONES */}
			{preview ? (
				<div className="flex gap-3">
					{/* Confirmar */}
					<button
						onClick={handleConfirmUpload}
						disabled={uploading}
						className="px-5 py-2 bg-[var(--color-primary)] text-white font-semibold rounded-lg flex items-center gap-2 hover:bg-[#1b2a5e] shadow-sm transition-all disabled:opacity-60"
					>
						{uploading ? (
							<>
								<FontAwesomeIcon icon={faSpinner} spin />
								Subiendo...
							</>
						) : (
							<>
								<FontAwesomeIcon icon={faCheck} />
								Confirmar
							</>
						)}
					</button>

					{/* Cambiar */}
					<button
						onClick={handleChooseAnother}
						disabled={uploading}
						className="px-5 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg flex items-center gap-2 hover:bg-gray-200 shadow-sm transition-all disabled:opacity-60"
					>
						<FontAwesomeIcon icon={faRotateLeft} />
						Cambiar
					</button>
				</div>
			) : (
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					disabled={uploading}
					className="px-5 py-2 bg-[var(--color-primary)] text-white font-semibold rounded-lg flex items-center gap-2 hover:bg-[#1b2a5e] shadow-sm transition-all disabled:opacity-60"
				>
					<FontAwesomeIcon icon={faCamera} />
					Subir foto
				</button>
			)}
		</div>
	);
}
