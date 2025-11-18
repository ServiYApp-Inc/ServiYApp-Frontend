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
	} = useChatWidgetStore();

	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [activeChat, setActiveChat] = useState<Conversation | null>(null);
	const [content, setContent] = useState("");

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
	} = useChatSocket(
		activeChat ? user?.id || "" : "",
		activeChat ? activeChat.userId : ""
	);

	// ======================================
	// LOAD INBOX
	// ======================================
	useEffect(() => {
		if (!user?.id) return;

		const load = async () => {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}chat/conversations?userId=${user.id}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			const data: Conversation[] = await res.json();
			data.forEach((c: any) => {
				if (c.lastMessageObj)
					c.lastSenderId = c.lastMessageObj.senderId;
			});

			setConversations(data);
		};

		load();
	}, [user?.id, token]);

	// ======================================
	// OPEN FROM OUTSIDE
	// ======================================
	useEffect(() => {
		if (!targetUserId) return;

		const conv = conversations.find((c) => c.userId === targetUserId);
		if (conv) {
			setActiveChat(conv);
			openWidget();
			markAsRead();
		}

		clearTarget();
	}, [targetUserId, conversations]);

	// ======================================
	// SCROLL TO BOTTOM
	// ======================================
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// ======================================
	// FORCE READ WHEN OPEN CHAT
	// (Esto hace que las palomitas se vuelvan azul)
	// ======================================
	useEffect(() => {
		if (!activeChat) return;

		// Avisar al back
		markAsRead();

		// Actualizar visualmente
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

	// ======================================
	// SEND MESSAGE
	// ======================================
	const handleSend = () => {
		if (!content.trim()) return;
		sendMessage(content);
		setContent("");
		stopTyping();
	};

	// ======================================
	// TIME FORMAT
	// ======================================
	const formatTime = (t: string) =>
		new Date(t).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});


	// ======================================
	// CHECKMARKS ✓ • ✓✓ • ✓✓ azul
	// ======================================
	const renderTicks = (msg: Message) => {
		// Aún no entregado → ✓ gris
		if (!msg.delivered) {
			return (
				<span className="text-gray-400 text-[11px] select-none">✓</span>
			);
		}

		// Entregado pero NO leído → ✓✓ gris
		if (msg.delivered && !msg.read) {
			return (
				<span className="text-gray-500 text-[11px] select-none">✓✓</span>
			);
		}

		// Leído → ✓✓ azul
		return (
			<span className="text-blue-500 font-semibold text-[11px] select-none">
				✓✓
			</span>
		);
	};

	// ======================================
	// BUBBLE STYLES
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
					style={{
						borderBottomRightRadius: mine ? "4px" : "20px",
						borderBottomLeftRadius: mine ? "20px" : "4px",
					}}
				>
					<div>{msg.content}</div>

					{/* Hora + palomitas */}
					<div className="mt-1 flex justify-end gap-1 text-[10px] opacity-80">
						{formatTime(msg.time)}
						{mine && renderTicks(msg)}
					</div>
				</div>
			</div>
		);
	};

	// ======================================
	// INBOX LIST
	// ======================================
	const renderInbox = () => (
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
						setActiveChat(c);
						markAsRead(); // importante
					}}
				>
					{/* FOTO */}
					{c.user?.profilePicture ? (
						<img
							src={c.user.profilePicture}
							className="w-10 h-10 rounded-full object-cover"
						/>
					) : (
						<div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
							<FontAwesomeIcon icon={faUser} className="text-gray-600" />
						</div>
					)}

					{/* NOMBRE + LAST MESSAGE */}
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

					{/* HORA */}
					<div className="text-[11px] text-gray-400">{formatTime(c.time)}</div>
				</div>
			))}
		</div>
	);

	// ======================================
	// CHAT VIEW
	// ======================================
	const renderChat = () => (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div
				className="flex items-center gap-2 px-3 border-b bg-gray-100"
				style={{ height: "54px", flexShrink: 0 }}
			>
				<button onClick={() => setActiveChat(null)}>
					<FontAwesomeIcon icon={faChevronLeft} className="text-gray-600" />
				</button>

				{partner?.profilePicture ? (
					<img
						src={partner.profilePicture}
						className="w-8 h-8 rounded-full object-cover"
					/>
				) : (
					<div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
						<FontAwesomeIcon icon={faUser} className="text-gray-600" />
					</div>
				)}

				<div className="font-medium text-sm">
					{partner ? `${partner.names} ${partner.surnames}` : "Usuario"}
				</div>
			</div>

			{/* Mensajes */}
			<div className="flex-1 overflow-y-auto px-3 py-3 space-y-0 min-h-0">
				{messages.map((msg) => (
					<Bubble key={msg.id} msg={msg} />
				))}

				{typing && (
					<div className="text-sm text-gray-600 ml-1">escribiendo...</div>
				)}

				<div ref={bottomRef} />
			</div>

			{/* INPUT */}
			<div
				className="flex items-center gap-2 px-3 border-t bg-white rounded-b-xl"
				style={{ height: "56px", flexShrink: 0 }}
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
			{/* Botón flotante */}
			{!open && !minimized && (
				<button
					onClick={() => openWidget()}
					className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:scale-110 transition"
				>
					<FontAwesomeIcon icon={faComments} />
				</button>
			)}

			{/* Widget */}
			{open && (
				<div
					className="fixed bottom-2 right-6 bg-white shadow-lg border rounded-xl flex flex-col z-50"
					style={{ width: "24rem", height: "36rem" }}
				>
					<div
						className="flex items-center justify-between px-4 bg-primary text-white rounded-t-xl"
						style={{ height: "50px", flexShrink: 0 }}
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
