"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import { Api } from "@/app/services/api";
import { useChatSocket } from "@/app/(app)/app-services/useChatSocket";

interface Partner {
  id: string;
  names: string;
  surnames: string;
  profilePicture?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  time: string;
  delivered: boolean;
  read: boolean;
}

export default function ProviderChatPage() {
  const params = useParams();
  const userId = params.id as string; // <-- el usuario con el que se habla

  const { user } = useAuthStore(); // <-- proveedor autenticado

  const [content, setContent] = useState("");
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);

  // 🟦 Socket (tiempo real)
  const {
    messages: socketMessages,
    sendMessage,
    sendTyping,
    stopTyping,
    typing,
    markAsRead,
  } = useChatSocket(user?.id || "", userId);

  // 🟩 MERGE sin duplicados
  const messages = [
    ...loadedMessages,
    ...socketMessages.filter(
      (sm) => !loadedMessages.some((lm) => lm.id === sm.id)
    ),
  ].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  // 🟦 FETCH inicial → partner + mensajes REST
  useEffect(() => {
    if (!user?.id || !userId) return;

    const loadChat = async () => {
      try {
        const res = await Api.get(
          `/chat/messages?userA=${user.id}&userB=${userId}`
        );

        setPartner(res.data.partner || null);
        setLoadedMessages(res.data.messages || []);
      } catch (err) {
        console.error("Error cargando chat:", err);
      }
    };

    loadChat();
  }, [user?.id, userId]);

  // 🟦 Scroll automático
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🟦 Marcar como leído
  useEffect(() => {
    if (userId) markAsRead();
  }, [userId, messages]);

  const handleSend = () => {
    if (!content.trim()) return;
    sendMessage(content);
    setContent("");
    stopTyping();
  };

  if (!user || !partner) return <div>Cargando...</div>;

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-gray-50">
      {/* HEADER */}
      <div className="p-4 bg-white border-b shadow flex items-center gap-3">
        <img
          src={partner.profilePicture || "/default-avatar.png"}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div className="flex flex-col">
          <span className="font-semibold text-lg">
            {partner.names} {partner.surnames}
          </span>

          {typing && (
            <span className="text-xs text-green-500">escribiendo...</span>
          )}
        </div>
      </div>

      {/* MENSAJES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMine = msg.senderId === user.id;

          return (
            <div
              key={msg.id}
              className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                isMine
                  ? "bg-primary text-white ml-auto"
                  : "bg-white border"
              }`}
            >
              <p>{msg.content}</p>

              {/* hora + ticks */}
              <div className="flex justify-end gap-2 mt-1 items-center">
                <span className="text-[10px] opacity-70">
                  {new Date(msg.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                {isMine && (
                  <span className="text-[12px]">
                    {msg.read ? (
                      <span className="text-blue-400">✓✓</span>
                    ) : msg.delivered ? (
                      "✓✓"
                    ) : (
                      "✓"
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="text-xs text-gray-400 italic">Escribiendo...</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 bg-white border-t flex gap-2">
        <input
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            sendTyping();
            if (!e.target.value) stopTyping();
          }}
          placeholder="Escribe un mensaje..."
          className="flex-1 border rounded-lg px-3 py-2"
        />

        <button
          onClick={handleSend}
          className="bg-primary text-white rounded-lg px-4"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
