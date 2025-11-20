"use client";

import ServiceCard from "@/app/components/ServiceCard";
import FilterTagsProvider from "@/app/components/FilterTagsProvider";
import IService from "@/app/interfaces/IService";
import { useAuthStore } from "@/app/store/auth.store";
import { useEffect, useState } from "react";
import { getAllAdminServices, getAllServices } from "../../provider/serviceRegister/service.service";
import {
	faBook,
	faBookBookmark,
	faCheck,
	faXmark,
} from "@fortawesome/free-solid-svg-icons";

export default function Services() {
	const { user, role } = useAuthStore();
	const [services, setServices] = useState<IService[]>([]);
	const [filteredServices, setFilteredServices] = useState<IService[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedFilter, setSelectedFilter] = useState<
		"ALL" | "active" | "inactive" | "pending"
	>("ALL");

	// 🔹 Paginación
	const [page, setPage] = useState(1);
	const [limit] = useState(9);
	const [hasNextPage, setHasNextPage] = useState(true);

	const fetchServices = async (pageNumber: number) => {
		try {
			setLoading(true);
			// const data = await getAllServices(pageNumber, limit);
			const data = await getAllAdminServices();

			// 🔹 Reemplazamos servicios previos por los nuevos
			setServices(data);
			setFilteredServices(data);

			// 🔹 Si trajo menos de "limit", no hay siguiente página
			setHasNextPage(data.length === limit);
		} catch (error) {
			console.error("Error al obtener servicios:", error);
		} finally {
			setLoading(false);
		}
	};

	console.log(services);
	

	useEffect(() => {
		fetchServices(page);
	}, [page]);

	const handleFilter = (status: "active" | "inactive" | "pending" | "ALL") => {
		setSelectedFilter(status);
		if (status === "ALL") {
			setFilteredServices(services);
		} else {
			const filtered = services.filter((s) => s.status === status);
			setFilteredServices(filtered);
		}
	};

	const handlePageChange = (newPage: number) => {
		if (newPage < 1) return;
		if (newPage > page && !hasNextPage) return; // Evita avanzar si no hay más
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" }); // 🔹 vuelve arriba
	};

	if (loading && services.length === 0)
		return (
			<div className="flex justify-center items-center h-screen text-[var(--color-primary)] text-xl font-bold">
				Cargando servicios...
			</div>
		);

	return (
		<main className="flex flex-col justify-start bg--background overflow-x-hidden overflow-y-hidden min-h-screen px-2 pb-20 md:pb-4 max-w-[1300px] mx-auto">
			<h1 className="font-bold text-[var(--color-primary)] text-[48px] mt-10 text-center md:text-left">
				Servicios
			</h1>

			{/* Barra superior */}
			<div className="w-full bg-[var(--color-primary)] rounded-2xl py-4 mt-6 flex flex-col items-start">
				<h4 className="mx-4 text-white text-[36px] font-semiBold text-center md:text-left">
					Administra los servicios
				</h4>
				<span className="mx-4 text-[20px] font-medium text-white text-center md:text-left">
					En su detalle podés: Aceptar, Dar de Baja o Eliminar un Servicio
				</span>
			</div>

			{/* Filtros */}
			<span className="text-[#949492] mt-2">
				Filtra por:
				<ul className="flex flex-col lg:flex-row text-black font-semibold gap-2 rounded-lg mb-4">
					<FilterTagsProvider
						icon={faCheck}
						label="Activos"
						active={selectedFilter === "active"}
						onClick={() => handleFilter("active")}
					/>
					<FilterTagsProvider
						icon={faXmark}
						label="Inactivos"
						active={selectedFilter === "inactive"}
						onClick={() => handleFilter("inactive")}
					/>
					<FilterTagsProvider
						icon={faBookBookmark}
						label="Pendientes"
						active={selectedFilter === "pending"}
						onClick={() => handleFilter("pending")}
					/>
					<FilterTagsProvider
						icon={faBook}
						label="Todos"
						active={selectedFilter === "ALL"}
						onClick={() => handleFilter("ALL")}
					/>
				</ul>
			</span>

			{/* Cards */}
			<div>
				<span className="text-black/30 mt-5">
					{filteredServices.length} servicios disponibles
				</span>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-4 mt-4">
					{filteredServices.map((s) => (
						<ServiceCard key={s.id} {...s} />
					))}
				</div>
			</div>
		</main>
	);
}
