"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { useChatWidgetStore } from "@/app/store/chatWidget.store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faComments,
	faUser,
	faChevronLeft,
	faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { useChatSocket } from "@/app/(app)/app-services/useChatSocket";

// ======================================
// TYPES
// ======================================
interface Conversation {
	userId: string;
	lastMessage: string;
	lastSenderId?: string;
	time: string;
	read: boolean;
	user?: {
		id: string;
		names: string;
		surnames: string;
		profilePicture?: string;
	};
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

// ======================================
// COMPONENT
// ======================================
export default function ChatWidget() {
	const { user, token } = useAuthStore();
	const {
		open,
		minimized,
		targetUserId,
		openWidget,
		closeWidget,
		clearTarget,
		resetActiveChat,
		setRefreshInbox,
	} = useChatWidgetStore();

	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [activeChat, setActiveChat] = useState<Conversation | null>(null);
	const [content, setContent] = useState("");
	const [localLoading, setLocalLoading] = useState(false);

	const [localPartner, setLocalPartner] = useState<any>(null);
	const [notifications, setNotifications] = useState<any[]>([]);
	const [refreshingInbox, setRefreshingInbox] = useState(false);

	const bottomRef = useRef<HTMLDivElement>(null);

	// SOCKET
	const {
		messages,
		setMessages,
		partner,
		typing,
		sendMessage,
		sendTyping,
		stopTyping,
		markAsRead,
		loading,
		socket,
	} = useChatSocket(
		activeChat ? user?.id || "" : "",
		activeChat ? activeChat.userId : ""
	);

	useEffect(() => {
		if (partner) setLocalPartner(partner);
	}, [partner]);

	// --------------------------------------
	// REFRESH CONVERSATIONS
	// --------------------------------------
	const refreshConversations = async () => {
		if (!user?.id) return;

		setRefreshingInbox(true);

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}chat/conversations?userId=${user.id}`,
			{ headers: { Authorization: `Bearer ${token}` } }
		);

		const data: Conversation[] = await res.json();
		data.forEach((c: any) => {
			if (c.lastMessageObj) c.lastSenderId = c.lastMessageObj.senderId;
		});

		setConversations(data);
		setRefreshingInbox(false);
	};

	useEffect(() => {
		refreshConversations();
	}, [user?.id, token]);

	// 🔥 Registrar refresh global
	useEffect(() => {
		setRefreshInbox(refreshConversations);
	}, []);

	// --------------------------------------
	// NOTIFICACIONES DE MENSAJES
	// --------------------------------------
	useEffect(() => {
		if (!socket) return;

		socket.on("messageNotification", (payload: any) => {
			// Si es del chat que está abierto → NO notificar
			if (activeChat?.userId === payload.from) return;

			// 🔥 refrescar inbox en tiempo real
			refreshConversations();

			// Agregar notificación visual
			setNotifications((prev) => [
				...prev,
				{
					id: Date.now(),
					from: payload.from,
					content: payload.content,
					time: payload.time,
				},
			]);
		});
	}, [socket, activeChat]);

	// Cerrar automáticamente notificaciones
	useEffect(() => {
		if (notifications.length === 0) return;

		const timer = setTimeout(() => {
			setNotifications((prev) => prev.slice(1));
		}, 4500);

		return () => clearTimeout(timer);
	}, [notifications]);

	// --------------------------------------
	// CERRAR CHAT SI LA CONVERSACIÓN YA NO EXISTE
	// --------------------------------------
	useEffect(() => {
		if (!activeChat) return;

		const stillExists = conversations.some(
			(c) => c.userId === activeChat.userId
		);

		if (!stillExists) {
			setActiveChat(null);
			setMessages([]);
			stopTyping();
		}
	}, [conversations]);

	// --------------------------------------
	// OPEN FROM OUTSIDE
	// --------------------------------------
	useEffect(() => {
		if (!targetUserId) return;

		let conv = conversations.find((c) => c.userId === targetUserId);

		if (!conv) {
			conv = {
				userId: targetUserId,
				lastMessage: "",
				time: new Date().toISOString(),
				read: true,
				user: undefined,
			};
		}

		setActiveChat(null);
		setLocalPartner(null);
		setMessages([]);

		setTimeout(() => {
			setActiveChat(conv!);
		}, 80);

		openWidget();
		clearTarget();
	}, [targetUserId, conversations]);

	// --------------------------------------
	// SCROLL
	// --------------------------------------
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// --------------------------------------
	// MARK AS READ
	// --------------------------------------
	useEffect(() => {
		if (!activeChat) return;

		markAsRead();

		setTimeout(() => {
			setMessages((prev: Message[]) =>
				prev.map((m) =>
					m.receiverId === user?.id
						? { ...m, delivered: true, read: true }
						: m
				)
			);
		}, 80);
	}, [activeChat]);

	// --------------------------------------
	// SEND
	// --------------------------------------
	const handleSend = () => {
		if (!content.trim()) return;
		sendMessage(content);
		setContent("");
		stopTyping();

		setTimeout(() => {
			refreshConversations();
		}, 150);
	};

	// --------------------------------------
	// TIME
	// --------------------------------------
	const formatTime = (t: string) =>
		new Date(t).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});

	// --------------------------------------
	// CHECKMARKS
	// --------------------------------------
	const renderTicks = (msg: Message) => {
		if (!msg.delivered)
			return <span className="text-gray-400 text-[11px]">✓</span>;
		if (!msg.read)
			return <span className="text-gray-500 text-[11px]">✓✓</span>;
		return (
			<span className="text-blue-500 font-semibold text-[11px]">✓✓</span>
		);
	};

	// ======================================
	// BUBBLE
	// ======================================
	const Bubble = ({ msg }: { msg: Message }) => {
		const mine = msg.senderId === user?.id;

		return (
			<div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
				<div
					className={`px-3 py-2 rounded-2xl text-sm max-w-[75%] shadow-sm ${
						mine
							? "bg-primary text-white"
							: "bg-gray-200 text-gray-700"
					}`}
				>
					<div>{msg.content}</div>

					<div className="mt-1 flex justify-end gap-1 text-[10px] opacity-80">
						{formatTime(msg.time)}
						{mine && renderTicks(msg)}
					</div>
				</div>
			</div>
		);
	};

	// ======================================
	// INBOX
	// ======================================
	const renderInbox = () => {
		if (refreshingInbox) {
			return (
				<div className="flex-1 flex justify-center items-center">
					<div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
				</div>
			);
		}

		return (
			<div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
				{conversations.length === 0 && (
					<p className="text-gray-500 text-center mt-10">
						No tienes mensajes.
					</p>
				)}

				{conversations.map((c) => (
					<div
						key={c.userId}
						className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer border"
						onClick={() => {
							setLocalLoading(true);
							setActiveChat(null);
							setLocalPartner(null);
							setMessages([]);

							setTimeout(() => {
								setActiveChat(c);
								markAsRead();
								setLocalLoading(false);
							}, 150);
						}}
					>
						{c.user?.profilePicture ? (
							<img
								src={c.user.profilePicture}
								className="w-10 h-10 rounded-full object-cover"
							/>
						) : (
							<div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
								<FontAwesomeIcon
									icon={faUser}
									className="text-gray-600"
								/>
							</div>
						)}

						<div className="flex-1">
							<div className="font-medium text-sm">
								{c.user
									? `${c.user.names} ${c.user.surnames}`
									: c.userId}
							</div>
							<div className="text-xs text-gray-500 truncate">
								{c.lastSenderId === user?.id ? "Tú: " : ""}
								{c.lastMessage}
							</div>
						</div>

						<div className="text-[11px] text-gray-400">
							{formatTime(c.time)}
						</div>
					</div>
				))}
			</div>
		);
	};

	// ======================================
	// CHAT VIEW
	// ======================================
	const renderChat = () => (
		<div className="flex flex-col h-full">
			{/* HEADER */}
			<div className="flex items-center gap-2 px-3 border-b bg-gray-100" style={{ height: "54px" }}>
				<button
					onClick={async () => {
						setActiveChat(null);
						setLocalPartner(null);
						setMessages([]);
						await refreshConversations();
					}}
				>
					<FontAwesomeIcon icon={faChevronLeft} className="text-gray-600" />
				</button>

				{localPartner?.profilePicture ? (
					<img
						src={localPartner.profilePicture}
						className="w-8 h-8 rounded-full object-cover"
					/>
				) : (
					<div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
						<FontAwesomeIcon icon={faUser} className="text-gray-600" />
					</div>
				)}

				<div className="font-medium text-sm">
					{localPartner ? `${localPartner.names} ${localPartner.surnames}` : ""}
				</div>
			</div>

			{/* BODY */}
			<div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
				{loading || localLoading ? (
					<div className="w-full h-full flex justify-center items-center">
						<div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
					</div>
				) : (
					<>
						{messages.map((msg) => (
							<Bubble key={msg.id} msg={msg} />
						))}

						{typing && (
							<div className="text-sm text-gray-600 ml-1">escribiendo...</div>
						)}

						<div ref={bottomRef} />
					</>
				)}
			</div>

			{/* INPUT */}
			<div className="flex items-center gap-2 px-3 border-t bg-white rounded-b-xl" style={{ height: "56px" }}>
				<input
					className="flex-1 border rounded-full px-3 py-2 text-sm"
					placeholder="Escribe un mensaje..."
					value={content}
					onChange={(e) => {
						setContent(e.target.value);
						sendTyping();
					}}
					onBlur={stopTyping}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							handleSend();
						}
					}}
				/>

				<button
					className="bg-primary text-white px-4 py-2 rounded-full text-sm"
					onClick={handleSend}
				>
					Enviar
				</button>
			</div>
		</div>
	);

	// ======================================
	// MAIN
	// ======================================
	return (
		<>
			{/* Floating button */}
			{!open && !minimized && (
				<button
					onClick={() => openWidget()}
					className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:scale-110 transition"
				>
					<FontAwesomeIcon icon={faComments} />
				</button>
			)}

			{/* NOTIFICACIONES */}
			<div className="fixed bottom-28 right-6 space-y-2 z-[9999]">
				{notifications.map((n) => (
					<div
						key={n.id}
						className="bg-white shadow-xl p-3 rounded-lg border w-64 animate-fadeIn"
					>
						<p className="font-medium text-sm mb-1">Nuevo mensaje</p>
						<p className="text-xs text-gray-600 truncate">{n.content}</p>
					</div>
				))}
			</div>

			{/* WIDGET */}
			{open && (
				<div
					className="fixed bottom-2 right-6 bg-white shadow-lg border rounded-xl flex flex-col z-50"
					style={{ width: "24rem", height: "36rem" }}
				>
					<div className="flex items-center justify-between px-4 bg-primary text-white rounded-t-xl" style={{ height: "50px" }}>
						<span className="font-medium text-sm">
							{activeChat ? "Chat" : "Mensajes"}
						</span>

						<button onClick={closeWidget}>
							<FontAwesomeIcon icon={faXmark} />
						</button>
					</div>

					<div className="flex-1 flex flex-col min-h-0">
						{activeChat ? renderChat() : renderInbox()}
					</div>
				</div>
			)}
		</>
	);
}
