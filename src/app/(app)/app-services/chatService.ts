"use client";

import { io, Socket } from "socket.io-client";
import axios from "axios";
import { useAuthStore } from "@/app/store/auth.store";

const SOCKET_URL =
	process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000/";
const API_URL = `${SOCKET_URL}/chat-control`;

let socket: Socket | null = null;

// 🔌 Conectar el socket autenticado
export const connectSocket = () => {
	const { token } = useAuthStore.getState();

	if (!socket) {
		socket = io(SOCKET_URL, {
			transports: ["websocket"],
			auth: { token }, // el token JWT que le mandas al backend
		});

		socket.on("connect", () => {
			console.log("🟢 Conectado al WebSocket con id:", socket?.id);
		});

		socket.on("disconnect", (reason) => {
			console.log("🔴 Desconectado del WebSocket:", reason);
		});
	}

	return socket;
};

// ❌ Desconectar socket
export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect();
		socket = null;
		console.log("⚡ Socket cerrado correctamente");
	}
};

// 📩 Escuchar mensajes nuevos
export const listenMessages = (callback: (msg: any) => void) => {
	if (!socket) connectSocket();
	socket?.on("newMessage", (msg) => {
		console.log("📥 Mensaje recibido:", msg);
		callback(msg);
	});
};

// 📤 Enviar mensaje en tiempo real
export const sendMessage = (
	senderId: string,
	receiverId: string,
	content: string
) => {
	if (!socket) connectSocket();
	socket?.emit("sendMessage", { senderId, receiverId, content });
	console.log("📤 Mensaje emitido:", { senderId, receiverId, content });
};

// 🧾 Obtener historial de mensajes
export const getMessagesBetween = async (
	senderId: string,
	receiverId: string
) => {
	const { token } = useAuthStore.getState();

	try {
		const response = await axios.get(`${API_URL}/messages`, {
			params: { senderId, receiverId },
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data;
	} catch (error: any) {
		if (error.response?.status === 401) {
			console.warn("⚠️ No autorizado: el token es inválido o expiró");
		}
		console.error("❌ Error al obtener mensajes:", error);
		return [];
	}
};

// 📋 Obtener lista de conversaciones de un usuario
export const getConversations = async (userId: string) => {
	const { token } = useAuthStore.getState();

	try {
		const response = await axios.get(`${API_URL}/conversations`, {
			params: { userId },
			headers: { Authorization: `Bearer ${token}` },
		});

		return response.data;
	} catch (error: any) {
		console.error("❌ Error al obtener conversaciones:", error);
		return [];
	}
};
