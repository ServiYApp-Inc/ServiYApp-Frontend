"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  connectSocket,
  disconnectSocket,
  listenMessages,
  sendMessage,
  getMessagesBetween,
} from "@/app/(app)/user/services/chatService";

interface Message {
  id: string;
  content: string;
  time: string;
  senderId: string;
  receiverId: string;
  sender?: any;
  receiver?: any;
}

export default function ChatDetailPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  // ID temporal (hasta tener login real)
  const userId = "e9a30b6e-cfd7-4544-8289-02464b0a4e8d";
  const receiverId = params.id;

  useEffect(() => {
    const socket = connectSocket();
    setSocketConnected(true);

    const fetchMessages = async () => {
      const data = await getMessagesBetween(userId, receiverId);
      setMessages(data);
    };
    fetchMessages();

    listenMessages((msg) => {
      if (
        (msg.senderId === userId && msg.receiverId === receiverId) ||
        (msg.senderId === receiverId && msg.receiverId === userId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      disconnectSocket();
      setSocketConnected(false);
    };
  }, [userId, receiverId]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage(userId, receiverId, newMessage);

    const msg: Message = {
      id: crypto.randomUUID(),
      content: newMessage,
      time: new Date().toISOString(),
      senderId: userId,
      receiverId,
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-[#fff5f5] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#f0d7db] bg-white shadow-sm">
        <Image
          src="https://randomuser.me/api/portraits/women/45.jpg"
          width={48}
          height={48}
          alt="receiver"
          className="rounded-full"
        />
        <div>
          <h2 className="text-lg font-semibold text-[#d93c5c]">
            Chat con tu profesional
          </h2>
          <p className="text-xs text-gray-500">
            {socketConnected ? "Activo ahora" : "Desconectado"}
          </p>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
              msg.senderId === userId
                ? "bg-[#d93c5c] text-white self-end ml-auto"
                : "bg-white border border-[#f0d7db]"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#f0d7db] bg-white flex items-center gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribí un mensaje..."
          className="flex-1 rounded-full border border-[#f0d7db] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d93c5c]/40"
        />
        <button
          onClick={handleSend}
          disabled={!socketConnected}
          className={`rounded-full px-4 py-2 font-medium text-white transition ${
            socketConnected
              ? "bg-[#d93c5c] hover:bg-[#c7334f]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
