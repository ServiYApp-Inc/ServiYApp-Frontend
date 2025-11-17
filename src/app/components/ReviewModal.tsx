"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Api } from "@/app/services/api";
import { useAuthStore } from "@/app/store/auth.store";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faTimes, faCamera, faImage } from "@fortawesome/free-solid-svg-icons";

export default function ReviewModal({
    orderId,
    providerId,
    onClose,
    onSuccess,
}: {
    orderId: string;
    providerId: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const { user, token } = useAuthStore();

    const [rate, setRate] = useState(0);
    const [comment, setComment] = useState("");
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const fileRef = useRef<HTMLInputElement | null>(null);

    const submitReview = async () => {
        if (!rate) {
            toast.error("Selecciona una calificación");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("authorUserId", user.id);
            formData.append("targetProviderId", providerId);
            formData.append("orderId", orderId);
            formData.append("rate", String(rate));
            formData.append("comment", comment || "");

            if (file) {
                formData.append("files", file);
            }

            await Api.post("reviews/createReviewProvider", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Reseña enviada");
            onSuccess();
            onClose();
        } catch (e) {
            toast.error("Error al enviar la reseña");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95 }}
                    className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-5 relative"
                >
                    {/* Cerrar */}
                    <button
                        className="absolute top-4 left-4 p-2 bg-black/40 text-white rounded-full"
                        onClick={onClose}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>

                    <h2 className="text-2xl font-bold text-center text-[var(--color-primary)]">
                        Calificar servicio
                    </h2>

                    {/* RATE */}
                    <div className="flex justify-center gap-3 text-3xl">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <FontAwesomeIcon
                                key={n}
                                icon={faStar}
                                className={`cursor-pointer transition ${
                                    rate >= n ? "text-yellow-400" : "text-gray-300"
                                }`}
                                onClick={() => setRate(n)}
                            />
                        ))}
                    </div>

                    {/* COMMENT */}
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Escribe un comentario..."
                        className="w-full p-3 border rounded-lg h-28 text-sm"
                    />

                    {/* IMAGE */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-40 h-40 rounded-xl overflow-hidden border-4 border-[var(--color-primary)]">
                            {preview ? (
                                <img src={preview} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <FontAwesomeIcon
                                        icon={faImage}
                                        className="text-gray-400 text-3xl"
                                    />
                                </div>
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileRef}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0] || null;
                                if (!f) return;
                                setFile(f);
                                setPreview(URL.createObjectURL(f));
                            }}
                        />

                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="px-5 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[#1b2a5e] transition"
                        >
                            <FontAwesomeIcon icon={faCamera} /> Subir imagen
                        </button>
                    </div>

                    {/* SEND */}
                    <button
                        onClick={submitReview}
                        disabled={loading}
                        className="w-full py-3 rounded-lg text-white font-semibold shadow-md"
                        style={{ backgroundColor: "var(--color-primary)" }}
                    >
                        {loading ? "Enviando..." : "Enviar Reseña"}
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
