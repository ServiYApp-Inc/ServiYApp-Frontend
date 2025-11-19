"use client";

import { useState } from "react";
import { createProviderReview } from "../services/provider.service";
import { useAuthStore } from "@/app/store/auth.store";
import { IServiceOrder } from "../interfaces/IServiceOrder";

interface ReviewModalProps {
    order: IServiceOrder; // o IServiceOrder si la tenés
    onClose: () => void;
    onSuccess: () => void;
    }

    export default function ReviewModal({ order, onClose, onSuccess }: ReviewModalProps) {
    const { user, token } = useAuthStore();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);


    const handleSubmit = async () => {
        console.log("ORDER:", order);
        console.log("USER:", user);
        console.log("order.provider:", order?.provider);
        console.log("order.provider.id:", order?.provider?.id);

        if (!user || !token) return alert("No hay usuario registrado");
        if (!rating) return alert("Debes elegir una calificación");

        const form = new FormData();

        // 🟢 AHORA SÍ: estos deberían aparecer en la consola
        form.append("orderId", order.id);
        form.append("authorUserId", user.id);
        form.append("targetProviderId", order.provider.id);
        form.append("rating", String(rating));
        form.append("comment", comment || "");

        if (file) form.append("files", file);

        // 🔥 LOG FINAL PARA CONFIRMAR
        for (const pair of form.entries()) {
            console.log("FORMDATA:", pair[0], pair[1]);
        }

        setLoading(true);
        try {
            await createProviderReview(form, token);
            onSuccess();
            onClose();
        } catch (err) {
            const error = err as any;
            console.log("ERROR RESPONSE:", error?.response?.data);
            alert("Error al enviar la reseña");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Calificar servicio</h2>

            <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                key={n}
                onClick={() => setRating(n)}
                className={`text-2xl ${
                    rating >= n ? "text-yellow-500" : "text-gray-300"
                }`}
                >
                ★
                </button>
            ))}
            </div>

            <textarea
            className="w-full border rounded-lg p-2 text-sm mb-4"
            rows={3}
            placeholder="Escribe un comentario..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            />

            {/* Imagen */}
            <input
            type="file"
            accept="image/*"
            onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                if (f) {
                const url = URL.createObjectURL(f);
                setPreview(url);
                } else {
                setPreview(null);
                }
            }}
            className="mb-4 text-white py-1 px-2 rounded-xl bg-[var(--color-primary)]"
            />

            {/* Preview */}
            {preview && (
            <div className="mb-4">
                <img
                src={preview}
                className="w-full h-40 object-cover rounded-lg border"
                alt="Vista previa"
                />
            </div>
            )}


            <div className="flex justify-end gap-3">
            <button className="px-4 py-2" onClick={onClose}>
                Cancelar
            </button>

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg"
            >
                {loading ? "Enviando..." : "Enviar Reseña"}
            </button>
            </div>
        </div>
        </div>
    );
    }
