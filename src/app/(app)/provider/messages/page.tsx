"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import { getConversations } from "@/app/(app)/app-services/chatService";

interface Conversation {
	userId: string;
	lastMessage: string;
	time: string;
}

export default function ConversationsPage() {
	const { user } = useAuthStore();
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const router = useRouter();

	useEffect(() => {
		if (!user?.id) return;

		const load = async () => {
			const data = await getConversations(user.id);
			setConversations(data);
		};

		load();
	}, [user?.id]);

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="p-4 flex flex-col gap-4">
			<h2 className="text-xl font-semibold">Tus mensajes</h2>

			<div className="flex flex-col gap-2">
				{conversations.map((c) => (
					<div
						key={c.userId}
						onClick={() =>
							router.push(`/provider/messages/${c.userId}`)
						}
						className="p-3 bg-white rounded-lg border flex justify-between items-center cursor-pointer hover:bg-gray-50"
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
								{c.userId[0].toUpperCase()}
							</div>
							<div>
								<p className="font-semibold">{c.userId}</p>
								<p className="text-sm text-gray-500 truncate w-40">
									{c.lastMessage}
								</p>
							</div>
						</div>

						<span className="text-xs text-gray-400">
							{formatDate(c.time)}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
