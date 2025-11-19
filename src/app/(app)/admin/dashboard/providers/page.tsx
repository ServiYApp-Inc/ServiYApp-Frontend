"use client";

import { getProviders } from "@/app/(app)/provider/serviceRegister/service.service";
import IProvider from "@/app/interfaces/IProvider";
import { faXmarkCircle, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageAdminProviders() {

    const [providers, setProviders] = useState<IProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchProviders = async () => {
        try {
            setLoading(true);
            const data = await getProviders();
            setProviders(data);
        } catch (error) {
            console.error("Error al obtener providers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const filteredProviders = providers.filter((p) =>
        `${p.names} ${p.surnames}`.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen text-[var(--color-primary)] text-xl font-bold">
                Cargando proveedores...
            </div>
        );

    return (
        <main className="px-4 sm:px-6 md:px-10 py-6">

            {/* TITLE */}
            <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-4">
                Gestión de Proveedores
            </h1>

            {/* SEARCH BAR */}
            <div className="w-full bg-white shadow-md rounded-2xl p-4 flex items-center gap-3">
                <FontAwesomeIcon icon={faSearch} className="text-gray-500 text-lg" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent outline-none text-gray-700"
                />
            </div>

            {/* GRID DE PROVIDERS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5 mt-6">

                {filteredProviders.map((p) => (
                    <div
                        key={p.id}
                        className="flex flex-col justify-between bg-white p-4 rounded-xl shadow hover:shadow-lg transition-all duration-200 border border-gray-200"
                    >
                        <span className="text-[var(--color-primary)] font-bold text-lg border-b pb-1">
                            {p.names} {p.surnames}
                        </span>

                        <span className="text-gray-600 mt-1 text-sm">{p.email}</span>

                        <div className="flex justify-center mt-4">
                            <button
                                className="text-white bg-red-700 hover:bg-red-600 py-1 px-3 rounded-lg flex items-center gap-1 shadow-md transition-all"
                            >
                                <FontAwesomeIcon icon={faXmarkCircle} />
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}

                {filteredProviders.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 text-lg py-10">
                        No se encontraron proveedores.
                    </div>
                )}
            </div>
        </main>
    );
}
