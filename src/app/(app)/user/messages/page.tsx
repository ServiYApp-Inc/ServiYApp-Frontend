"use client";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

const users = [
  {
    id: 1,
    name: "Carla Gómez",
    message: "Hola! ¿Podrías venir mañana para retoque de uñas?",
    time: "09:45",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    status: "online",
  },
  {
    id: 2,
    name: "Sofía Morales",
    message: "Gracias por el maquillaje del sábado, ¡me encantó!",
    time: "08:20",
    avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    unread: 2,
  },
  {
    id: 3,
    name: "Luciana Pérez",
    message: "Confirmo el turno para el viernes a las 18:00.",
    time: "Ayer",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
  },
  {
    id: 4,
    name: "Camila Torres",
    message: "Hola! ¿Podrías mandarme tus horarios para la semana?",
    time: "Lun",
    avatar: "https://randomuser.me/api/portraits/women/67.jpg",
    unread: 1,
  },
  {
    id: 5,
    name: "Valentina Ruiz",
    message: "Perfecto, nos vemos mañana 💅",
    time: "Dom",
    avatar: "https://randomuser.me/api/portraits/women/56.jpg",
    status: "online",
  },
];

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fff5f5] p-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-semibold text-[#d93c5c]">Mensajes</h1>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-[#f0d7db] text-sm text-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-[#d93c5c]/30 bg-white/70 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/user/messages/${user.id}`}
            className="relative flex items-center p-4 rounded-2xl shadow-md bg-white/70 backdrop-blur-sm 
                       border border-[#f0d7db] transition-transform hover:scale-[1.02] 
                       hover:shadow-lg cursor-pointer"
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <Image
                src={user.avatar}
                alt={user.name}
                width={56}
                height={56}
                className="rounded-full object-cover"
              />
              {user.status === "online" && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            {/* Nombre y mensaje */}
            <div className="ml-4 flex-1 overflow-hidden">
              <h2 className="text-lg font-medium text-gray-800 truncate">{user.name}</h2>
              <p className="text-gray-500 text-sm truncate">{user.message}</p>
            </div>

            {/* Hora y mensajes no leídos */}
            <div className="flex flex-col items-end ml-3">
              <p className="text-xs text-gray-400">{user.time}</p>
              {user.unread && (
                <span
                  className="mt-1 inline-flex items-center justify-center bg-blue-500 text-white 
                             text-xs font-bold rounded-full w-5 h-5"
                >
                  {user.unread}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
