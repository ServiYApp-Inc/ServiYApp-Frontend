"use client";

import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  time: string;
  delivered: boolean;
  read: boolean;
}

export function useChatSocket(userId: string, receiverId?: string) {
  const socketRef = useRef<Socket | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [online, setOnline] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // ======================
  // 🔵 CONECTAR SOCKET
  // ======================
  useEffect(() => {
    if (!userId) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      transports: ["websocket"],
      query: { userId },
    });

    socketRef.current = socket;

    // Log de conexión
    socket.on("connect", () => {
      console.log("🟢 Socket conectado:", socket.id);

      // FIX: si el receptor soy yo mismo en otra pantalla
      if (userId === receiverId) {
        setOnline(true);
      }
    });

    // Cargar historial al conectar
    if (receiverId) {
      socket.emit("getHistory", { userId, receiverId });
    }

    // Recibir historial
    socket.on("messagesHistory", (history) => {
      setMessages(history);
    });

    // ======================
    // 🔥 FIX ONLINE / OFFLINE
    // ======================
    socket.on("userOnline", ({ userId: onlineId }) => {
      if (onlineId === receiverId) {
        setOnline(true);
      }
    });

    socket.on("userOffline", ({ userId: offlineId }) => {
      if (offlineId === receiverId) {
        setOnline(false);
      }
    });

    // ======================
    // 📩 NUEVOS MENSAJES
    // ======================
    socket.on("receiveMessage", (msg: ChatMessage) => {
      const isBetween =
        (msg.senderId === userId && msg.receiverId === receiverId) ||
        (msg.senderId === receiverId && msg.receiverId === userId);

      if (isBetween) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // ======================
    // ✏️ TYPING
    // ======================
    socket.on("typing", ({ from }) => {
      if (from === receiverId) setTyping(true);
    });

    socket.on("stopTyping", ({ from }) => {
      if (from === receiverId) setTyping(false);
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [userId, receiverId]);

  // ======================
  // ✉️ ENVIAR MENSAJE
  // ======================
  const sendMessage = (content: string) => {
    if (!socketRef.current || !receiverId) return;

    setIsSending(true);

    socketRef.current.emit(
      "sendMessage",
      { senderId: userId, receiverId, content },
      () => setIsSending(false)
    );
  };

  // ======================
  // ✏️ ENVIAR TYPING
  // ======================
  const sendTyping = () => {
    if (!receiverId) return;
    socketRef.current?.emit("typing", { from: userId, to: receiverId });
  };

  const stopTyping = () => {
    if (!receiverId) return;
    socketRef.current?.emit("stopTyping", { from: userId, to: receiverId });
  };

  // ======================
  // 👁️ MARCAR COMO LEÍDO
  // ======================
  const markAsRead = () => {
    if (!receiverId) return;
    socketRef.current?.emit("markAsRead", { userId, receiverId });
  };

  return {
    socket: socketRef.current,
    messages,
    online,
    typing,
    isSending,
    sendMessage,
    sendTyping,
    stopTyping,
    markAsRead,
  };
}
