// Necesitaria ya hacer el fetch al servicio por id para traer los datos específicos

import Link from "next/link";

import { FontAwesomeIcon,  } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faStar } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { notFound } from "next/navigation";



export default async function ServiceDetailPage({ params }: { params: { id: string } }) {

    const { id } = await params;
    let service;
    try {
        const fetchedData = await axios.get(`http://localhost:3000/services/find/${id}`)
        service = fetchedData.data;

        if (!service) {
            notFound();
        }
    } catch (error) {
        console.error("Error fetching service data:", error);
        notFound();
    }

    return (
        <main className="flex flex-col max-w-4xl mx-auto mt-8">
            <h1 className="text-[40px] font-bold text-gray-800 mb-6">Detalle del Servicio</h1>
            <Link href={"/services"} className="max-w-[160px] w-auto bg-[var(--foreground)] text-white p-1 my-1 rounded-lg hover:bg-[var(--color-accent)] hover:text-[var(--foreground)] border transition">  
                <FontAwesomeIcon icon={faArrowLeft}   className="text-sm md:text-base" style={{ width: "1rem", height: "1rem" }} /> Volver a Servicios
            </Link>
            <div className="flex flex-col lg:flex-row gap-2 bg-white p-4 rounded-2xl shadow-lg">
                <div>
                <img
                    src={service.photo}
                    alt={service.name}
                    className="w-[500px] h-[350px] object-cover rounded-2xl shadow-lg mb-6"
                />
                </div>
                <div className="flex flex-col items-start h-full">
                    <div className="flex justify-between items-center gap-2 mb-2 text-[var(--color-primary)]">
                        <h2 className="text-4xl font-bold text-[var(--color-primary)]">{service.name}</h2>
                        <span className="flex justify-center items-center font-bold bg-gray-200 px-2 py-1 rounded-lg">
                            {service.rating}
                            <FontAwesomeIcon
                            icon={faStar}
                            className="ml-1 text-sm md:text-base"
                            style={{ width: "1rem", height: "1rem" }}
                            />
                        </span>
                    </div>
                    <p className="text-lg text-black max-w-[600px] mb-4">
                        {service.description}
                    </p>

                    <span className="text-md text-gray-400 mb-2">
                        <strong>Duración:</strong> {service.duration}
                    </span>

                    <span className="text-md text-gray-400 mb-2">
                        <strong>Proveedor:</strong> {service.provider}
                    </span>

                    <span className="text-md text-gray-400 mb-4">
                        <strong>Categoría:</strong> {service.category}
                    </span>

                    <p className="text-2xl font-bold text-[var(--color-primary)]">
                        ${service.price} mxn
                    </p>
                    <button className="self-center max-w-[180px] w-auto bg-[var(--foreground)] text-white px-2 py-1 mt-5 rounded-lg hover:bg-[var(--color-accent)] hover:text-[var(--foreground)] border transition" >Deseo este Servicio</button>
                </div>
            </div>
        </main>
    );
}