"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/auth.store";
import { toast } from "react-toastify";

interface LogoutButtonProps {
	isCollapsed?: boolean;
}

export default function LogoutButton({ isCollapsed }: LogoutButtonProps) {
	const router = useRouter();
	const { clearCart } = useCartStore();
	const { clearAuth } = useAuthStore();

	const handleLogout = () => {
		clearCart();
		clearAuth();
		toast.dismiss();

		router.push("/");
	};

	return (
		<button
			onClick={handleLogout}
			className="flex items-center justify-center w-full gap-2 py-2 text-sm font-medium rounded-lg transition-colors"
			style={{
				border: "1px solid var(--color-primary)",
				color: "var(--color-primary)",
				backgroundColor: "var(--color-bg-light)",
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.backgroundColor = "var(--color-primary)";
				e.currentTarget.style.color = "white";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.backgroundColor = "var(--color-bg-light)";
				e.currentTarget.style.color = "var(--color-primary)";
			}}
		>
			<FontAwesomeIcon icon={faPowerOff} className="text-base" />
			{!isCollapsed && <span>Cerrar sesión</span>}
		</button>
	);
}
