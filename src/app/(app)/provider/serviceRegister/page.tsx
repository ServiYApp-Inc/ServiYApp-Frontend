"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { getCategories } from "@/app/services/provider.service";
import { useAuthStore } from "@/app/store/auth.store";
import { createService } from "./service.service";

// Esquema de validación con Yup
const ServiceSchema = Yup.object().shape({
    name: Yup.string()
        .required("El nombre es obligatorio")
        .min(3, "Debe tener al menos 3 caracteres"),
    description: Yup.string()
        .required("La descripción es obligatoria")
        .min(10, "Debe tener al menos 10 caracteres"),
    photo: Yup.string().url("Debe ser una URL válida").required("La foto es obligatoria"),
    duration: Yup.number()
        .required("La duración es obligatoria")
        .positive("Debe ser un número positivo"),
    category: Yup.string().required("La categoría es obligatoria"),
});

export default function ServiceForm() {

    const { user } = useAuthStore();
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

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

    const handleSubmit = async (values: any, { resetForm }: any) => {
        if (!user) {
            console.error("Usuario no autenticado");
            return;
        }

        // Armamos el payload
        const serviceData: any = {
            name: values.name,
            description: values.description,
            photo: values.photo,
            duration: Number(values.duration),
            categoryId: values.category,
        };

        // Si el usuario tiene rol de provider, agregamos el ID
        if (user.role === "provider" && user.id) {
            serviceData.providerId = user.id;
        }

        try {
            if (user.role !== "provider" && user.role !== "admin") {
            alert("Solo los proveedores o administradores pueden registrar servicios");
            return;
            }

            console.log("📦 Datos que se envían al backend:", serviceData);

            const createdService = await createService(serviceData);

            console.log("✅ Servicio creado:", createdService);
            alert("Servicio registrado exitosamente");
            resetForm();
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message;
            console.error("❌ Error al crear servicio:", msg);
            alert(`Error: ${msg}`);
        }
    };



    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-lg text-[var(--color-primary)]">
        <h2 className="text-2xl font-semibold mb-4 text-center">
            Registrar nuevo servicio
        </h2>

        <Formik
            initialValues={{
            name: "",
            description: "",
            photo: "",
            duration: "",
            category: "",
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
                {isSubmitting ? "Enviando..." : "Registrar servicio"}
                </button>
            </Form>
            )}
        </Formik>
        </div>
    );
    }
