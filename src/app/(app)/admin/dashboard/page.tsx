"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
	const router = useRouter();

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get("token");
		const id = params.get("id");

		if (token) localStorage.setItem("access_token", token);
		if (id) localStorage.setItem("provider_id", id);
	}, []);

	return (
		<div>
			<h1>Bienvenido al dashboard del administrador</h1>
			{/* Aquí renderizas tus servicios, citas, etc */}
		</div>
	);
}
