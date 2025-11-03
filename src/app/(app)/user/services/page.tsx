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
		"id": "2",
		"name": "Maquillaje social",
		"description": "Maquillaje para eventos, novias y sesiones fotográficas.",
		"photo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlnnsWfjHmbnFUX6gAPKsnFfLV6WWSiXhCnw&s",
		"status": "active",
		"duration": 60,
		"createdAt": "2023-11-12T14:30:00Z",
		"provider": {
		"id": "2",
		"names": "María",
		"surnames": "Gómez",
		"email": "maria.gomez@mail.com",
		"phone": "298765432"
		},
		"rating": 4.8,
		"price": 30.0,
		"category": {
		"id": "2",
		"name": "Maquillaje"
		}
	},
	{
		"id": "3",
		"name": "Uñas semipermanente",
		"description": "Diseño y esmaltado semipermanente con cuidado profesional.",
		"photo": "https://s1.ppllstatics.com/mujerhoy/www/multimedia/202206/09/media/cortadas/manicura-esmalte-semipermanente-kaFG-U170374946684dCF-1248x1248@MujerHoy.jpg",
		"status": "active",
		"duration": 45,
		"createdAt": "2024-02-05T09:00:00Z",
		"provider": {
		"id": "3",
		"names": "Lucía",
		"surnames": "Romero",
		"email": "lucia.romero@beauty.com",
		"phone": "341123987"
		},
		"rating": 4.6,
		"price": 18.0,
		"category": {
		"id": "3",
		"name": "Manicura"
		}
	},
	{
		"id": "4",
		"name": "Masaje relajante",
		"description": "Sesión relajante para aliviar tensión y estrés.",
		"photo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnOZ4ccRT4LHXp2ZLTz3YGOMybESkUOZMnQg&s",
		"status": "active",
		"duration": 50,
		"createdAt": "2024-03-22T16:00:00Z",
		"provider": {
		"id": "4",
		"names": "Sofía",
		"surnames": "López",
		"email": "sofia.lopez@spa.com",
		"phone": "3415550101"
		},
		"rating": 4.7,
		"price": 40.0,
		"category": {
		"id": "4",
		"name": "Masajes"
		}
	},
	{
		"id": "5",
		"name": "Extension de pestañas",
		"description": "Extensiones y lifting para mayor volumen y definición.",
		"photo": "https://tusdudasdesalud.com/wp-content/uploads/2018/06/extension_pestanas-1200x720.jpg",
		"status": "active",
		"duration": 75,
		"createdAt": "2024-05-10T11:15:00Z",
		"provider": {
		"id": "5",
		"names": "Carolina",
		"surnames": "Díaz",
		"email": "carolina.diaz@lashes.com",
		"phone": "299887766"
		},
		"rating": 4.9,
		"price": 55.0,
		"category": {
		"id": "5",
		"name": "Pestañas"
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
		"id": "7",
		"name": "Tratamiento capilar",
		"description": "Repara, hidrata y devuelve el brillo natural a tu cabello con productos profesionales.",
		"photo": "https://d30gl8nkrjm6kp.cloudfront.net/wp/2022/02/16/vanitasespai-1024x1024.jpeg",
		"status": "active",
		"duration": 45,
		"createdAt": "2024-07-14T15:00:00Z",
		"provider": {
		"id": "7",
		"names": "Romina",
		"surnames": "Vega",
		"email": "romina.vega@haircare.com",
		"phone": "3416662233"
		},
		"rating": 4.8,
		"price": 28.0,
		"category": {
		"id": "1",
		"name": "Peluquería"
		}
	},
	{
		"id": "8",
		"name": "Depilación con cera",
		"description": "Servicio de depilación profesional con cera tibia para una piel suave y cuidada.",
		"photo": "https://www.lanacion.com.py/resizer/v2/https%3A%2F%2Fcloudfront-us-east-1.images.arcpublishing.com%2Flanacionpy%2F2DI67EAXYBBNPNDOQECT6ZRXQU.jpg?auth=774d2d811b0bd254c75db778e9c8602f82e3d4188bc6a91db763581771c08239&width=1280&smart=true",
		"status": "active",
		"duration": 30,
		"createdAt": "2024-08-03T10:30:00Z",
		"provider": {
		"id": "8",
		"names": "Camila",
		"surnames": "Santos",
		"email": "camila.santos@bodycare.com",
		"phone": "299445667"
		},
		"rating": 4.6,
		"price": 20.0,
		"category": {
		"id": "7",
		"name": "Depilación"
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
