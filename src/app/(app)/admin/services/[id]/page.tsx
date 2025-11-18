"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar,
    faCartPlus,
    faClock,
    faUser,
    faTag,
    faBookBookmark,
    faPenToSquare,
    faXmark,
    faXmarkCircle,
    faCheckCircle,
    faArrowRotateBack,
    faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Api } from "@/app/services/api";
import IService from "@/app/interfaces/IService";
import { motion } from "framer-motion";
import { deleteService, setStatusActive, setStatusInactive } from "@/app/(app)/provider/serviceRegister/service.service";
import Swal from "sweetalert2";
import { useAuthStore } from "@/app/store/auth.store";

export default function ServiceDetailPage() {
    const { id } = useParams();
    const { user } = useAuthStore();
    const router = useRouter();
    const [service, setService] = useState<IService | null>(null);
    const [loading, setLoading] = useState(true);

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
    console.log("🌎 Moneda detectada:", currency);

    useEffect(() => {
        if (!id) return;
        const fetchService = async () => {
            try {
                const { data } = await Api.get(`/services/find/${id}`);
                setService(data);
            } catch (error) {
                console.error("Error al cargar el servicio:", error);
                notFound();
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen text-[var(--color-primary)] text-xl font-bold">
                Cargando servicio...
            </div>
        );

    if (!service) return notFound();

    const handleDelete = async () => {
        try {
            const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Si aceptas, se eliminará el servicio para siempre",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1d2846",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
            });

            if (result.isConfirmed) {
            const res = await deleteService(id as string);

            await Swal.fire({
                title: "Servicio eliminado",
                text: res.message || "El servicio fue eliminado con éxito.",
                icon: "success",
            });

            router.back(); // 🔹 Recién acá redirigís
            }
        } catch (error) {
            console.error("Error al eliminar servicio:", error);
            Swal.fire({
            title: "Error",
            text: "No se pudo eliminar el servicio. Verifica tu rol o inténtalo nuevamente.",
            icon: "error",
            });
        }
        };

    
    const handleStatus = async () => {
        try {
            if (service.status === "active") {
            await setStatusInactive(id as string);
            setService({ ...service, status: "inactive" });
            console.log(service.status);
            
        } else {
            await setStatusActive(id as string);
            setService({ ...service, status: "active" });
            console.log(service.status);
            }
        } catch (error) {
            console.error("Error cambiando el estado:", error);
        }
    };

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

                {/* Ranking arriba derecha */}
                <div className="absolute top-3 sm:top-5 right-4 sm:right-8 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-[var(--color-primary)] font-semibold rounded-full px-3 sm:px-4 py-1 text-sm sm:text-base shadow-md">
                    <FontAwesomeIcon icon={faStar} />
                    <span>{service.rating?.toFixed(1) || "5.0"}</span>
                </div>
                {service.status === "active" ?<div className="absolute top-3 sm:top-5 left-4 sm:left-8 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-green-500 font-semibold rounded-full px-3 sm:px-4 py-1 text-sm sm:text-base shadow-md">
                    <FontAwesomeIcon icon={faBookBookmark} />
                    <span>{service.status}</span>
                </div>
                :
                <div className="absolute top-3 sm:top-5 left-4 sm:left-8 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-red-500 font-semibold rounded-full px-3 sm:px-4 py-1 text-sm sm:text-base shadow-md">
                    <FontAwesomeIcon icon={faBookBookmark} />
                    <span>{service.status}</span>
                </div>}

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
                        ${service.price} {currency}
                    </p>

                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-center gap-2 sm:gap-3 bg-red-600 text-white w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
                        onClick={handleDelete}
                    >
                        <FontAwesomeIcon
                            icon={faXmark}
                            className="text-sm md:text-base"
                            style={{ width: "1rem", height: "1rem" }}
                        />
                        Eliminar Servicio
                    </motion.button>
                    {service.status === "active" ?<motion.button
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-center gap-2 sm:gap-3 bg-red-500 text-white w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-red-450 shadow-md hover:shadow-lg transition-all"
                        onClick={handleStatus}
                    >
                        <FontAwesomeIcon
                            icon={faXmarkCircle}
                            className="text-sm md:text-base"
                            style={{ width: "1rem", height: "1rem" }}
                        />
                        Dar de Baja
                    </motion.button>
                    :
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-center gap-2 sm:gap-3 bg-green-500 text-white w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-green-450 shadow-md hover:shadow-lg transition-all"
                        onClick={handleStatus}
                    >
                        <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="text-sm md:text-base"
                            style={{ width: "1rem", height: "1rem" }}
                        />
                        Dar de Alta
                    </motion.button>}
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
        </main>
    );
}
