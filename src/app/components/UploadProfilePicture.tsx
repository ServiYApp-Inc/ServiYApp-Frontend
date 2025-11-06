"use client";

import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faSpinner, faImage } from "@fortawesome/free-solid-svg-icons";
import { Api } from "@/app/services/api";
import { toast } from "react-toastify";
import { useAuthStore } from "@/app/store/auth.store";

interface UploadProfilePictureProps {
	onSuccess?: () => void;
}

export default function UploadProfilePicture({ onSuccess }: UploadProfilePictureProps) {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [uploading, setUploading] = useState(false);
	const [preview, setPreview] = useState<string | null>(null);
	const { user, token, setAuth } = useAuthStore();

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validar tipo y tamaño
		if (!file.type.startsWith("image/")) {
			toast.error("Por favor selecciona una imagen válida (JPG o PNG)");
			return;
		}
		if (file.size > 3 * 1024 * 1024) {
			toast.error("La imagen no debe pesar más de 3 MB");
			return;
		}

		// Generar preview temporal
		const objectUrl = URL.createObjectURL(file);
		setPreview(objectUrl);

		const formData = new FormData();
		formData.append("profilePicture", file);

		setUploading(true);
		try {
			const { data } = await Api.patch(`/users/${user?.id}`, formData, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "multipart/form-data",
				},
			});

			setAuth({
				token: token!,
				role: "provider",
				user: {
					...(user as any),
					profilePicture: data.profilePicture,
				},
			});

			toast.success("Foto de perfil actualizada ✅");
			onSuccess?.();
		} catch (error) {
			console.error(error);
			toast.error("Error al subir la foto. Inténtalo nuevamente.");
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="flex flex-col items-center gap-4">
			{/* Preview */}
			<div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-primary)] shadow-md">
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
			</div>

			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				accept="image/*"
				onChange={handleFileChange}
			/>

			<button
				type="button"
				onClick={() => fileInputRef.current?.click()}
				disabled={uploading}
				className="px-4 py-2 bg-[var(--color-primary)] text-white font-semibold rounded-lg flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-60"
			>
				{uploading ? (
					<>
						<FontAwesomeIcon icon={faSpinner} spin />
						Subiendo...
					</>
				) : (
					<>
						<FontAwesomeIcon icon={faCamera} />
						Seleccionar foto
					</>
				)}
			</button>
		</div>
	);
}
