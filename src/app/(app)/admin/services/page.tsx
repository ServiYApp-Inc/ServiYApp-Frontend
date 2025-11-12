"use client";

import ServiceCard from "@/app/components/ServiceCard";
import IService from "@/app/interfaces/IService";
import { useAuthStore } from "@/app/store/auth.store";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllServices, getProviderServices } from "../../provider/serviceRegister/service.service";

export default function Services() {
	const { user, role } = useAuthStore();
	const [services, setServices] = useState<IService[]>([]);
	const [filteredServices, setFilteredServices] = useState<IService[]>([]);
	const [loading, setLoading] = useState(true);


	useEffect(() => {
		const fetchServices = async () =>{
						try {
							if (!user) {
								console.error("Usuario no autenticado");
								notFound();
								return;
							}
							const data = await getAllServices();
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
	}, [user, role])

	return (
		<main className="flex flex-col justify-start bg--background overflow-x-hidden overflow-y-hidden min-h-screen px-2 pb-20 md:pb-4 max-w-[1300px] mx-auto">
			<h1 className="font-bold text-[var(--color-primary)] text-[48px] mt-10 text-center md:text-left">
				Servicios
			</h1>

			{/* Cards */}
						<div>
							<span className="text-black/30 mt-5">
								{filteredServices.length} servicios disponibles
							</span>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-4 mt-4">
								{services.map((s) => (
									<ServiceCard key={s.id} {...s} />
								))}
							</div>
						</div>
		</main>
	);
}
