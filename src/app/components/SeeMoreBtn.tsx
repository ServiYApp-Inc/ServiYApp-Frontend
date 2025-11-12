"use client";

import Link from "next/link";
import { useAuthStore } from "../store/auth.store";

export default function SeeMoreBtn({ id }: { id: string }) {
	const { role } = useAuthStore();

	const roleLabel =
		role === "admin"
			? "Administrador"
			: role === "provider"
			? "Proveedor"
			: "Usuario";

	const getBasePath = () => {
		if (role === "admin") return "/admin";
		if (role === "provider") return "/provider";
		return "/user";
	};

	const basePath = getBasePath();


	return (
		<Link href={`${basePath}/services/${id}`}>
			<span className="bg-[var(--color-primary)] px-3 py-1 rounded-lg text-white hover:scale-[1.05] hover:bg-[var(--color-primary-hover)] transition">
				Ver más
			</span>
		</Link>
	);
}
