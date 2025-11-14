"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartConversation() {
  const router = useRouter();
  const [userId, setUserId] = useState("");

  const handleStart = () => {
    if (!userId.trim()) {
      console.warn("⚠️ Debes escribir un userId");
      return;
    }

    router.push(`/provider/messages/${userId}`);
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-white border rounded-xl shadow max-w-sm">
      <label className="text-sm font-semibold text-gray-700">
        Escribe el ID del usuario:
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
