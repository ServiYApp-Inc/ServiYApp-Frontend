"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  providerId?: string;
  addressId?: string;
}

export default function ConfirmationPage() {
  const [services, setServices] = useState<Service[]>([]);
  const router = useRouter();

  // 🔹 Traemos los datos del carrito desde localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setServices(JSON.parse(storedCart));
    }
  }, []);

  // 🔹 Creamos las órdenes en el backend
  const handleConfirm = async () => {
    try {
      for (const service of services) {
        const response = await fetch("http://localhost:3000/service-orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            providerId: service.providerId || "238b37ba-283c-4439-bad1-472c5c8c24a0",
            userId: "5a4d2441-7638-42a9-80b8-1db7d470919a",
            serviceId: service.id,
            addressId: service.addressId || "1d1c18c5-d7b9-429c-8fc8-6d6db257d389",
          }),
        });

        if (!response.ok) {
          throw new Error("Error al crear la orden de servicio");
        }
      }

     
      localStorage.removeItem("cart");

      
      router.push("/confirmation/success");
    } catch (error) {
      console.error("Error al confirmar servicios:", error);
      alert("Ocurrió un error al confirmar los servicios. Intenta nuevamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0000] to-[#330000] text-white font-[Nunito] flex flex-col items-center px-6 py-10">
      <div className="max-w-3xl w-full bg-[#220000]/70 p-8 rounded-2xl shadow-2xl backdrop-blur-md border border-[#ff4d4d]/40">
        <div className="flex items-center justify-center mb-6">
          <CheckCircle className="text-[#ff4d4d]" size={40} />
          <h1 className="text-3xl font-bold ml-3">Confirmar Reserva</h1>
        </div>

        {services.length > 0 ? (
          <>
            <p className="text-center mb-8 text-gray-300">
              Estás por confirmar los siguientes servicios:
            </p>

            <div className="space-y-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center bg-[#2a0000]/80 p-4 rounded-xl shadow-md hover:shadow-[#ff4d4d]/30 transition-all duration-300"
                >
                  {service.image && (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-24 h-24 object-cover rounded-lg border border-[#ff4d4d]/30 mr-4"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-[#ffcccc]">
                      {service.name}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">{service.description}</p>
                    <p className="text-[#ff4d4d] font-bold mt-2">
                      ${service.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-10">
              <button
                onClick={handleConfirm}
                className="bg-[#ff4d4d] hover:bg-[#ff6666] text-white font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-300 hover:scale-105"
              >
                Confirmar Reserva
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-300">
            <p>No hay servicios para confirmar 😅</p>
            <button
              onClick={() => router.push("/user/services")}
              className="mt-4 underline text-[#ff4d4d] hover:text-[#ff6666]"
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
