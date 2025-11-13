"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { getConversations } from "../../app-services/chatService";

interface Conversation {
	id: string;
	lastMessage?: string;
	updatedAt?: string;
	partner: {
		id: string;
		name: string;
		avatar?: string;
		status?: string;
	};
	unreadCount?: number;
}

export default function MessagesPage() {
	const { user, token } = useAuthStore();
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchConversations = async () => {
			try {
				if (!user?.id || !token) return;
				const data = await getConversations(user.id, token);
				setConversations(data);
			} catch (error) {
				console.error("❌ Error cargando conversaciones:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchConversations();
	}, [user?.id]);

	// 🟢 Filtrado inteligente: busca por nombre o por el contenido del último mensaje
	const filtered = conversations.filter((c) => {
		const searchLower = search.toLowerCase();
		return (
			c.partner?.name?.toLowerCase().includes(searchLower) ||
			c.lastMessage?.toLowerCase().includes(searchLower)
		);
	});

	// ✨ Función para resaltar coincidencias en el texto
	const highlightText = (text: string = "", query: string) => {
		if (!query) return text;
		const regex = new RegExp(`(${query})`, "gi");
		const parts = text.split(regex);
		return parts.map((part, i) =>
			part.toLowerCase() === query.toLowerCase() ? (
				<span key={i} className="bg-yellow-200 rounded px-1">
					{part}
				</span>
			) : (
				part
			)
		);
	};

	return (
		<div className="min-h-screen p-6" style={{ backgroundColor: "var(--background)" }}>
			{/* 🔝 Encabezado */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
				<div>
					<h1 className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>
						Mensajes
					</h1>
					{search && (
						<p className="text-sm text-gray-500 mt-1">
							{filtered.length} resultado{filtered.length !== 1 && "s"} encontrados
						</p>
					)}
				</div>

				{/* 🔍 Buscador */}
				<div className="relative w-full sm:w-64">
					<Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Buscar por nombre o mensaje..."
						className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 
							focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 bg-white shadow-sm"
					/>
				</div>
			</div>

			{/* 💬 Contenido */}
			{loading ? (
				<p className="text-center text-gray-500 mt-12">Cargando conversaciones...</p>
			) : filtered.length === 0 ? (
				<p className="text-center text-gray-400 mt-12">
					{search ? "No se encontraron coincidencias." : "Aún no tienes conversaciones."}
				</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{filtered.map((conv) => (
						<Link
							key={conv.id}
							href={`/user/messages/${conv.partner.id}`}
							className="relative flex items-center p-4 rounded-2xl shadow-md bg-white 
								border border-gray-200 transition-transform hover:scale-[1.02] hover:shadow-lg cursor-pointer"
						>
							{/* 🖼️ Avatar */}
							<div className="relative shrink-0">
								<Image
									src={
										conv.partner.avatar ||
										"https://cdn-icons-png.flaticon.com/512/149/149071.png"
									}
									alt={conv.partner.name}
									width={56}
									height={56}
									className="rounded-full object-cover"
								/>
								{conv.partner.status === "online" && (
									<span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
								)}
							</div>

							{/* 🧾 Info del contacto */}
							<div className="ml-4 flex-1 overflow-hidden">
								<h2
									className="text-lg font-semibold truncate"
									style={{ color: "var(--color-primary)" }}
								>
									{highlightText(conv.partner.name, search)}
								</h2>
								<p className="text-sm text-gray-500 truncate">
									{conv.lastMessage
										? highlightText(conv.lastMessage, search)
										: "Sin mensajes aún"}
								</p>
							</div>

							{/* 🕒 Fecha + contador */}
							<div className="flex flex-col items-end ml-3">
								<p className="text-xs text-gray-400">
									{conv.updatedAt
										? new Date(conv.updatedAt).toLocaleDateString("es-MX", {
												day: "2-digit",
												month: "short",
										  })
										: ""}
								</p>
								{conv.unreadCount && conv.unreadCount > 0 && (
									<span
										className="mt-1 inline-flex items-center justify-center bg-[var(--color-primary)] text-white 
											text-xs font-bold rounded-full w-5 h-5"
									>
										{conv.unreadCount}
									</span>
								)}
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}

// ----- HAY QUE AJUSTAR SEGÚN EL FORMATO QUE DEVUELVE EL BACK -----
// [
//   {
//     "id": "b21f...a9",
//     "lastMessage": "Nos vemos mañana 💅",
//     "updatedAt": "2025-11-12T19:22:00Z",
//     "unreadCount": 1,
//     "partner": {
//       "id": "1234",
//       "name": "Camila Torres",
//       "avatar": "https://randomuser.me/api/portraits/women/67.jpg",
//       "status": "online"
//     }
//   }
// ]
