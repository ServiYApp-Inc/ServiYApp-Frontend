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

const services: IService[] = [
	{
		"id": "1",
		"name": "Corte de cabello",
		"description": "Un corte de cabello profesional y moderno.",
		"photo": "https://homme.mx/wp-content/uploads/2023/10/peluqueria-y-barberia-homme-luxury-barbers-04.jpg",
		"status": "active",
		"duration": 30,
		"createdAt": "2023-10-01T10:00:00Z",
		"provider": {
		"id": "1",
		"names": "Juan",
		"surnames": "Pérez",
		"email": "juanperez@gmail.com",
		"phone": "123456789"
		},
		"rating": 4.5,
		"price": 15.0,
		"category": {
		"id": "1",
		"name": "Peluquería"
		}
	},
	{
		"id": "6",
		"name": "Limpieza facial",
		"description": "Rutina completa de purificación e hidratación facial.",
		"photo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbQ1sAZ5QyB5QvC3uhMefYg-ovxgVMfwlsCw&s",
		"status": "active",
		"duration": 60,
		"createdAt": "2024-06-01T13:45:00Z",
		"provider": {
		"id": "1",
		"names": "Juan",
		"surnames": "Pérez",
		"email": "juanperez@gmail.com",
		"phone": "123456789"
		},
		"rating": 4.4,
		"price": 35.0,
		"category": {
		"id": "6",
		"name": "Limpieza Facial"
		}
	},
	{
		"id": "9",
		"name": "Spa de manos y pies",
		"description": "Tratamiento completo de hidratación, exfoliación y masaje para manos y pies.",
		"photo": "https://media.istockphoto.com/id/516657292/es/foto/mujer-en-el-spa-con-hecho-de-manicura-y-pedicura.jpg?s=612x612&w=0&k=20&c=GzmHgq48UPBagMTtkiPqu5Fsf1XRC3GFMnE0evOUcG0=",
		"status": "active",
		"duration": 70,
		"createdAt": "2024-09-18T17:45:00Z",
		"provider": {
		"id": "1",
		"names": "Juan",
		"surnames": "Pérez",
		"email": "juanperez@gmail.com",
		"phone": "123456789"
		},
		"rating": 4.9,
		"price": 48.0,
		"category": {
		"id": "8",
		"name": "Spa"
		}
	},
	{
		"id": "10",
		"name": "Masaje Completo",
		"description": "Tratamiento completo de masaje relajante para todo el cuerpo.",
		"photo": "https://ownskin.com.mx/wp-content/uploads/2024/04/Masaje-Cuerpo-Completo-1.jpg.webp",
		"status": "active",
		"duration": 45,
		"createdAt": "2024-09-18T17:45:00Z",
		"provider": {
		"id": "1",
		"names": "Juan",
		"surnames": "Pérez",
		"email": "juanperez@gmail.com",
		"phone": "123456789"
		},
		"rating": 4.4,
		"price": 78.0,
		"category": {
		"id": "4",
		"name": "Masajes"
		}
	}
]

export default async function PageServices() {
	// let services: IService[];

	// try {
	// 	const fetchServices = await axios.get(
	// 		"http://localhost:3000/services/find-all"
	// 	);
	// 	services = fetchServices.data;
	// 	if (services.length === 0) {
	// 		notFound();
	// 	}
	// } catch (error) {
	// 	console.error("Error fetching service data:", error);
	// 	notFound();
	// }

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
				Mis Servicios
			</h1>

			{/* Filtros */}
			<span className="text-[#949492] mt-5">
				Filtra por:
				<ul className="flex flex-col lg:flex-row text-black font-semibold gap-2 rounded-lg mb-4">
					<FilterTag icon={faDollarSign} label="Menor Precio" />
					<FilterTag icon={faStar} label="Mejores Valorados" />
					<FilterTag icon={faClock} label="Menor Duracion" />
					<FilterTag icon={faTag} label="Categoria"/>
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
