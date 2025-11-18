"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/app/services/provider.service";
import Link from "next/link";
import { ICategory } from "@/app/interfaces/ICategory";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCancel, faPenToSquare, faSave, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { deleteCategory, updateCategory } from "@/app/(app)/provider/serviceRegister/service.service";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { motion } from "framer-motion";


import * as Yup from "yup";

const categorySchema = Yup.object().shape({
    name: Yup.string()
        .required("El nombre es obligatorio")
        .min(3, "Debe tener al menos 3 caracteres"),
    description: Yup.string()
        .max(200, "Máximo 200 caracteres")
});


export default function CategoriesPage() {
    const router = useRouter();

    const [category, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);


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

    const handleUpdate = (category: ICategory) => {
        setSelectedCategory(category);
        setShowModal(true);
    };


    const handleDelete = async (id: string) => {
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

                await deleteCategory(id);  // <-- ACÁ LE PEGAMOS AL ENDPOINT

                await Swal.fire({
                    title: "Categoría eliminada",
                    icon: "success",
                });

                fetchCategories(); // refresca la lista
            }

        } catch (error) {
            console.error("Error al eliminar categoría:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo eliminar la categoría.",
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
                    <div key={c.id} className="flex flex-col justify-around text-center bg-white p-2 rounded-xl shadow">
                        <span className="text-[var(--color-primary)] font-bold text-lg border-b border-[var(--color-primary)]">{c.name}</span>
                        <span className="text-gray-500 ">{c.description}</span>
                        <div className="flex flex-row justify-around my-2">
                        <button onClick={() => handleUpdate(c)} className="text-white py-1 px-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg">
                            <FontAwesomeIcon icon={faPenToSquare} className="mr-1"></FontAwesomeIcon>
                            Modificar
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="text-white py-1 px-2 bg-red-800 hover:bg-red-700 rounded-lg">
                            <FontAwesomeIcon icon={faXmarkCircle} className="mr-1"></FontAwesomeIcon>
                            Eliminar
                        </button>
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

            {/* MODAL */}
            {showModal && selectedCategory && (
            <motion.div
                className="fixed inset-0 backdrop-blur-md bg-black/40 flex justify-center items-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
            >
                <motion.div
                    className="bg-white w-[90%] max-w-md p-6 rounded-2xl shadow-xl"
                    initial={{ scale: 0.8, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 30 }}
                    transition={{ type: "spring", stiffness: 130, damping: 12 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-2xl font-bold mb-4 text-[var(--color-primary)]">
                        Modificar Categoría
                    </h2>

                    <Formik
                        initialValues={{
                            name: selectedCategory.name,
                            description: selectedCategory.description || "",
                        }}
                        validationSchema={categorySchema}
                        enableReinitialize={true}
                        onSubmit={async (values, { setSubmitting }) => {
                            try {
                                await updateCategory(selectedCategory.id, values);

                                await Swal.fire({
                                    icon: "success",
                                    title: "Categoría actualizada",
                                });

                                setShowModal(false);
                                fetchCategories(); // refresca la lista
                            } catch (error) {
                                console.error(error);
                                Swal.fire({
                                    icon: "error",
                                    title: "Error",
                                    text: "No se pudo actualizar la categoría",
                                });
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form className="flex flex-col gap-3">

                                {/* INPUT: Nombre */}
                                <div>
                                    <label className="font-semibold">Nombre</label>
                                    <Field
                                        name="name"
                                        className="w-full border p-2 rounded mt-1"
                                    />
                                    <ErrorMessage
                                        name="name"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>

                                {/* INPUT: Descripción */}
                                <div>
                                    <label className="font-semibold">Descripción</label>
                                    <Field
                                        as="textarea"
                                        name="description"
                                        className="w-full border p-2 rounded mt-1"
                                        rows={3}
                                    />
                                    <ErrorMessage
                                        name="description"
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                    />
                                </div>

                                {/* BOTONES */}
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
                                        onClick={() => setShowModal(false)}
                                    >
                                        <FontAwesomeIcon icon={faCancel} className="mr-1"></FontAwesomeIcon>
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-[var(--color-primary)] text-white px-4 py-2 rounded hover:bg-[var(--color-primary-hover)] transition disabled:opacity-60"
                                    >
                                        <FontAwesomeIcon icon={faSave} className="mr-1"></FontAwesomeIcon>
                                        Guardar
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </motion.div>
            </motion.div>
        )}

        </main>
    );
}
