"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";

interface ChatConversation {
  userId: string;
  lastMessage: string;
  time: string;
  read: boolean;
}

export default function ProviderMessagesPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [unread, setUnread] = useState<Record<string, number>>({});

  // =============================
  // 🔵 FETCH conversaciones
  // =============================
  useEffect(() => {
    if (!user?.id) return;

    const fetchConversations = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}chat/conversations?userId=${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        setConversations(data);

        // Construir lista de no leídos
        const unreadMap: Record<string, number> = {};
        data.forEach((c: ChatConversation) => {
          if (!c.read) unreadMap[c.userId] = (unreadMap[c.userId] || 0) + 1;
        });

        setUnread(unreadMap);
      } catch (error) {
        console.error("Error al cargar conversaciones:", error);
      }
    };

    fetchConversations();
  }, [user?.id, token]);

  // =============================
  // Utilidad hora
  // =============================
  const formatHora = (time: string) => {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) return <div>Cargando...</div>;

  return (
    <main className="px-6 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
        Mensajes
      </h1>

      <div className="flex flex-col gap-3">
        {conversations.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No tienes conversaciones aún.
          </p>
        ) : (
          conversations.map((c) => (
            <div
              key={c.userId}
              onClick={() => {
                // limpiar no leídos antes de entrar
                setUnread((prev) => ({ ...prev, [c.userId]: 0 }));

                router.push(`/provider/messages/${c.userId}`);
              }}
              className="bg-white border rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
            >
              {/* LEFT */}
              <div className="flex items-center gap-3">
                {/* avatar por inicial */}
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {c.userId[0]?.toUpperCase()}
                </div>

                <div>
                  <p className="font-semibold text-sm">{c.userId}</p>

                  <p className="text-xs text-gray-500 w-44 truncate">
                    {c.lastMessage}
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-[11px] text-gray-400">
                  {formatHora(c.time)}
                </span>

                {/* badge de no leídos */}
                {unread[c.userId] > 0 && (
                  <span className="bg-red-500 text-white px-2 py-0.5 text-[10px] rounded-full">
                    {unread[c.userId]}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
