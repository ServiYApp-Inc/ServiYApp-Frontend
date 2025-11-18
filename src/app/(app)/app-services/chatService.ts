"use client";

import { io, Socket } from "socket.io-client";
import axios from "axios";
import { useAuthStore } from "@/app/store/auth.store";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL!;

let socket: Socket | null = null;

// =============================
//   OBTENER / CREAR SOCKET
// =============================
export const getSocket = () => {
  const { user } = useAuthStore.getState();
  if (!user?.id) return null;

  if (socket) return socket;

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    query: { userId: user.id },
  });

  socket.on("connect", () => {
    console.log("🟢 Socket conectado:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket desconectado");
  });

  return socket;
};

// =============================
//   ESCUCHAR MENSAJES
// =============================
export const listenMessages = (callback: (msg: any) => void) => {
  const s = getSocket();
  if (!s) return;

  s.off("message");
  s.on("message", callback);
};

// =============================
//   ENVIAR MENSAJE
// =============================
export const sendMessage = (
  senderId: string,
  receiverId: string,
  content: string
) => {
  const s = getSocket();
  if (!s) return;

  s.emit("sendMessage", { senderId, receiverId, content });
};

// =============================
//   OBTENER HISTORIAL CORRECTO
// =============================
export const getMessagesBetween = async (
  userA: string,
  userB: string
) => {
  const { token } = useAuthStore.getState();

  const res = await axios.get(`${API_URL}chat/messages`, {
    params: { userA, userB },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;

  
};


export const getConversations = async (userId: string) => {
  const { token } = useAuthStore.getState();

  const res = await axios.get(`${API_URL}chat/conversations`, {
    params: { userId },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
