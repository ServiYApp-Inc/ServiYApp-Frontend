"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import { getConversations } from "../../app-services/chatService";

interface Conversation {
  userId: string;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    time: string;
  };
}

export default function UserInboxPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const data = await getConversations(user.id);
      setConversations(data);
    };

    load();
  }, [user]);

  if (!user) return <div>Cargando...</div>;

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Tus conversaciones</h1>

      <div className="space-y-3">
        {conversations.length === 0 && (
          <p className="text-gray-500">Aún no tienes chats.</p>
        )}

        {conversations.map((conv) => (
          <div
            key={conv.userId}
            onClick={() =>
              router.push(`/user/messages/${conv.userId}`)
            }
            className="flex items-center gap-4 bg-white p-3 rounded-xl border shadow-sm cursor-pointer hover:bg-gray-50"
          >
            {/* Avatar con inicial */}
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg">
              {conv.userId[0]?.toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="font-semibold">Proveedor {conv.userId.slice(0, 6)}</p>
              <p className="text-gray-600 text-sm truncate">
                {conv.lastMessage.content}
              </p>
            </div>

            {/* Hora */}
            <span className="text-xs text-gray-400">
              {new Date(conv.lastMessage.time).toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
