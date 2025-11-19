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

export default function ChatWidget() {
	const { user, token } = useAuthStore();
	const {
		open,
		minimized,
		targetUserId,
		openWidget,
		closeWidget,
		clearTarget,
		setRefreshInbox,
	} = useChatWidgetStore();

	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [activeChat, setActiveChat] = useState<Conversation | null>(null);
	const [content, setContent] = useState("");
	const [localLoading, setLocalLoading] = useState(false);
	const [refreshingInbox, setRefreshingInbox] = useState(false);

	const [localPartner, setLocalPartner] = useState<any>(null);
	const [notifications, setNotifications] = useState<any[]>([]);

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
	} = useChatSocket(user?.id || "", activeChat?.userId || undefined);

	useEffect(() => {
		if (partner) setLocalPartner(partner);
	}, [partner]);

	// -------------------------
	// REFRESH CONVERSATIONS
	// -------------------------
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

	useEffect(() => {
		setRefreshInbox(refreshConversations);
	}, []);

	// -------------------------
	// NOTIFICATIONS (ALWAYS)
	// -------------------------
	useEffect(() => {
		if (!socket) return;

		// Mensajes reales
		socket.on("receiveMessage", (msg) => {
			refreshConversations();

			// Solo si el mensaje es PARA mí
			if (msg.receiverId !== user?.id) return;

			// Si estoy dentro del chat con esa persona → NO notificar
			if (activeChat && activeChat.userId === msg.senderId) return;

			// Mostrar noti SIEMPRE (widget abierto o cerrado)
			setNotifications((prev) => [
				...prev,
				{
					id: Date.now(),
					from: msg.senderId,
					content: msg.content,
					time: msg.time,
				},
			]);
		});

		// Noti extra del backend
		socket.on("messageNotification", (payload) => {
			if (payload.to !== user?.id) return;

			refreshConversations();

			if (activeChat && activeChat.userId === payload.from) return;

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
	}, [socket, activeChat, user?.id]);

	// Auto remover notis
	useEffect(() => {
		if (!notifications.length) return;

		const timer = setTimeout(() => {
			setNotifications((prev) => prev.slice(1));
		}, 4500);

		return () => clearTimeout(timer);
	}, [notifications]);

	// -------------------------
	// CLOSE CHAT IF REMOVED
	// -------------------------
	useEffect(() => {
		if (!activeChat) return;

		const exists = conversations.some(
			(c) => c.userId === activeChat.userId
		);

		if (!exists) {
			setActiveChat(null);
			setMessages([]);
			stopTyping();
		}
	}, [conversations]);

	// -------------------------
	// OPEN FROM OUTSIDE
	// -------------------------
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

		setTimeout(() => setActiveChat(conv!), 80);

		openWidget();
		clearTarget();
	}, [targetUserId, conversations]);

	// -------------------------
	// SCROLL
	// -------------------------
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// -------------------------
	// MARK AS READ
	// -------------------------
	useEffect(() => {
		if (!activeChat) return;

		markAsRead();

		setTimeout(() => {
			setMessages((prev) =>
				prev.map((m) =>
					m.receiverId === user?.id
						? { ...m, delivered: true, read: true }
						: m
				)
			);
		}, 80);
	}, [activeChat]);

	// -------------------------
	// SEND
	// -------------------------
	const handleSend = () => {
		if (!content.trim()) return;
		sendMessage(content);
		setContent("");
		stopTyping();

		setTimeout(refreshConversations, 150);
	};

	const formatTime = (t: string) =>
		new Date(t).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});

	const renderTicks = (msg: Message) => {
		if (!msg.delivered)
			return <span className="text-gray-400 text-[11px]">✓</span>;
		if (!msg.read)
			return <span className="text-gray-500 text-[11px]">✓✓</span>;
		return (
			<span className="text-blue-500 font-semibold text-[11px]">✓✓</span>
		);
	};

	// -------------------------
	// BUBBLE
	// -------------------------
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

	// -------------------------
	// INBOX
	// -------------------------
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
							<div className="w-10 h-10 bg-blue-300 rounded-full flex items-center justify-center">
								<FontAwesomeIcon
									icon={faUser}
									className="text-white"
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

	// -------------------------
	// CHAT VIEW
	// -------------------------
	const renderChat = () => (
		<div className="flex flex-col h-full">
			<div
				className="flex items-center gap-2 px-3 border-b bg-gray-100"
				style={{ height: "54px" }}
			>
				<button
					onClick={async () => {
						setActiveChat(null);
						setLocalPartner(null);
						setMessages([]);
						await refreshConversations();
					}}
				>
					<FontAwesomeIcon
						icon={faChevronLeft}
						className="text-gray-600"
					/>
				</button>

				{localPartner?.profilePicture ? (
					<img
						src={localPartner.profilePicture}
						className="w-8 h-8 rounded-full object-cover"
					/>
				) : (
					<div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center">
						<FontAwesomeIcon icon={faUser} className="text-white" />
					</div>
				)}

				<div className="font-medium text-sm">
					{localPartner
						? `${localPartner.names} ${localPartner.surnames}`
						: ""}
				</div>
			</div>

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
							<div className="text-sm text-gray-600 ml-1">
								escribiendo...
							</div>
						)}

						<div ref={bottomRef} />
					</>
				)}
			</div>

			<div
				className="flex items-center gap-2 px-3 border-t bg-white rounded-b-xl"
				style={{ height: "56px" }}
			>
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

	// -------------------------
	// MAIN RETURN
	// -------------------------
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

			{/* NOTIFICATIONS */}
			<div className="fixed bottom-28 right-6 space-y-2 z-[9999]">
				{notifications.map((n) => (
					<div
						key={n.id}
						className="bg-blue-600 text-white shadow-xl p-3 rounded-lg w-64 animate-slide-in"
					>
						<p className="font-semibold text-sm">Nuevo mensaje</p>
						<p className="text-xs opacity-90 truncate mt-1">
							{n.content}
						</p>
					</div>
				))}
			</div>

			{/* WIDGET */}
			{open && (
				<div
					className="fixed bottom-2 right-6 bg-white shadow-lg border rounded-xl flex flex-col z-50"
					style={{ width: "24rem", height: "36rem" }}
				>
					<div
						className="flex items-center justify-between px-4 bg-primary text-white rounded-t-xl"
						style={{ height: "50px" }}
					>
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
