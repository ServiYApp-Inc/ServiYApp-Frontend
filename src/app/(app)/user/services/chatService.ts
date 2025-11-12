"use client";
import { io, Socket } from "socket.io-client";
import axios from "axios";

const API_URL = "http://localhost:3000/chat-control";
const socket: Socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

// Conexión con el socket
export const connectSocket = () => {
  if (!socket.connected) socket.connect();
  console.log("🔌 Socket conectado");
  return socket;
};

// Desconexión
export const disconnectSocket = () => {
  socket.disconnect();
  console.log("❌ Socket desconectado");
};

// Escuchar mensajes nuevos
export const listenMessages = (callback: (msg: any) => void) => {
  socket.on("message", (msg) => {
    console.log("📩 Mensaje recibido:", msg);
    callback(msg);
  });
};

// Enviar mensaje
export const sendMessage = (
  senderId: string,
  receiverId: string,
  content: string
) => {
  socket.emit("sendMessage", { senderId, receiverId, content });
  console.log("📤 Mensaje enviado:", { senderId, receiverId, content });
};

// Obtener historial de mensajes (con token)
export const getMessagesBetween = async (
  senderId: string,
  receiverId: string
) => {
  try {
    const token = localStorage.getItem("token"); // 🔐 Recupera el token del login

    const response = await axios.get(`${API_URL}/getMessages`, {
      params: { senderId, receiverId },
      headers: {
        Authorization: `Bearer ${token}`, // 🔑 Se envía el token
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.warn("⚠️ No autorizado: el token es inválido o no existe");
    }
    console.error("Error al obtener mensajes:", error);
    return [];
  }
};
