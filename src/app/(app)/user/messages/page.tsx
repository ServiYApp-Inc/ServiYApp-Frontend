"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

interface ChatConversation {
	userId: string; // ID del otro usuario
	lastMessage: string;
	time: string;
	read: boolean;
	user?: {
		id: string;
		names: string;
		surnames: string;
		profilePicture?: string;
	};
}

export default function UserMessagesPage() {
	const { user, token } = useAuthStore();
	const router = useRouter();

	const [conversations, setConversations] = useState<ChatConversation[]>([]);
	const [unread, setUnread] = useState<Record<string, number>>({});

	// =============================
	// 🔵 FETCH conversaciones
	// =============================
	useEffect(() => {
		if (!user?.id) return;

		const fetchConversations = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}chat/conversations?userId=${user.id}`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);

				const data = await res.json();

				setConversations(Array.isArray(data) ? data : []);

				// Crear mapa de no leídos
				const unreadMap: Record<string, number> = {};
				(Array.isArray(data) ? data : []).forEach((c) => {
					if (!c.read)
						unreadMap[c.userId] = (unreadMap[c.userId] || 0) + 1;
				});

				setUnread(unreadMap);
			} catch (error) {
				console.error("Error al cargar conversaciones:", error);
			}
		};

		fetchConversations();
	}, [user?.id, token]);

	// =============================
	// Utilidad hora
	// =============================
	const formatHora = (time: string) => {
		return new Date(time).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (!user) return <div>Cargando...</div>;

	return (
		<main className="px-6 py-10 max-w-2xl mx-auto">
			<h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
				Mensajes
			</h1>

			<div className="flex flex-col gap-3">
				{conversations.length === 0 ? (
					<p className="text-gray-500 text-center mt-10">
						No tienes conversaciones aún.
					</p>
				) : (
					conversations.map((c) => (
						<div
							key={c.userId}
							onClick={() => {
								setUnread((prev) => ({
									...prev,
									[c.userId]: 0,
								}));
								router.push(`/user/messages/${c.userId}`);
							}}
							className="bg-white border rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
						>
							{/* LEFT */}
							<div className="flex items-center gap-3">
								{/* FOTO */}
								{c.user?.profilePicture ? (
									<img
										src={c.user.profilePicture}
										className="w-12 h-12 rounded-full object-cover"
									/>
								) : (
									<div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
										<FontAwesomeIcon
											icon={faUser}
											className="text-gray-500 w-6 h-6"
										/>
									</div>
								)}

								<div>
									<p className="font-semibold text-sm">
										{c.user
											? `${c.user.names} ${c.user.surnames}`
											: c.userId}
									</p>

									<p className="text-xs text-gray-500 w-44 truncate">
										{c.lastMessage}
									</p>
								</div>
							</div>

							{/* RIGHT */}
							<div className="flex flex-col items-end gap-1">
								<span className="text-[11px] text-gray-400">
									{formatHora(c.time)}
								</span>

								{unread[c.userId] > 0 && (
									<span className="bg-red-500 text-white px-2 py-0.5 text-[10px] rounded-full">
										{unread[c.userId]}
									</span>
								)}
							</div>
						</div>
					))
				)}
			</div>
		</main>
	);
}
