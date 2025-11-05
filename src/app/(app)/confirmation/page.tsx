"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCartStore } from "../../store/useCartStore";
import { useState, useEffect } from "react";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: string;
  providerName: string;
  address: string;
}

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCartStore();

  const [service, setService] = useState<Service | null>(null);

  useEffect(() => {
    const serviceData = {
      id: Number(searchParams.get("id")),
      name: searchParams.get("name") || "",
      description: searchParams.get("description") || "",
      price: Number(searchParams.get("price")),
      duration: searchParams.get("duration") || "",
      providerName: searchParams.get("providerName") || "No especificado",
      address: searchParams.get("address") || "No especificada",
    };
    setService(serviceData);
  }, [searchParams]);

  if (!service) {
    return <p className="text-center mt-10 text-gray-300">Cargando servicio...</p>;
  }

  const handleConfirm = () => {
    addToCart({
      id: service.id,
      name: service.name,
      price: service.price,
      quantity: 1,
    });

    router.push("/user/cart");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 px-4 font-nunito">
      <div className="max-w-lg w-full bg-gray-800 text-white p-8 rounded-2xl shadow-2xl border border-red-700/40">
        <h1 className="text-3xl font-bold mb-8 text-center text-red-500">
          Confirmación del Servicio
        </h1>

        <div className="space-y-3 text-gray-200">
          <p><strong>Servicio:</strong> {service.name}</p>
          <p><strong>Duración:</strong> {service.duration}</p>
          <p><strong>Precio:</strong> ${service.price}</p>
          <p><strong>Prestador:</strong> {service.providerName}</p>
          <p><strong>Dirección:</strong> {service.address}</p>
        </div>

        <div className="flex justify-between mt-10">
          <button
            onClick={() => router.back()}
            className="bg-gray-700 hover:bg-gray-800 px-5 py-2 rounded-lg font-medium transition-all duration-200"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md"
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
}
