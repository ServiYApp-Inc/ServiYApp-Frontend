"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import { useChatSocket } from "@/app/(app)/app-services/useChatSocket";

export default function UserChatPage() {
  const params = useParams();
  const providerId = params.id as string;

  const { user } = useAuthStore();

  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    sendMessage,
    sendTyping,
    stopTyping,
    typing,
    markAsRead,
  } = useChatSocket(user?.id || "", providerId);

  // scroll automático
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // marcar como leído
  useEffect(() => {
    if (providerId) markAsRead();
  }, [providerId, messages]);

  const handleSend = () => {
    if (!content.trim()) return;
    sendMessage(content);
    setContent("");
    stopTyping();
  };

  if (!user) return <div>Cargando...</div>;

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-gray-50">
      {/* HEADER */}
      <div className="p-4 bg-white border-b shadow flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
            {providerId[0]?.toUpperCase()}
          </div>
          {/* 🔴 ONLINE/OFFLINE REMOVIDO */}
        </div>

        <span className="font-semibold text-lg">Tu proveedor</span>
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
              {/* contenido */}
              <p>{msg.content}</p>

              {/* hora + estado */}
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
