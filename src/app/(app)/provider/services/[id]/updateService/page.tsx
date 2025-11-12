"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { getCategories } from "@/app/services/provider.service";
import { useAuthStore } from "@/app/store/auth.store";
import { getOneService, updateService } from "../../../serviceRegister/service.service";
import { notFound, useParams, useRouter } from "next/navigation";
import IService from "@/app/interfaces/IService";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

// Esquema de validación con Yup
const ServiceSchema = Yup.object().shape({
    name: Yup.string()
        .required("El nombre es obligatorio")
        .min(3, "Debe tener al menos 3 caracteres"),
    description: Yup.string()
        .required("La descripción es obligatoria")
        .min(10, "Debe tener al menos 10 caracteres"),
    price: Yup.string()
        .required("El precio es obligatorio"),
    photo: Yup.string().url("Debe ser una URL válida").required("La foto es obligatoria"),
    duration: Yup.number()
        .required("La duración es obligatoria")
        .positive("Debe ser un número positivo"),
    category: Yup.string().required("La categoría es obligatoria"),
});

export default function ServiceUpdateForm() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [service, setService] = useState<IService | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data); // ← guardamos las categorías
                console.log(data);
            } catch (error) {
                console.error("Error al obtener categorías:", error);
            }
        };
        fetchCategories();
    }, []);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchService = async () => {
            try {
                const data  = await getOneService(id as string);
                setService(data);
            } catch (error) {
                console.error("Error al cargar el servicio:", error);
                notFound();
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
                Cargando servicio...
            </div>
        );

    if (!service) return notFound();

    const handleSubmit = async (values: any, { resetForm }: any) => {
        if (!user) {
            console.error("Usuario no autenticado");
            return;
        }

        const serviceData = {
            name: values.name,
            description: values.description,
            price: Number(values.price),
            photo: values.photo,
            duration: Number(values.duration),
            category: values.category, // 👈 importante: el backend espera categoryId
            status: "active", // o el estado que corresponda
        };

        try {
            if (user.role !== "provider" && user.role !== "admin") {
                alert("Solo los proveedores o administradores pueden modificar servicios");
                return;
            }

            Swal.fire({
                title: "¿Estas Seguro?",
                text: "Si aceptas, se modificara el servicio",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#1d2846",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sí, Modificar."
                }).then((result) => {
                if (result.isConfirmed) {
                    console.log("Datos enviados:", serviceData);
                    const updatedService = updateService(id as string, serviceData);
                    console.log("✅ Servicio actualizado:", updatedService);
                    router.back();
                    Swal.fire({
                    title: "Servicio Modificado",
                    text: "Su servicio fue modificado con EXITO",
                    icon: "success"
                    });
                }
            });
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message;
            console.error("❌ Error al actualizar servicio:", msg);
            alert(`Error: ${msg}`);
        }
    };



    return (
        <div className="flex flex-col items-center">
        <div className="max-w-lg min-w-sm sm:min-w-md lg:min-w-lg mx-auto p-6 bg-white rounded-2xl shadow-lg text-[var(--color-primary)]">
        <h2 className="text-2xl font-semibold mb-4 text-center">
            Registrar nuevo servicio
        </h2>

        <Formik
        enableReinitialize
        initialValues={{
            name: service.name || "",
            description: service.description || "",
            price: service.price?.toString() || "",
            photo: service.photo || "",
            duration: service.duration?.toString() || "",
            category: service.category.id || "",
        }}
        validationSchema={ServiceSchema}
        onSubmit={handleSubmit}
        >
            {({ isSubmitting }) => (
            <Form className="space-y-4">
                {/* Nombre */}
                <div>
                <label htmlFor="name" className="block mb-1 font-medium">
                    Nombre del servicio
                </label>
                <Field
                    name="name"
                    className="w-full p-2 rounded bg-white border border-gray-600"
                    placeholder="Ej: Corte de cabello"
                />
                <ErrorMessage
                    name="name"
                    component="p"
                    className="text-red-400 text-sm mt-1"
                />
                </div>

                {/* Descripción */}
                <div>
                <label htmlFor="description" className="block mb-1 font-medium">
                    Descripción
                </label>
                <Field
                    as="textarea"
                    name="description"
                    className="w-full p-2 rounded bg-white border border-gray-600"
                    placeholder="Describe brevemente el servicio..."
                />
                <ErrorMessage
                    name="description"
                    component="p"
                    className="text-red-400 text-sm mt-1"
                />
                </div>

                {/* Precio */}
                <div>
                <label htmlFor="price" className="block mb-1 font-medium">
                    Precio
                </label>
                <Field
                    type="number"
                    name="price"
                    className="w-full p-2 rounded bg-white border border-gray-600"
                    placeholder="Ej: 30"
                />
                <ErrorMessage
                    name="price"
                    component="p"
                    className="text-red-400 text-sm mt-1"
                />
                </div>

                {/* Foto */}
                <div>
                <label htmlFor="photo" className="block mb-1 font-medium">
                    URL de la foto
                </label>
                <Field
                    name="photo"
                    className="w-full p-2 rounded bg-white border border-gray-600"
                    placeholder="https://ejemplo.com/foto.jpg"
                />
                <ErrorMessage
                    name="photo"
                    component="p"
                    className="text-red-400 text-sm mt-1"
                />
                </div>

                {/* Duración */}
                <div>
                <label htmlFor="duration" className="block mb-1 font-medium">
                    Duración (en minutos)
                </label>
                <Field
                    type="number"
                    name="duration"
                    className="w-full p-2 rounded bg-white border border-gray-600"
                    placeholder="Ej: 30"
                />
                <ErrorMessage
                    name="duration"
                    component="p"
                    className="text-red-400 text-sm mt-1"
                />
                </div>

                {/* Categoría */}
                <div>
                <label htmlFor="category" className="block mb-1 font-medium">
                    Categoría
                </label>
                <Field
                    as="select"
                    name="category"
                    className="w-full p-2 rounded bg-white border border-gray-600"
                >
                    <option value="">Seleccionar...</option>
                    {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                        {cat.name}
                    </option>
                    ))}
                </Field>
                <ErrorMessage
                    name="category"
                    component="p"
                    className="text-red-400 text-sm mt-1"
                />
                </div>

                {/* Botón */}
                <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium mt-4"
                >
                {isSubmitting ? "Modificando..." : "Modificar servicio"}
                </button>
            </Form>
            )}
        </Formik>
        </div>
            <button onClick={() => router.back()} className="max-w-[200px] py-1 px-2 text-white bg-[var(--color-primary)] rounded-xl mt-5 hover:scale-105 transition">
                <FontAwesomeIcon
                    icon={faArrowLeft}
                    className="text-sm md:text-base mr-1"
                    style={{ width: "1rem", height: "1rem" }}
                />
                Volver a Servicios</button>
        </div>
    );
    }
