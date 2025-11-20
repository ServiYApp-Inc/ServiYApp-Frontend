"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/app/components/SearchBar";
import axios from "axios";
import {
	faStar,
	faClock,
	faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import FilterTag from "@/app/components/FilterTag";
import IService from "@/app/interfaces/IService";
import ServiceCard from "@/app/components/ServiceCard";
import { useAuthStore } from "@/app/store/auth.store";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PageServices() {
	const router = useRouter();
	const { user, token } = useAuthStore();
	const [services, setServices] = useState<IService[]>([]);
	const [activeFilter, setActiveFilter] = useState<string>("");
	const [page, setPage] = useState<number>(1);
	const [limit] = useState<number>(9); // cantidad por página
	const [totalPages, setTotalPages] = useState<number>(0);
	const [param, setParam] = useState<string | undefined>(undefined);
	const [pageNumber, setPageNumber] = useState(1);

	const fetchServices = async (paramValue = param, page = pageNumber) => {
		try {
			const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}services`;

			const countryParam = user?.country?.name
			? `&country=${encodeURIComponent(user.country.name)}`
			: "";

			const endpoint = paramValue
			? `${baseUrl}/find-all-by-param?param=${paramValue}&page=${page}&limit=${limit}${countryParam}`
			: `${baseUrl}/find-all-paged?page=${page}&limit=${limit}${countryParam}`;

			const res = await axios.get(endpoint, {
			headers: {
				Authorization: `Bearer ${token}`
			}
			});

			setServices(res.data);

			if (res.data.length < limit) {
			setTotalPages(page);
			} else {
			setTotalPages(page + 1);
			}
		} catch (error) {
			console.error("Error fetching services:", error);
		}
	};



	useEffect(() => {
		fetchServices(undefined, page);
	}, [page]);
	

	const handleFilter = async (param: string) => {
		const newFilter = activeFilter === param ? "" : param;
		setActiveFilter(newFilter);
		setParam(newFilter || undefined); // ✅ Guarda el filtro activo en el estado
		setPage(1);
		await fetchServices(newFilter || undefined, 1);
	};


	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setPage(newPage);
			fetchServices(param || undefined, newPage); // ✅ Usa el param del estado
		}
	};

	// ✅ NUEVO: función para recibir resultados desde SearchBar
const handleSearchResults = (data: IService[]) => {
	setServices(data);
	setPage(1);
	setActiveFilter("");
	setParam(undefined); // ✅ resetea filtros anteriores
	setTotalPages(1);    // ✅ oculta paginado si es búsqueda
	};


	return (
		<main className="flex flex-col justify-start bg--background overflow-x-hidden overflow-y-hidden min-h-screen px-2 pb-20 md:pb-4 max-w-[1300px] mx-auto">
		<h1 className="font-bold text-[var(--color-primary)] text-[48px] mt-10 text-center md:text-left">
			Servicios
		</h1>

		{/* Barra superior */}
		<div className="w-full bg-[var(--color-primary)] rounded-2xl py-4 mt-6 flex flex-col items-start">
			<h4 className="mx-4 text-white text-[36px] font-semiBold text-center md:text-left">
			Encuentra tu servicio de belleza ideal
			</h4>
			<span className="mx-4 text-[20px] font-medium text-white text-center md:text-left">
			Profesionales certificados a tu domicilio
			</span>

			{/* ✅ Le pasamos la función al hijo */}
			<SearchBar onResults={handleSearchResults} />
		</div>

		{/* Filtros */}
		<span className="text-[#949492] mt-5">
			Filtra por:
			<ul className="flex flex-col lg:flex-row text-black font-semibold gap-2 rounded-lg mb-4">
			<FilterTag
				icon={faDollarSign}
				label="Menor Precio"
				isActive={activeFilter === "price"}
				onClick={() => handleFilter("price")}
			/>
			<FilterTag
				icon={faClock}
				label="Menor Duración"
				isActive={activeFilter === "duration"}
				onClick={() => handleFilter("duration")}
			/>
			</ul>
		</span>

		{/* Cards */}
		<div>
			<span className="text-black/30 mt-5 block">
			{services.length} servicios disponibles
			</span>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-4 mt-4">
			{services.map((s: IService) => (
				<ServiceCard key={s.id} {...s} />
			))}
			</div>
		</div>

		{/* 🔹 Paginador */}
		{totalPages > 1 && ( <div className="flex justify-center items-center gap-3 mt-10">
			<button
			onClick={() => handlePageChange(page - 1)}
			disabled={page === 1}
			className={`px-4 py-2 rounded-md ${
				page === 1
				? "bg-gray-300 text-gray-500 cursor-not-allowed"
				: "bg-[var(--color-primary)] text-white hover:opacity-90"
			}`}
			>
			Anterior
			</button>

			{[...Array(totalPages)].map((_, index) => {
			const num = index + 1;
			return (
				<button
				key={num}
				onClick={() => handlePageChange(num)}
				className={`px-3 py-2 rounded-md ${
					page === num
					? "bg-[var(--color-primary)] text-white font-semibold"
					: "bg-gray-200 text-black hover:bg-gray-300"
				}`}
				>
				{num}
				</button>
			);
			})}

			<button
			onClick={() => handlePageChange(page + 1)}
			disabled={page === totalPages}
			className={`px-4 py-2 rounded-md ${
				page === totalPages
				? "bg-gray-300 text-gray-500 cursor-not-allowed"
				: "bg-[var(--color-primary)] text-white hover:opacity-90"
			}`}
			>
			Siguiente
			</button>
		</div>)}
		<span className="text-[var(--color-primary)] mt-5 block">Si algún servicio presenta contenido ofensivo y/o viola los <button className="underline hover:font-bold transition" onClick={()=> {router.push("/user/terms")}}> términos y condiciones</button> de nuestra página, por favor contactarse a <strong>serviyapp.auth@gmail.com</strong></span>
		</main>
	);
	}
