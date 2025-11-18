"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createCategory } from "../../../../provider/serviceRegister/service.service";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const categorySchema = Yup.object().shape({
    name: Yup.string()
        .required("El nombre es obligatorio")
        .min(3, "Mínimo 3 caracteres"),
    description: Yup.string()
        .optional(),
});

export default function CategoriesRegisterPage () {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    return (
        <main className="flex flex-col items-center">
			<div className="max-w-lg w-full mx-auto p-6 bg-white rounded-2xl shadow-lg text-[var(--color-primary)]">

            <h1 className="text-2xl font-bold mb-4">Registrar Categoría</h1>

            <Formik
                initialValues={{ name: "", description: "" }}
                validationSchema={categorySchema}
                onSubmit={async (values, { resetForm }) => {
                    try {
                        setLoading(true);
                        await createCategory(values);
                        
                        await Swal.fire({
                            icon: "success",
                            title: "Categoría creada con exito",
                        });
                        resetForm();
                        router.push("/provider/categories"); // si querés redireccionar
                    } catch (error: any) {
                        console.error(error);
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "No se pudo crear la categoría",
                        });
                    } finally {
                        setLoading(false);
                    }
                }}
                >
                <Form className="flex flex-col gap-4">

                    {/* Nombre */}
                    <div>
                        <label className="font-semibold block">Nombre</label>
                        <Field
                            name="name"
                            className="w-full border p-2 rounded"
                            placeholder="Ej: Peluquería"
                            />
                        <ErrorMessage
                            name="name"
                            component="div"
                            className="text-red-500 text-sm"
                            />
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="font-semibold block">Descripción</label>
                        <Field
                            as="textarea"
                            name="description"
                            className="w-full border p-2 rounded"
                            placeholder="Ej: Servicios de peluquería, barbería..."
                        />
                    </div>

                    {/* Botón */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[var(--color-primary)] text-white py-2 px-4 rounded hover:scale-102 transition"
                        >
                        {loading ? "Guardando..." : "Crear Categoría"}
                    </button>
                </Form>
            </Formik>
            </div>
            <button
				onClick={() => router.back()}
				className="max-w-[200px] py-1 px-2 text-white bg-[var(--color-primary)] rounded-xl mt-5 hover:scale-105 transition"
                >
				<FontAwesomeIcon
					icon={faArrowLeft}
					className="mr-2"
                    />
				Volver a Servicios
			</button>
        </main>
    );
}
