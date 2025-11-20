"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faStar,
	faCartPlus,
	faClock,
	faUser,
	faTag,
	faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Api } from "@/app/services/api";
import IService from "@/app/interfaces/IService";
import { motion } from "framer-motion";
import { useCartStore } from "@/app/store/useCartStore";
import { useAuthStore } from "@/app/store/auth.store";

interface IReview {
    rating: number;
    comment: string;
    photoUrl: string | null;
    createdAt: string;
    serviceName: string | null;
	userName: string;
}


export default function ServiceDetailPage() {
	const { id } = useParams();
	const { user } = useAuthStore();
	const router = useRouter();
	const [service, setService] = useState<IService | null>(null);
	const [loading, setLoading] = useState(true);
	const [reviews, setReviews] = useState<IReview[]>([]);


	const getCurrencyByCountry = (countryName?: string) => {
		if (!countryName) return "COP"; // default

		const normalized = countryName.toLowerCase();

		if (normalized.includes("colombia")) return "COP";
		if (normalized.includes("méxico") || normalized.includes("mexico")) return "MXN";
		if (normalized.includes("argentina")) return "ARS";

		return "COP"; // fallback
	};

	const userCountry = user?.country?.name;
	const currency = getCurrencyByCountry(userCountry);

	useEffect(() => {
		if (!id) return;

		const fetchData = async () => {
			try {
				// 1. Obtener servicio
				const { data: serviceData } = await Api.get(`/services/find/${id}`);
				setService(serviceData);

				const providerId = serviceData.provider?.id;
				const serviceId = serviceData.id;

				// 2. Si hay proveedor y servicio → buscar reviews
				if (providerId && serviceId) {
					try {
						const reviewsResponse = await Api.get(
							`reviews/provider/${providerId}/service/${serviceId}/reviews`
						);

						const list =
							reviewsResponse.data.reviews ??
							reviewsResponse.data ??
							[];

						const normalized = list.map((r: any) => ({
							rating: r.rating,
							comment: r.comment,
							photoUrl: r.photoUrl ?? null,
							createdAt: r.createdAt,
							serviceName: r.serviceName ?? null,
							userName: r.userName ?? "Usuario",
						}));

						setReviews(normalized);

					} catch (error: any) {
						if (error.response?.status === 404) {
							// No hay reviews
							setReviews([]);
						} else {
							throw error;
						}
					}
				}

			} catch (error) {
				console.error("Error al cargar servicio o reviews:", error);
				notFound();
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id]);


	if (loading)
		return (
			<div className="flex justify-center items-center h-screen text-gray-500 text-lg">
				Cargando servicio...
			</div>
		);

	if (!service) return notFound();

	const handleAddToCart = () => {
		router.push(`/user/order/confirm?id=${service.id}`);
	};

	const averageRating =
 		reviews.length > 0
    	? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    	: null;



	return (
		<main className="min-h-screen flex flex-col items-center font-nunito bg-gray-50 pb-10">
			{/* Título general */}
			<div className="w-full max-w-5xl px-4 sm:px-6 md:px-10 mt-8 mb-4 text-center md:text-left">
				<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-2">
					Detalle del servicio
				</h1>
			</div>

			{/* Imagen principal con detalles */}
			<section className="relative w-full max-w-4xl overflow-hidden rounded-t-2xl shadow-md">
				<img
					src={service?.photos?.[0]}
					alt={service.name}
					className="w-full h-[220px] sm:h-[260px] md:h-[300px] object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>


				{/* Nombre dentro de la imagen */}
				<div className="absolute bottom-20 sm:bottom-24 left-4 sm:left-8 text-white drop-shadow-xl">
					<h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
						{service.name}
					</h2>
				</div>

				{/* Tarjetas dentro de la imagen */}
				<div
					className="
						absolute 
						bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 
						flex flex-wrap gap-2 sm:gap-4 justify-start"
				>
					{[
						{
							icon: faClock,
							label: "Duración",
							value: `${service.duration} min`,
						},
						{
							icon: faUser,
							label: "Profesional",
							value: `${service.provider?.names || ""} ${
								service.provider?.surnames || ""
							}`,
						},
						{
							icon: faTag,
							label: "Categoría",
							value: service.category?.name || "No especificada",
						},
					].map((item, i) => (
						<div
							key={i}
							className="
								flex items-center gap-2 sm:gap-3 bg-gray-50/90 backdrop-blur-sm rounded-xl p-2 sm:p-3 shadow-sm
								w-auto min-w-[100px] sm:min-w-[150px]
								transition-all"
						>
							{/* Oculto en mobile el ícono y título para ahorrar espacio */}
							<div className="hidden sm:flex flex-shrink-0 bg-[var(--color-primary)] text-white rounded-full w-8 h-8 flex items-center justify-center text-xs">
								<FontAwesomeIcon icon={item.icon} />
							</div>
							<div className="flex flex-col leading-tight">
								<p className="hidden sm:block text-gray-500 text-xs font-medium">
									{item.label}
								</p>
								{/* En mobile solo mostramos el dato */}
								<p className="font-semibold text-sm sm:text-base text-gray-800 truncate max-w-[100px] sm:max-w-none">
									{item.value}
								</p>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Contenido principal */}
			<motion.section
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="w-full max-w-4xl bg-white rounded-b-2xl shadow-md z-10 px-4 sm:px-8 md:px-10 py-6 sm:py-8 mt-[-2px] space-y-4"
			>
				{/* Descripción */}
				<p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed border-l-4 border-[var(--color-primary)] pl-3 sm:pl-4">
					{service.description ||
						"Este servicio aún no tiene una descripción."}
				</p>

				{/* Precio y CTA */}
				<div className="flex flex-col sm:flex-row justify-between items-center border-t pt-5 mt-2 gap-4 sm:gap-0">
					<p className="text-2xl sm:text-3xl font-extrabold text-[var(--color-primary)]">
						${service.price}
					</p>

					<motion.button
						whileTap={{ scale: 0.97 }}
						onClick={handleAddToCart}
						className="flex items-center justify-center gap-2 sm:gap-3 bg-[var(--color-primary)] text-white w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-[var(--color-primary-dark,#1A2340)] shadow-md hover:shadow-lg transition-all"
					>
						<FontAwesomeIcon icon={faCartPlus} className="text-lg sm:text-xl" />
						Agregar al carrito
					</motion.button>
				</div>
			</motion.section>
			<button onClick={() => router.back()} className=" py-1 px-3 text-white bg-[var(--color-primary)] rounded-xl mt-5 hover:scale-105 transition">
				<FontAwesomeIcon
					icon={faArrowLeft}
					className="text-sm md:text-base mr-1"
					style={{ width: "1rem", height: "1rem" }}
				/>
				Volver a Servicios
			</button>

			{/* === Reviews Section === */}
			<section className="w-full max-w-4xl mt-10 px-4 sm:px-8 md:px-10">
				<h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">
					Opiniones del servicio {averageRating ? `(${averageRating}` : "(0"}
					<FontAwesomeIcon icon={faStar} style={{ fontSize: '18px' }}></FontAwesomeIcon>)
				</h2>


				{/* Si no hay reviews */}
				{reviews.length === 0 && (
					<p className="text-gray-500 italic">
						Aún no hay opiniones sobre este servicio.
					</p>
				)} 

				{/* Lista de reviews */}
				<div className="space-y-4">
					{reviews.map((r, index) => (
					<div key={index} className="bg-white shadow-sm rounded-xl p-4 border border-gray-100">
						
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<FontAwesomeIcon icon={faUser} className="text-[var(--color-primary)]" />
								<p className="font-semibold">{r.userName ? "Usuario Anónimo" : "Usuario Anónimo"}</p>
							</div>

							{/* Stars */}
							<div className="flex items-center gap-1">
								{[1,2,3,4,5].map(num => (
									<FontAwesomeIcon
										key={num}
										icon={faStar}
										className={`${
											num <= r.rating ? "text-yellow-400" : "text-gray-300"
										}`}
									/>
								))}
							</div>
						</div>

						<p className="text-gray-700 mb-2">{r.comment}</p>

						{r.photoUrl && (
							<img
								src={r.photoUrl}
								alt="Imagen del usuario"
								className="w-32 h-32 object-cover rounded-lg mt-2"
							/>
						)}
					</div>
				))}

				</div>
			</section>
		</main>
	);
}