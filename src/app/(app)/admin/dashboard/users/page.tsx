"use client";

import { getUsers, inactiveUser, activeUser } from "@/app/(app)/provider/serviceRegister/service.service";
import IUser from "@/app/interfaces/IUser";
import { faXmarkCircle, faSearch, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export default function PageAdminUsers() {

    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((u) =>
        `${u.names} ${u.surnames}`.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen text-[var(--color-primary)] text-xl font-bold">
                Cargando usuarios...
            </div>
        );

    const handleToggleStatus = async (id: string, status: string) => {

        const isActive = status === "active";

        const result = await Swal.fire({
            title: isActive ? "¿Deshabilitar usuario?" : "¿Habilitar usuario?",
            text: isActive
                ? "El usuario quedará desactivado y no podrá usar su cuenta."
                : "El usuario podrá usar su cuenta nuevamente.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: isActive ? "Sí, deshabilitar" : "Sí, habilitar",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            if (isActive) {
                await inactiveUser(id);
            } else {
                await activeUser(id);
            }

            Swal.fire({
                title: "Operación exitosa",
                text: isActive
                    ? "Usuario deshabilitado correctamente."
                    : "Usuario habilitado correctamente.",
                icon: "success",
                timer: 2000,
            });

            fetchUsers();
        } catch (error) {
            Swal.fire("Error", "No se pudo cambiar el estado del usuario.", "error");
        }
    };

    return (
        <main className="px-4 sm:px-6 md:px-10 py-6">

            {/* TITLE */}
            <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-4">
                Gestión de Usuarios
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

            {/* GRID DE USERS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5 mt-6">

                {filteredUsers.map((u) => (
                    <div
                        key={u.id}
                        className="flex flex-col justify-between bg-white p-4 rounded-xl shadow hover:shadow-lg transition-all duration-200 border border-gray-200"
                    >
                        <span className="text-[var(--color-primary)] font-bold text-lg border-b pb-1">
                            {u.names} {u.surnames}
                        </span>

                        <span className="text-gray-600 mt-1 text-sm overflow-hidden text-ellipsis whitespace-nowrap">{u.email}</span>

                        <div className="flex justify-center mt-4">
                            <button
                                onClick={() => handleToggleStatus(u.id, u.status ?? "active")}
                                className={`text-white py-1 px-3 rounded-lg flex items-center gap-1 shadow-md transition-all 
                                    ${(u.status ?? "active") === "active"
                                        ? "bg-red-700 hover:bg-red-600"
                                        : "bg-green-700 hover:bg-green-600"
                                    }`}
                            >
                                {(u.status ?? "active") === "active"
                                    ? <FontAwesomeIcon icon={faXmarkCircle} />
                                    : <FontAwesomeIcon icon={faCheckCircle} />}
                                {(u.status ?? "active") === "active" ? "Deshabilitar" : "Habilitar"}
                            </button>
                        </div>
                    </div>
                ))}

                {filteredUsers.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 text-lg py-10">
                        No se encontraron usuarios.
                    </div>
                )}
            </div>
        </main>
    );
}
