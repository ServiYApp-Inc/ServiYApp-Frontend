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
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [typingMap, setTypingMap] = useState<Record<string, boolean>>({});

  const bottomRef = useRef<HTMLDivElement>(null);

  // SOCKET
  const {
    socket,
    messages: socketMessages,
    typing,
    sendMessage,
    sendTyping,
    stopTyping,
    markAsRead,
  } = useChatSocket(
    activeChat ? user?.id || "" : "",
    activeChat ? activeChat.userId : ""
  );

  // MERGE seguro de mensajes
  const mergedMessages = [
    ...loadedMessages,
    ...(Array.isArray(socketMessages) ? socketMessages : []),
  ].filter(
    (msg, i, arr) => i === arr.findIndex((m) => m.id === msg.id)
  );

  // ===============================
  // CARGAR CONVERSACIONES
  // ===============================
  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}chat/conversations?userId=${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();

        // Agregamos lastSenderId si viene en el backend
        data.forEach((c: any) => {
          if (c.lastMessageObj) c.lastSenderId = c.lastMessageObj.senderId;
        });

        setConversations(data);

        const unreadMap: Record<string, number> = {};
        data.forEach((c: Conversation) => {
          if (!c.read) unreadMap[c.userId] = (unreadMap[c.userId] || 0) + 1;
        });

        setUnread(unreadMap);
      } catch (err) {
        console.error("Error cargando conversaciones:", err);
      }
    };

    load();
  }, [user?.id, token]);

  // ===============================
  // SOCKET → TYPING
  // ===============================
 
  // ===============================
  // SOCKET → actualización inbox
  // ===============================
  useEffect(() => {
    if (!socketMessages || socketMessages.length === 0) return;

    const lastMsg = socketMessages[socketMessages.length - 1];
    if (!lastMsg) return;

    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.userId === lastMsg.senderId || c.userId === lastMsg.receiverId
          ? {
              ...c,
              lastMessage: lastMsg.content,
              time: lastMsg.time,
              lastSenderId: lastMsg.senderId,
              delivered: lastMsg.delivered,
              read: lastMsg.read,
            }
          : c
      );

      return updated.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      );
    });
  }, [socketMessages]);

  // ===============================
  // targetUserId → abre chat desde botón externo
  // ===============================
  useEffect(() => {
    if (!targetUserId) return;

    const conv = conversations.find((c) => c.userId === targetUserId);
    if (conv) {
      openChat(conv);
      openWidget();
    }

    clearTarget();
  }, [targetUserId, conversations]);

  // ===============================
  // ABRIR CHAT
  // ===============================
  const openChat = async (conv: Conversation) => {
    setActiveChat(conv);
    setUnread((prev) => ({ ...prev, [conv.userId]: 0 }));

    try {
      const res = await Api.get(
        `/chat/messages?userA=${user?.id}&userB=${conv.userId}`
      );

      setLoadedMessages(res.data.messages || []);
      markAsRead();
    } catch (err) {
      console.error("Error cargando chat:", err);
    }
  };

  // AUTO-SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mergedMessages]);

  const handleSend = () => {
    if (!content.trim()) return;
    sendMessage(content);
    setContent("");
    stopTyping();
  };

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

  // PALOMITAS
  const renderTicks = (msg: Message) => {
    if (msg.read) return <span className="text-blue-400 text-xs">✓✓</span>;
    if (msg.delivered) return <span className="text-gray-500 text-xs">✓✓</span>;
    return <span className="text-gray-400 text-xs">✓</span>;
  };

  // FORMATEAR HORA
  const formatTime = (t: string) =>
    new Date(t).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      {/* GLOBITO */}
      {!open && !minimized && (
        <button
          onClick={() => openWidget()}
          className="fixed bottom-6 right-6 bg-primary text-white rounded-full shadow-xl hover:scale-110 transition-all duration-300 p-4 animate-chat-slide-up-fade"
        >
          <FontAwesomeIcon icon={faComments} size="lg" />

          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </button>
      )}

      {/* ===============================
          WIDGET
      =============================== */}
      {open && (
        <div className="fixed bottom-2 right-6 w-80 h-[32rem] bg-white shadow-lg border rounded-xl overflow-hidden z-50 flex flex-col animate-chat-slide-up-fade">

          {/* HEADER */}
          <div className="bg-primary text-white p-2 flex justify-between items-center">
            <span className="font-medium text-sm">
              {activeChat ? "Chat" : "Mis Mensajes"}
            </span>

            <button onClick={() => closeWidget()}>
              <FontAwesomeIcon icon={faXmark} className="text-white" />
            </button>
          </div>

          {/* ===========================
              INBOX
          =========================== */}
          {!activeChat && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {conversations.length === 0 ? (
                <p className="text-gray-500 text-center text-sm mt-10">
                  No tienes mensajes aún.
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
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                    )}

                    {/* NOMBRE + MENSAJE */}
                    <div className="ml-3 flex-1">
                      <p className="font-semibold text-sm">
                        {c.user
                          ? `${c.user.names} ${c.user.surnames}`
                          : c.userId}
                      </p>

                      {/* escribiendo */}
                      {typingMap[c.userId] ? (
                        <p className="text-xs text-green-600 italic">
                          escribiendo...
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 truncate w-40">
                          {c.lastSenderId === user?.id && (
                            <span className="font-semibold mr-1">Tú:</span>
                          )}
                          {c.lastMessage}
                        </p>
                      )}
                    </div>

                    {/* HORA + BADGE */}
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-[11px] text-gray-400">
                        {formatTime(c.time)}
                      </span>

                      {unread[c.userId] > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {unread[c.userId]}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ===========================
              CHAT
          =========================== */}
          {activeChat && (
            <div className="flex flex-col flex-1">

              {/* SUBHEADER */}
              <div className="p-3 bg-gray-100 border-b flex items-center gap-2">
                <button onClick={() => setActiveChat(null)}>
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    className="text-gray-600"
                  />
                </button>

                {activeChat.user?.profilePicture ? (
                  <img
                    src={activeChat.user.profilePicture}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="text-gray-500" />
                  </div>
                )}

                <span className="font-medium text-sm">
                  {activeChat.user
                    ? `${activeChat.user.names} ${activeChat.user.surnames}`
                    : activeChat.userId}
                </span>
              </div>

              {/* MENSAJES */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {mergedMessages.map((msg) => {
                  const mine = msg.senderId === user?.id;

                  return (
                    <div key={msg.id} className="mb-1">
                      <div
                        className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                          mine
                            ? "bg-primary text-white ml-auto"
                            : "bg-gray-100"
                        }`}
                      >
                        {msg.content}

                        {/* PALOMITAS DENTRO */}
                        <span className="ml-2">
                          {renderTicks(msg)}
                        </span>
                      </div>
                    </div>
                  );
                })}

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
                  className="flex-1 border rounded-lg px-3 py-1 text-sm"
                />

                <button
                  onClick={handleSend}
                  className="bg-primary text-white px-3 py-1 rounded-lg text-sm"
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
