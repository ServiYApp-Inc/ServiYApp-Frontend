"use client";

import { faBook, faBookBookmark, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import FilterTagsProvider from "@/app/components/FilterTagsProvider";
import { notFound } from "next/navigation";
import IService from "@/app/interfaces/IService";
import ServiceCard from "@/app/components/ServiceCard";
import Link from "next/link";
import { useAuthStore } from "@/app/store/auth.store";
import { useEffect, useState } from "react";
import { getProviderServices } from "../serviceRegister/service.service";

export default function PageServices() {
	const { user, role } = useAuthStore();
	const [services, setServices] = useState<IService[]>([]);
	const [filteredServices, setFilteredServices] = useState<IService[]>([]);
	const [selectedFilter, setSelectedFilter] = useState<"ALL" | "active" | "inactive" | "pending">("ALL");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchServices = async () => {
			try {
				if (!user) {
					console.error("Usuario no autenticado");
					notFound();
					return;
				}
				const data = await getProviderServices(user.id);
				setServices(data);
				setFilteredServices(data);
				if (data.length === 0) notFound();
			} catch (error) {
				console.error("Error al obtener servicios:", error);
				notFound();
			} finally {
				setLoading(false);
			}
		};
		fetchServices();
	}, [user, role]);

	if (loading)
		return (
			<div className="flex justify-center items-center h-screen text-[var(--color-primary)] text-xl font-bold">
				Cargando servicio...
			</div>
		);

	const handleFilter = (status: "active" | "inactive" | "pending" | "ALL") => {
		setSelectedFilter(status);
		if (status === "ALL") {
			setFilteredServices(services);
		} else {
			const filtered = services.filter((s) => s.status === status);
			setFilteredServices(filtered);
		}
	};

	return (
		<main className="flex flex-col justify-start bg--background overflow-x-hidden overflow-y-hidden min-h-screen px-2 pb-20 md:pb-4 max-w-[1300px] mx-auto">
			<h1 className="font-bold text-[var(--color-primary)] text-[48px] mt-10 text-center md:text-left">
				Mis Servicios
			</h1>

			{/* Barra superior */}
			<div className="w-full bg-[var(--color-primary)] rounded-2xl py-4 mt-6 flex flex-col items-start">
				<h4 className="mx-4 text-white text-[36px] font-semiBold text-center md:text-left">
					Administra tus servicios
				</h4>
				<span className="mx-4 text-[20px] font-medium text-white text-center md:text-left">
					En su detalle podes: Modificar, Dar de Alta o Baja tu Servicio
				</span>
			</div>

			<Link href={"/provider/serviceRegister"}>
				<button className="bg-[var(--color-primary)] text-white mt-5 px-5 py-2 rounded-lg font-medium hover:opacity-90">
					Registar un <strong>Nuevo Servicio</strong>
				</button>
			</Link>

			{/* 🔹 Filtros */}
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
