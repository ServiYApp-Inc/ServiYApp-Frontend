"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { useChatWidgetStore } from "@/app/store/chatWidget.store";
import { Api } from "@/app/services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faComments,
	faUser,
	faChevronLeft,
	faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { useChatSocket } from "@/app/(app)/app-services/useChatSocket";

// =========================================================
// TYPES
// =========================================================
interface Conversation {
	userId: string;
	lastMessage: string;
	lastSenderId?: string;
	time: string;
	read: boolean;
	delivered?: boolean;
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

// =========================================================
// COMPONENT
// =========================================================
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
	// const [unread, setUnread] = useState<Record<string, number>>({});
	const [activeChat, setActiveChat] = useState<Conversation | null>(null);
	const [content, setContent] = useState("");

	const bottomRef = useRef<HTMLDivElement>(null);

	// SOCKET HOOK
	const {
		messages,
		partner,
		typing,
		loading,
		online,
		lastSeen,
		sendMessage,
		sendTyping,
		stopTyping,
		markAsRead,
	} = useChatSocket(
		activeChat ? user?.id || "" : "",
		activeChat ? activeChat.userId : ""
	);

	// =========================================================
	// CARGAR INBOX
	// =========================================================
	useEffect(() => {
		if (!user?.id) return;

		const load = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}chat/conversations?userId=${user.id}`,
					{ headers: { Authorization: `Bearer ${token}` } }
				);

				const data: Conversation[] = await res.json();

				data.forEach((c: any) => {
					if (c.lastMessageObj) c.lastSenderId = c.lastMessageObj.senderId;
				});

				setConversations(data);

				// 🔴 NOTIFICACIONES DESACTIVADAS
				/*
				const unreadMap: Record<string, number> = {};
				data.forEach((c) => {
					if (!c.read) unreadMap[c.userId] = (unreadMap[c.userId] || 0) + 1;
				});
				setUnread(unreadMap);
				*/
			} catch (err) {
				console.error("Error cargando conversaciones:", err);
			}
		};

		load();
	}, [user?.id, token]);

	// =========================================================
	// ABRIR CHAT EXTERNO
	// =========================================================
	useEffect(() => {
		if (!targetUserId) return;

		const conv = conversations.find((c) => c.userId === targetUserId);
		if (conv) {
			openChat(conv);
			openWidget();
		}

		clearTarget();
	}, [targetUserId, conversations]);

	// =========================================================
	// ABRIR CHAT
	// =========================================================
	const openChat = (conv: Conversation) => {
		setActiveChat(conv);

		// 🔴 NOTIFICACIONES DESACTIVADAS
		// setUnread((prev) => ({ ...prev, [conv.userId]: 0 }));

		markAsRead();
	};

	// =========================================================
	// SCROLL AUTO
	// =========================================================
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// =========================================================
	// ENVIAR MENSAJE
	// =========================================================
	const handleSend = () => {
		if (!content.trim()) return;
		sendMessage(content);
		setContent("");
		stopTyping();
	};

	// =========================================================
	// ✓✓ CHECKS
	// =========================================================
	const renderTicks = (msg: Message) => {
		if (msg.read) return <span className="text-blue-400 text-xs">✓✓</span>;
		if (msg.delivered) return <span className="text-gray-500 text-xs">✓✓</span>;
		return <span className="text-gray-400 text-xs">✓</span>;
	};

	// =========================================================
	// HORA
	// =========================================================
	const formatTime = (t: string) =>
		new Date(t).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});

	// 🔴 NOTIFICACIONES DESACTIVADAS
	// const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

	// =========================================================
	// RENDER
	// =========================================================
	return (
		<>
			{/* BOTÓN FLOTANTE */}
			{!open && !minimized && (
				<button
					onClick={() => openWidget()}
					className="fixed bottom-6 right-6 bg-primary text-white rounded-full shadow-xl hover:scale-110 transition-all duration-300 p-4 animate-[fadeInUp_.3s]"
				>
					<FontAwesomeIcon icon={faComments} size="lg" />

					{/* 🔴 DESACTIVADO */}
					{/*
					{totalUnread > 0 && (
						<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
							{totalUnread}
						</span>
					)}
					*/}
				</button>
			)}

			{/* WIDGET */}
			{open && (
				<div className="fixed bottom-2 right-6 w-80 h-[32rem] bg-white shadow-lg border rounded-xl overflow-hidden z-50 flex flex-col animate-[fadeIn_.25s]">
					{/* HEADER */}
					<div className="bg-primary text-white p-2 flex justify-between items-center">
						<span className="font-medium text-sm">
							{activeChat ? "Chat" : "Mensajes"}
						</span>

						<button onClick={closeWidget}>
							<FontAwesomeIcon icon={faXmark} />
						</button>
					</div>

					{/* INBOX */}
					{!activeChat && (
						<div className="flex-1 overflow-y-auto p-3 space-y-2 animate-[fadeIn_.2s]">
							{conversations.length === 0 ? (
								<p className="text-gray-500 text-center mt-10">
									No tienes mensajes.
								</p>
							) : (
								conversations.map((c) => (
									<div
										key={c.userId}
										onClick={() => openChat(c)}
										className="p-2 border rounded-lg flex items-center justify-between hover:bg-gray-50 cursor-pointer"
									>
										{/* FOTO */}
										{c.user?.profilePicture ? (
											<img
												src={c.user.profilePicture}
												className="w-10 h-10 rounded-full object-cover"
											/>
										) : (
											<div className="w-10 h-10 bg-gray-200 rounded-full flex justify-center items-center">
												<FontAwesomeIcon icon={faUser} />
											</div>
										)}

										<div className="ml-3 flex-1">
											<p className="font-semibold text-sm">
												{c.user
													? `${c.user.names} ${c.user.surnames}`
													: c.userId}
											</p>
											<p className="text-xs text-gray-500 truncate w-40">
												{c.lastMessage}
											</p>
										</div>

										<div className="text-right">
											<span className="text-[11px] text-gray-400">
												{formatTime(c.time)}
											</span>

											{/* 🔴 DESACTIVADO */}
											{/*
											{unread[c.userId] > 0 && (
												<span className="block bg-red-500 text-white text-xs px-2 py-0.5 rounded-full mt-1">
													{unread[c.userId]}
												</span>
											)}
											*/}
										</div>
									</div>
								))
							)}
						</div>
					)}

					{/* CHAT */}
					{activeChat && (
						<div className="flex flex-col h-full animate-[fadeIn_.2s]">
							{/* SUBHEADER */}
							<div className="p-3 bg-gray-100 border-b flex items-center gap-2">
								<button onClick={() => setActiveChat(null)}>
									<FontAwesomeIcon icon={faChevronLeft} className="text-gray-600" />
								</button>

								{/* FOTO */}
								{partner?.profilePicture ? (
									<img
										src={partner.profilePicture}
										className="w-8 h-8 rounded-full object-cover"
									/>
								) : (
									<div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
										<FontAwesomeIcon icon={faUser} className="text-gray-500" />
									</div>
								)}

								{/* NOMBRE */}
								<div className="flex flex-col">
									<span className="font-medium text-sm">
										{partner
											? `${partner.names} ${partner.surnames}`
											: activeChat?.userId}
									</span>
								</div>

								{typing && (
									<span className="text-[10px] text-green-600 ml-2">
										escribiendo...
									</span>
								)}
							</div>

							{/* MENSAJES */}
							<div className="flex-1 overflow-y-auto p-4 space-y-2">
								{messages.map((msg) => {
									const mine = msg.senderId === user?.id;

									return (
										<div
											key={msg.id}
											className={`mb-1 ${mine ? "text-right" : ""} animate-[fadeIn_.2s]`}
										>
											<div
												className={`max-w-[70%] px-3 py-2 rounded-lg text-sm shadow-sm ${
													mine
														? "bg-primary text-white ml-auto"
														: "bg-gray-100 border"
												}`}
											>
												{msg.content}

												<div className="mt-1 flex justify-end items-center gap-2 opacity-80 text-[10px]">
													{formatTime(msg.time)}
													{mine && renderTicks(msg)}
												</div>
											</div>
										</div>
									);
								})}

								{typing && (
									<div className="text-xs text-gray-400 italic animate-pulse">
										escribiendo...
									</div>
								)}

								<div ref={bottomRef} />
							</div>

							{/* INPUT */}
							<div className="p-3 border-t flex gap-2">
								<input
									value={content}
									onChange={(e) => {
										setContent(e.target.value);
										sendTyping();
									}}
									onBlur={stopTyping}
									placeholder="Escribe..."
									className="flex-1 border rounded-lg px-3 py-1 text-sm shadow-inner"
								/>

								<button
									onClick={handleSend}
									className="bg-primary text-white px-3 py-1 rounded-lg text-sm hover:bg-primary-hover transition-all duration-200"
								>
									Enviar
								</button>
							</div>
						</div>
					)}
				</div>
			)}
		</>
	);
}
