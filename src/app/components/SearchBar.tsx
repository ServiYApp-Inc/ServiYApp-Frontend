"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import IService from "../interfaces/IService";

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
		"phone": "123456789",
		"region": {
			"id": "10",
			"name": "Buenos Aires"
			},
		"city": {
			"id": "100",
			"name": "La Plata"
			}
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
		"phone": "298765432",
		"region": {
			"id": "10",
			"name": "Buenos Aires"
			},
		"city": {
			"id": "100",
			"name": "La Plata"
			}
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
		"phone": "341123987",
		"region": {
			"id": "10",
			"name": "Buenos Aires"
			},
		"city": {
			"id": "100",
			"name": "La Plata"
			}
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
		"phone": "3415550101",
		"region": {
			"id": "11",
			"name": "Santa Fe"
			},
		"city": {
			"id": "101",
			"name": "Rosario"
			}
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
		"phone": "299887766",
		"region": {
			"id": "11",
			"name": "Santa Fe"
			},
		"city": {
			"id": "101",
			"name": "Rosario"
			}
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
		"phone": "123456789",
		"region": {
			"id": "11",
			"name": "Santa Fe"
			},
		"city": {
			"id": "102",
			"name": "Santa Fe"
			}
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
		"phone": "3416662233",
			"region": {
			"id": "11",
			"name": "Santa Fe"
			},
		"city": {
			"id": "103",
			"name": "Perez"
			}
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
		"phone": "299445667",
		"region": {
			"id": "12",
			"name": "Córdoba"
			},
		"city": {
			"id": "110",
			"name": "Cordoba"
			}
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
		"phone": "123456789",
		"region": {
			"id": "12",
			"name": "Córdoba"
			},
		"city": {
			"id": "110",
			"name": "Cordoba"
			}
		},
		"rating": 4.9,
		"price": 48.0,
		"category": {
		"id": "8",
		"name": "Spa"
		}
	}
]

export default function SearchBar() {
	// Estados locales
	const [service, setService] = useState("");
	const [region, setRegion] = useState("");
	const [city, setCity] = useState("");
	const [category, setCategory] = useState("");

	const [cities, setCities] = useState<string[]>([]); // cambia según provincia seleccionada

	// useEffect: actualiza ciudades según la provincia
	useEffect(() => {
		if (region === "buenos aires") {
			setCities(["La Plata", "Mar del Plata"]);
		} else if (region === "cordoba") {
			setCities(["Córdoba", "Villa Carlos Paz"]);
		} else if (region === "santa fe") {
			setCities(["Rosario", "Santa Fe", "Perez"]);
		} else {
			setCities([]);
		}
	}, [region]);

	// Simulación de búsqueda
	const handleSearch = () => {
	let results = services;

	// Filtra según provincia
	if (region) {
		results = results.filter(
		(serviceItem) =>
			serviceItem.provider.region?.name.toLowerCase() ===
			region.toLowerCase()
		);
	}

	// Filtra según ciudad
	if (city) {
		results = results.filter(
		(serviceItem) => serviceItem.provider.city?.name.toLowerCase() === city.toLowerCase()
		);
	}

	// Filtra según categoría
	if (category) {
		results = results.filter(
		(serviceItem) =>
			serviceItem.category.name.toLowerCase() === category.toLowerCase()
		);
	}

	// Filtra por texto (nombre del servicio)
	if (service.trim()) {
		results = results.filter((serviceItem) =>
		serviceItem.name.toLowerCase().includes(service.toLowerCase())
		);
	}

	console.log("Resultados encontrados:", results);
	console.log({ service, category, city, region });
	
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				handleSearch();
			}}
			className="
            flex flex-col lg:flex-row 
            justify-around items-center 
            gap-4 bg-white px-4 py-2
            rounded-3xl mt-8 ml-4 max-w-[90%] min-w-[90%] sm:max-w-[98%]
        "
		>
			{/* Provincia */}
			<div className="flex flex-col text-black px-3 w-full lg:w-auto">
				<label className="text-sm font-medium">
					Provincia o Estado
				</label>
				<select
					value={region}
					onChange={(e) => setRegion(e.target.value)}
					className="text-black/70 text-sm focus:outline-none border-b border-black/10 lg:border-none"
				>
					<option value="">Selecciona una provincia</option>
					<option value="buenos aires">Buenos Aires</option>
					<option value="cordoba">Córdoba</option>
					<option value="santa fe">Santa Fe</option>
				</select>
			</div>


			{/* Ciudad */}
			<div className="flex flex-col text-black px-3 w-full lg:w-auto lg:border-l md:border-black/10">
				<label className="text-sm font-medium">Ciudad</label>
				<select
					value={city}
					onChange={(e) => setCity(e.target.value)}
					className="text-black/70 text-sm focus:outline-none border-b border-black/10 lg:border-none"
				>
					<option value="">Selecciona una ciudad</option>
					{cities.map((c, i) => (
						<option key={i} value={c}>
							{c}
						</option>
					))}
				</select>
			</div>

			{/* Categorias */}
			<div className="flex flex-col text-black px-3 w-full lg:w-auto lg:border-l md:border-black/10">
				<label className="text-sm font-medium">Categoría</label>
				<select
					value={category}
					onChange={(e) => setCategory(e.target.value)}
					className="text-black/70 text-sm focus:outline-none border-b border-black/10 lg:border-none"
				>
					<option value="">Selecciona una categoría</option>
					<option value="peluquería">Peluquería</option>
					<option value="spa">Spa</option>
					<option value="manicura">Manicura</option>
					<option value="maquillaje">Maquillaje</option>
					<option value="pestañas">Pestañas</option>
					<option value="limpieza facial">Limpieza Facial</option> 
				</select>
			</div>

			{/* Servicio */}
			<div className="flex flex-col text-black px-3 w-full lg:w-auto lg:border-l md:border-black/10">
				<label className="text-sm font-medium">Servicio</label>
				<input
					type="text"
					value={service}
					onChange={(e) => setService(e.target.value)}
					placeholder="Escribe el servicio"
					className="text-black/70 text-sm focus:outline-none placeholder:text-black/40 border-b border-black/10 lg:border-none"
				/>
			</div>



			{/* Botón buscar */}
			<button
				type="submit"
				className="bg-[var(--color-primary)] rounded-full p-2 hover:bg-[var(--color-primary-hover)] flex items-center justify-center text-white text-lg mt-2 md:mt-0"
			>
				<FontAwesomeIcon icon={faSearch} />
			</button>
		</form>
	);
}
