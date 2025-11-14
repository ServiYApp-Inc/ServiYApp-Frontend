"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";

interface StartChatButtonProps {
	receiverId: string;
	role: "provider" | "user";
}

export default function StartChatButton({
	receiverId,
	role,
}: StartChatButtonProps) {
	const router = useRouter();

	const handleStartChat = () => {
		if (role === "provider") {
			router.push(`/provider/messages/${receiverId}`);
		} else {
			router.push(`/user/messages/${receiverId}`);
		}
	};

	return (
		<button
			onClick={handleStartChat}
			className="text-[var(--color-primary)]"
			title="Iniciar chat"
		>
			<FontAwesomeIcon icon={faComments} />
		</button>
	);
}
