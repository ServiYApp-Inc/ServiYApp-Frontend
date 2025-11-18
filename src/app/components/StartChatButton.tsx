"use client";

import { useChatWidgetStore } from "@/app/store/chatWidget.store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";

export default function StartChatButton({
	receiverId,
}: {
	receiverId: string;
}) {
	const openWidget = useChatWidgetStore((s) => s.openWidget);

	const handleOpenChat = () => {
		openWidget(receiverId); // 👉 directo al store, sin hacks
	};

	return (
		<button
			onClick={handleOpenChat}
			className="w-11 h-11 flex items-center justify-center 
        text-[var(--color-primary)]
        hover:scale-110 transition-all duration-200"
			title="Enviar mensaje"
		>
			<FontAwesomeIcon icon={faCommentDots} className="w-5 h-5" />
		</button>
	);
}
