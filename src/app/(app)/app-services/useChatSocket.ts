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
	const [partner, setPartner] = useState<any>(null);
	const [loading, setLoading] = useState(false);

	const [online, setOnline] = useState(false);
	const [lastSeen, setLastSeen] = useState<string | null>(null);
	const [typing, setTyping] = useState(false);

	// ======================
	// CONNECT SOCKET
	// ======================
	useEffect(() => {
		if (!userId) return;

		const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
			transports: ["websocket"],
			query: { userId }, // <-- ESTE ES EL ID DEL USUARIO LOGGEADO SIEMPRE
		});

		socketRef.current = socket;

		socket.on("connect", () => {
			console.log("🟢 Conectado:", socket.id);
		});

		// Obtener historial apenas entra al chat
		if (receiverId) {
			setLoading(true);
			socket.emit("getHistory", { userId, receiverId });
		}

		socket.on("messagesHistory", (history) => {
			setPartner(history.partner);
			setMessages(history.messages || []);
			setLoading(false);
		});

		// ======================
		// ONLINE / OFFLINE
		// ======================
		socket.on("userOnline", ({ userId: id }) => {
			if (id === receiverId) setOnline(true);
		});

		socket.on("userOffline", ({ userId: id }) => {
			if (id === receiverId) {
				setOnline(false);
				setLastSeen(new Date().toISOString());
			}
		});

		// ======================
		// RECEIVE MESSAGE
		// ======================
		socket.on("receiveMessage", (msg) => {
			const isBetween =
				(msg.senderId === userId && msg.receiverId === receiverId) ||
				(msg.senderId === receiverId && msg.receiverId === userId);

			if (isBetween) {
				setMessages((prev) => [...prev, msg]);
			}
		});

		// Delivered ✓✓
		socket.on("messageDelivered", ({ messageId }) => {
			setMessages((prev) =>
				prev.map((m) =>
					m.id === messageId ? { ...m, delivered: true } : m
				)
			);
		});

		// Read ✓✓ azul
		socket.on("allMessagesRead", ({ from }) => {
			if (from === receiverId) {
				setMessages((prev) =>
					prev.map((m) =>
						m.receiverId === userId ? { ...m, read: true } : m
					)
				);
			}
		});

		// ======================
		// TYPING
		// ======================
		socket.on("typing", ({ from }) => {
			if (from === receiverId) setTyping(true);
		});

		socket.on("stopTyping", ({ from }) => {
			if (from === receiverId) setTyping(false);
		});

		return () => {
			socket.disconnect();
		};
	}, [userId, receiverId]);

	// ======================
	// SEND MESSAGE
	// ======================
	const sendMessage = (content: string) => {
		if (!socketRef.current || !receiverId) return;

		socketRef.current.emit("sendMessage", {
			senderId: userId,
			receiverId,
			content,
		});
	};

	// typing
	const sendTyping = () => {
		socketRef.current?.emit("typing", { from: userId, to: receiverId });
	};

	const stopTyping = () => {
		socketRef.current?.emit("stopTyping", { from: userId, to: receiverId });
	};

	const markAsRead = () => {
		socketRef.current?.emit("markAsRead", { userId, receiverId });
	};

	return {
		socket: socketRef.current,
		messages,
		setMessages,
		partner,
		loading,
		typing,
		online,
		lastSeen,
		sendMessage,
		sendTyping,
		stopTyping,
		markAsRead,
	};
}
