"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

export default function SearchBar() {
    // Estados locales
    const [service, setService] = useState("");
    const [province, setProvince] = useState("");
    const [city, setCity] = useState("");
    const [date, setDate] = useState("");

    const [cities, setCities] = useState<string[]>([]); // cambia según provincia seleccionada

    // useEffect: actualiza ciudades según la provincia
    useEffect(() => {
        if (province === "buenosaires") {
        setCities(["La Plata", "Mar del Plata", "Tigre"]);
        } else if (province === "cordoba") {
        setCities(["Córdoba Capital", "Villa Carlos Paz", "Alta Gracia"]);
        } else if (province === "santafe") {
        setCities(["Rosario", "Santa Fe Capital", "Rafaela"]);
        } else {
        setCities([]);
        }
    }, [province]);

    // Simulación de búsqueda
    const handleSearch = () => {
        console.log("Buscando servicio con los siguientes filtros:");
        console.log({ service, province, city, date });
        // Acá en el futuro hago fetch a la API con los filtros
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
        {/* Servicio */}
        <div className="flex flex-col text-black px-3 w-full lg:w-auto">
            <label className="text-sm font-medium">Servicio</label>
            <input
            type="text"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="Escribe el servicio"
            className="text-black/70 text-sm focus:outline-none placeholder:text-black/40 border-b border-black/10 lg:border-none"
            />
        </div>

        {/* Provincia */}
        <div className="flex flex-col text-black px-3 w-full lg:w-auto lg:border-l md:border-black/10">
            <label className="text-sm font-medium">Provincia o Estado</label>
            <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="text-black/70 text-sm focus:outline-none border-b border-black/10 lg:border-none"
            >
            <option value="">Selecciona una provincia</option>
            <option value="buenosaires">Buenos Aires</option>
            <option value="cordoba">Córdoba</option>
            <option value="santafe">Santa Fe</option>
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

        {/* Fecha */}
        <div className="flex flex-col text-black px-3 w-full lg:w-auto lg:border-l md:border-black/10">
            <label className="text-sm font-medium">Fecha</label>
            <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-black/70 text-sm focus:outline-none border-b border-black/10 lg:border-none"
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