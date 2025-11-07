"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faStar, faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { notFound } from "next/navigation";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Api } from "@/app/services/api";
import { useAuthStore } from "@/app/store/auth.store";
import IService from "@/app/interfaces/IService";

export default function ServiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useAuthStore();
  const [service, setService] = useState<IService | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchService = async () => {
      try {
        const { data } = await Api.get(`/services/find/${id}`);
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
      <div className="flex justify-center items-center h-screen text-gray-500">
        Cargando servicio...
      </div>
    );

  if (!service) return notFound();

  const handleAddToCart = () => {
    addToCart({
      id: service.id,
      name: service.name,
      price: service.price,
      quantity: 1,
      image: service.photo,
    });
    router.push("/confirmation");
  };

  return (
    <main className="flex flex-col max-w-4xl mx-auto mt-8">
      <h1 className="text-[40px] font-bold text-gray-800 mb-6">
        Detalle del Servicio
      </h1>

      <Link
        href="/user/services"
        className="max-w-[160px] w-auto bg-[var(--foreground)] text-white p-1 my-1 rounded-lg hover:bg-[var(--color-accent)] hover:text-[var(--foreground)] border transition"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="text-sm md:text-base" />{" "}
        Volver a Servicios
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
            <h2 className="text-4xl font-bold text-[var(--color-primary)]">
              {service.name}
            </h2>
            <span className="flex justify-center items-center font-bold bg-gray-200 px-2 py-1 rounded-lg">
              {service.rating?.toFixed(1)}
              <FontAwesomeIcon
                icon={faStar}
                className="ml-1 text-sm md:text-base"
              />
            </span>
          </div>

          <p className="text-lg text-black max-w-[600px] mb-4">
            {service.description}
          </p>

          <span className="text-md text-gray-400 mb-2">
            <strong>Duración:</strong> {service.duration} min
          </span>

          <span className="text-md text-gray-400 mb-2">
            <strong>Proveedor:</strong>{" "}
            {service.provider?.names} {service.provider?.surnames}
          </span>

          <span className="text-md text-gray-400 mb-4">
            <strong>Categoría:</strong> {service.category?.name}
          </span>

          <p className="text-2xl font-bold text-[var(--color-primary)]">
            ${service.price} MXN
          </p>

          {/* 🛒 Botón de agregar al carrito */}
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-2 bg-[var(--foreground)] text-white px-4 py-2 mt-5 rounded-lg hover:bg-[var(--color-accent)] hover:text-[var(--foreground)] transition"
          >
            <FontAwesomeIcon icon={faCartPlus} />
            Agregar al carrito
          </button>
        </div>
      </div>
    </main>
  );
}
