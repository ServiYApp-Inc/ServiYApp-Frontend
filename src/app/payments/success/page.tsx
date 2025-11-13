"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCartStore } from "@/app/store/useCartStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function PaymentSuccessPage() {
    const params = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCartStore();

    const paymentId = params.get("payment_id");
    const status = params.get("status");
    const externalRef = params.get("external_reference");

    useEffect(() => {
        // Limpiar carrito si el pago fue aprobado
        if (status === "approved") {
            clearCart();
        }
    }, [status]);

    return (
        <div className="min-h-screen flex justify-center items-center px-4"
             style={{ backgroundColor: "var(--background)" }}>
            <div className="bg-white shadow-lg rounded-3xl p-10 max-w-md text-center">
                
                <FontAwesomeIcon 
                    icon={faCheckCircle} 
                    className="text-green-500 text-5xl mb-4" 
                />

                <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-4">
                    ¡Pago exitoso!
                </h1>

                <p className="text-gray-600 mb-6">
                    Gracias por tu compra. Tu pago fue aprobado correctamente.
                </p>

                <div className="text-left text-sm bg-gray-100 p-4 rounded-xl mb-6">
                    <p><strong>ID de pago:</strong> {paymentId}</p>
                    <p><strong>Estado:</strong> {status}</p>
                    <p><strong>Referencia:</strong> {externalRef}</p>
                </div>

                <button
                    onClick={() => router.push("/user/appointments")}
                    className="w-full bg-[var(--color-primary)] text-white py-3 rounded-2xl font-semibold hover:opacity-90 transition"
                >
                    Ver mis citas
                </button>
            </div>
        </div>
    );
}
