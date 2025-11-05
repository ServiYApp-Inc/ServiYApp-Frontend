"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";

// Simulación: lista de categorías traídas del backend
const getCategories = async () => {
    return [
        { id: "1", name: "Peluquería" },
        { id: "2", name: "Spa" },
        { id: "3", name: "Masajes" },
    ];
};

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
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
    getCategories().then(setCategories);
    }, []);

    const handleSubmit = async (values: any, { resetForm }: any) => {
    const providerId = "id-del-usuario-logueado"; // lo tomás del store o auth context
    const serviceData = {
        ...values,
        provider: providerId,
        status: "ACTIVE",
    };

    console.log("Datos a enviar:", serviceData);
    // Aquí harías la llamada al backend: await createService(serviceData);
    resetForm();
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-gray-800 rounded-2xl shadow-lg text-white">
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
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600"
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
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600"
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
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600"
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
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600"
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
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600"
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
