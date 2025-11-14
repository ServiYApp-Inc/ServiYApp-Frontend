"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";

export default function StartConversation() {
  const router = useRouter();
  const { role } = useAuthStore(); // ← aquí obtenemos el rol real

  const [userId, setUserId] = useState("");

  const handleStart = () => {
    if (!userId.trim()) {
      console.warn("⚠️ Debes escribir un ID válido");
      return;
    }

    if (!role) {
      console.warn("⚠️ No se detectó rol de usuario");
      return;
    }

    // Ruta dinámica según el rol
    const baseRoute =
      role === "provider"
        ? "/provider/messages"
        : "/user/messages";

    router.push(`${baseRoute}/${userId}`);
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-white border rounded-xl shadow max-w-sm">
      <label className="text-sm font-semibold text-gray-700">
        Escribe el ID:
      </label>

      <input
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="Ejemplo: 4d33a203-2333-4a2b-9b8f-98c998f5cc21"
        className="border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none"
      />

      <button
        onClick={handleStart}
        className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
      >
        Iniciar conversación
      </button>
    </div>
  );
}
