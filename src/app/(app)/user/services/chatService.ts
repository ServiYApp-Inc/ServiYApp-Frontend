"use client";
import { io, Socket } from "socket.io-client";
import axios from "axios";

const API_URL = "http://localhost:3000/chat-control"; 
const socket: Socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

export const connectSocket = () => {
  if (!socket.connected) socket.connect();
  console.log("🔌 Socket conectado");
  return socket;
};

export const disconnectSocket = () => {
  socket.disconnect();
  console.log("❌ Socket desconectado");
};

export const listenMessages = (callback: (msg: any) => void) => {
  socket.on("message", (msg) => {
    console.log("📩 Mensaje recibido:", msg);
    callback(msg);
  });
};

export const sendMessage = (senderId: string, receiverId: string, content: string) => {
  socket.emit("sendMessage", { senderId, receiverId, content });
  console.log("📤 Mensaje enviado:", { senderId, receiverId, content });
};

export const getMessagesBetween = async (senderId: string, receiverId: string) => {
  try {
    const response = await axios.get(`${API_URL}/getMessages`, {
      params: { senderId, receiverId },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    return [];
  }
};
