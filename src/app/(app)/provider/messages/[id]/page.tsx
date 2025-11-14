"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import {
  getSocket,
  listenMessages,
  getMessagesBetween,
  sendMessage,
} from "@/app/(app)/app-services/chatService";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  time: string;
}

export default function ProviderChatPage() {
  const params = useParams();
  const receiverId = params.id as string;

  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  if (!user) return <div>Cargando...</div>;

  // 🔵 conectar socket
  useEffect(() => {
    getSocket();
  }, []);

  // 🔵 cargar historial desde tu back (GET /chat/messages)
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getMessagesBetween(user.id, receiverId);
        setMessages(data);
      } catch (err) {
        console.error("Error cargando historial:", err);
      }
    };
    loadHistory();
  }, [receiverId, user.id]);

  // 🔵 escuchar mensajes nuevos
  useEffect(() => {
    listenMessages((msg: Message) => {
      const isBetween =
        (msg.senderId === user.id && msg.receiverId === receiverId) ||
        (msg.senderId === receiverId && msg.receiverId === user.id);

      if (!isBetween) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
  }, [receiverId, user.id]);

  // 🔵 auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!content.trim()) return;

    sendMessage(user.id, receiverId, content);
    setContent("");
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-gray-50">
      {/* HEADER */}
      <div className="p-4 bg-white border-b shadow flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
          {receiverId[0]?.toUpperCase()}
        </div>
        <span className="font-semibold text-lg">Chat con el cliente</span>
      </div>

      {/* MENSAJES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
              msg.senderId === user.id
                ? "bg-primary text-white ml-auto"
                : "bg-white border"
            }`}
          >
            {msg.content}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 bg-white border-t flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
