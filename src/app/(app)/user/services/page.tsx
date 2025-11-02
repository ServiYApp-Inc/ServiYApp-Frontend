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

export default async function PageServices() {
	let services: IService[];

	try {
		const fetchServices = await axios.get(
			"http://localhost:3000/services/find-all"
		);
		services = fetchServices.data;
		if (services.length === 0) {
			notFound();
		}
	} catch (error) {
		console.error("Error fetching service data:", error);
		notFound();
	}

	return (
		<main
			className="
            flex flex-col justify-start 
            bg--background 
            overflow-x-hidden
            overflow-y-hidden
            min-h-screen 
            px-2
            pb-20 md:pb-4
            max-w-[1300px] mx-auto
        "
		>
			<h1 className="font-bold text-[var(--color-primary)] text-[48px] mt-10 text-center md:text-left">
				Servicios
			</h1>

			{/* Contenedor de Barra superior con búsqueda */}
			<div className="w-full bg-[var(--color-primary)] rounded-2xl py-4 mt-6 flex flex-col items-start">
				<h4 className="mx-4 text-white text-[36px] font-semiBold text-center md:text-left">
					Encuentra tu servicio de belleza ideal
				</h4>
				<span className="mx-4 text-[20px] font-medium text-white text-center md:text-left">
					Profesionales certificados a tu domicilio
				</span>

				{/* Barra de búsqueda */}
				<SearchBar />
			</div>

			{/* Filtros */}
			<span className="text-[#949492] mt-5">
				Filtra por:
				<ul className="flex flex-col lg:flex-row text-black font-semibold gap-2 rounded-lg mb-4">
					<FilterTag icon={faDollarSign} label="Menor Precio" />
					<FilterTag icon={faStar} label="Mejore Valorado" />
					<FilterTag icon={faClock} label="Menor Duracion" />
					<FilterTag icon={faTag} label="Categoria" />
				</ul>
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
