"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import {
	getCategories,
	getCitiesByRegion,
	getRegionsByCountry,
} from "../services/provider.service";
import { useAuthStore } from "../store/auth.store";
import { getFilteredServices } from "../(app)/user/services/service.service";

export default function SearchBar({ onResults }: { onResults?: (data: any[]) => void }) {
	const { user } = useAuthStore();

	// Estados locales
	const [service, setService] = useState("");
	const [region, setRegion] = useState("");
	const [city, setCity] = useState("");
	const [category, setCategory] = useState("");

	const [cities, setCities] = useState<{ id: string; name: string }[]>([]); // cambia según provincia seleccionada
	const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
	const [regionId, setRegionId] = useState("");
	const [categories, setCategories] = useState<
		{ id: string; name: string }[]
	>([]);

	const [loadingRegions, setLoadingRegions] = useState(false);
	const [loadingCities, setLoadingCities] = useState(false);

	useEffect(() => {
		const fetchRegions = async () => {
			if (!user?.country) return;

			try {
				SVGAnimateElement;
				setLoadingRegions(true);
				const data = await getRegionsByCountry(user.country.id); // ← ID del país
				// const data = await getRegionsByCountry("d25ca36e-7fd4-4a49-ae48-27f981d18b4b"); // ← ID del país
				console.log(data);
				setRegions(data);
			} catch (error) {
				console.error("Error al obtener regiones:", error);
			} finally {
				setLoadingRegions(false);
			}
		};

		fetchRegions();
	}, [user?.country?.id]);

	// useEffect: actualiza ciudades según la provincia
	useEffect(() => {
		const fetchCities = async () => {
			if (!regionId) {
				setCities([]);
				return;
			}

			try {
				setLoadingCities(true);
				const data = await getCitiesByRegion(regionId);
				setCities(data);
			} catch (error) {
				console.error("Error al obtener ciudades:", error);
			} finally {
				setLoadingCities(false);
			}
		};

		fetchCities();
	}, [regionId]);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const data = await getCategories();
				setCategories(data); // ← guardamos las categorías
			} catch (error) {
				console.error("Error al obtener categorías:", error);
			}
		};
		fetchCategories();
	}, []);

	const handleSearch = async () => {
		try {
		const filters = { region, city, category, service };
		const data = await getFilteredServices(filters);
		console.log("Servicios filtrados:", data);
		onResults?.(data); // ✅ enviamos los resultados al padre
		} catch (error) {
		console.error("Error al buscar servicios:", error);
		}
	};

	return ( 
		<form
			onSubmit={(e) => {
				e.preventDefault();
				handleSearch();
			}}
			className="flex flex-col lg:flex-row justify-around items-center gap-4 bg-white px-4 py-2 rounded-3xl mt-8 ml-4 max-w-[90%] min-w-[90%] sm:max-w-[98%]"
		>
			{/* Regiones */}
			<div className="flex flex-col text-black px-3 w-full lg:w-auto">
				<label className="text-sm font-medium">
					Provincia o Estado
				</label>
				<select
					value={regionId}
					onChange={(e) => {
						const selectedRegion = regions.find(
							(r) => r.id === e.target.value
						);
						setRegion(selectedRegion?.name || "");
						setRegionId(selectedRegion?.id || "");
					}}
					className="text-black/70 text-sm focus:outline-none border-b border-black/10 lg:border-none"
					>
					<option value="">Selecciona una provincia</option>
					{loadingCities ? (
						<option>Cargando...</option>
					) : regions?.length > 0 ? (
						regions.map((regionItem) => (
							<option key={regionItem.id} value={regionItem.id}>
								{regionItem.name}
							</option>
						))
					) : (
						<option disabled>No hay regiones disponibles</option>
					)}
				</select>

			</div>

			{/* Ciudades */}
			<div className="flex flex-col text-black px-3 w-full lg:w-auto lg:border-l md:border-black/10">
				<label className="text-sm font-medium">Ciudad</label>
				<select
					value={city}
					onChange={(e) => setCity(e.target.value)}
					className="text-black/70 text-sm focus:outline-none border-b border-black/10 lg:border-none"
					>
					<option value="">Selecciona una ciudad</option>
					{loadingCities ? (
						<option>Cargando...</option>
					) : (
						cities.map((c) => (
							<option key={c.id} value={c.name}>
								{c.name}
							</option>
						))
					)}
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
					{categories.map((cat) => (
						<option key={cat.id} value={cat.name}>
							{cat.name}
						</option>
					))}
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
