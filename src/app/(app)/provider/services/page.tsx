"use client";

/*-- Componentes --*/
import SearchBar from "@/app/components/SearchBar";
import axios from "axios";

import {
	faStar,
	faClock,
	faTag,
	faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import FilterTag from "@/app/components/FilterTag";
import { notFound } from "next/navigation";
import IService from "@/app/interfaces/IService";
import ServiceCard from "@/app/components/ServiceCard";
import Link from "next/link";
import { useAuthStore } from "@/app/store/auth.store";
import { useEffect, useState } from "react";
import { getProviderServices } from "../serviceRegister/service.service";


export default function PageServices() {
	const { user, role } = useAuthStore();
	const [services, setServices] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchServices = async () => {
		try {
			if (!user) {
			console.error("Usuario no autenticado");
			notFound();
			return;
			}
			let data;
			data = await getProviderServices(user.id);
			setServices(data);
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

	if (loading) return <div className="flex justify-center items-center h-screen text-[var(--color-primary)] text-xl font-bold">Cargando servicio...</div>

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
				{/* <SearchBar/> */}
			</div>
			{/* Filtros */}
			<span className="text-[#949492] mt-2">
				<Link href={"/provider/serviceRegister"}>
					<button className="py-1 px-3 bg-green-400 rounded-xl mt-2 hover:bg-green-200"> Registar un <strong>Nuevo Servicio</strong></button>
				</Link>
				{/* Filtra por:
				<ul className="flex flex-col lg:flex-row text-black font-semibold gap-2 rounded-lg mb-4">
					<FilterTag icon={faDollarSign} label="Menor Precio" />
					<FilterTag icon={faStar} label="Mejores Valorados" />
					<FilterTag icon={faClock} label="Menor Duracion" />
				</ul> */}
			</span>

			{/* Cards */}
			<div>
				<span className="text-black/30 mt-5">
					{services.length} servicios disponibles
				</span>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-4 mt-4">
					{services
						? services.map((s: IService) => {
								return <ServiceCard key={s.id} {...s} />;
						})
						: null}
				</div>
			</div>
		</main>
	);
}
