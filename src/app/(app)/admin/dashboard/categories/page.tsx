"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/app/services/provider.service";
import Link from "next/link";
import { ICategory } from "@/app/interfaces/ICategory";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";


export default function CategoriesPage() {
    const router = useRouter();

    const [category, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error("Error al obtener categorías:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen text-[var(--color-primary)] text-xl font-bold">
                Cargando categorías...
            </div>
        );

    const handleUpdate = () => {

    }

    const handleDelete = async () => {
        try {
            const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Si aceptas, se eliminará la categoría para siempre",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1d2846",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
            });

            if (result.isConfirmed) {
                // Endpoint Delete Category
            await Swal.fire({
                title: "Categoría eliminada",
                text: res.message || "La categoría fue eliminado con éxito.",
                icon: "success",
            });

            }
        } catch (error) {
            console.error("Error al eliminar categoría:", error);
            Swal.fire({
            title: "Error",
            text: "No se pudo eliminar la categoría. Verifica tu rol o inténtalo nuevamente.",
            icon: "error",
            });
        }
        };

    return (
        <main className="flex flex-col justify-start bg--background overflow-x-hidden overflow-y-hidden min-h-screen px-2 pb-20 md:pb-4 max-w-[1300px] mx-auto">
            <h1 className="font-bold text-[var(--color-primary)] text-[48px] mt-10 text-center md:text-left">
                Categorías
            </h1>

            <div className="w-full bg-[var(--color-primary)] rounded-2xl py-4 mt-6 flex flex-col items-start">
                <h4 className="mx-4 text-white text-[36px] font-semiBold">
                    Administrá las categorías
                </h4>
                <span className="mx-4 text-[20px] font-medium text-white">
                    En su detalle podés: Dar de Baja o Eliminar una Categoría
                </span>
            </div>

            <Link href={"/admin/dashboard/categories/register"}>
                <button className="bg-[var(--color-primary)] text-white mt-5 px-5 py-2 rounded-lg font-medium hover:opacity-90">
                    Registrar una <strong>Nueva Categoría</strong>
                </button>
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-4 mt-4">
                {category.map((c) => (
                    <div key={c.id} className="flex flex-col text-center bg-white p-2 rounded-xl shadow">
                        <span className="text-[var(--color-primary)] font-bold text-lg border-b border-[var(--color-primary)]">{c.name}</span>
                        <span className="text-gray-500 ">{c.description}</span>
                        <div className="flex flex-row justify-around my-2">
                        <button onClick={handleUpdate} className="text-white py-1 px-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg">Modificar</button>
                        <button onClick={handleDelete} className="text-white py-1 px-2 bg-red-800 hover:bg-red-700 rounded-lg">Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
            <button
				onClick={() => router.back()}
				className="max-w-[200px] py-1 px-2 text-white bg-[var(--color-primary)] rounded-lg mt-5 hover:scale-105 transition"
                >
				<FontAwesomeIcon
					icon={faArrowLeft}
					className="mr-2"
                    />
				Volver a Dashborad
			</button>
        </main>
    );
}
