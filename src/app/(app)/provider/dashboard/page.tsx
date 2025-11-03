"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileItem from "@/app/components/ProfileItem";

/*-- iconos --*/
import { faBell, faCalendar, faHeart, faStar, faUser } from "@fortawesome/free-regular-svg-icons";
import { faAddressBook, faBookTanakh, faCalendarDay, faCalendarDays, faCalendarPlus, faGear } from "@fortawesome/free-solid-svg-icons";

export default function ProviderDashboard() {
	const router = useRouter();

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get("token");
		const id = params.get("id");

		if (token) localStorage.setItem("access_token", token);
		if (id) localStorage.setItem("provider_id", id);
	}, []);

	return (
		<main className="max-w-4xl  mt-8">
			<h1 className="text-[48px] font-bold text-[var(--color-primary)] mb-6">Dashboard <strong>Proveedor</strong></h1>
			{/* Contenedor Información del USUARIO */}
			<div className="bg-[var(--color-primary)] p-6 rounded-3xl text-white flex flex-col gap-8">
				<div className="flex flex-col md:flex-row items-center gap-6">
					<img
						src="https://i.pravatar.cc/40?img=3"
						alt="User profilePicture"
						className="w-[130px] h-[130px] rounded-full border border-2 border-white object-cover"
					/>
					<div>
						<h3 className="font-bold text-[36px]">Juan Perez</h3>
						<h5 className="font-Medium text-[24px]">juanperez@gmail.com</h5>
					</div>
				</div>
				<span className="flex flex-col md:flex-row justify-around">
					<div className="flex flex-col items-center gap-1">
						<p className="text-[36px] font-regular">5</p>
						<h5 className="text-[24px] font-regular">Servicios Activos</h5>
					</div>
					<div className="flex flex-col items-center gap-1">
						<p className="text-[36px] font-regular">15</p>
						<h5 className="text-[24px] font-regular">Turnos Reservados</h5>
					</div>
					<div className="flex flex-col items-center gap-1">
						<p className="text-[36px] font-regular">25</p>
						<h5 className="text-[24px] font-regular">Reseñas</h5>
					</div>
				</span>
			</div>
			{/* Contenedor de Items del perfil, Todavia no tienen funcionalidad, ni Link */}
			<div className="flex flex-col lg:flex-row justify-around gap-4 mt-8 w-[100%]">
				<div className="flex flex-col gap-6 bg-white w-full p-6 rounded-3xl text-[var(--color-primary)] border border-[#949492]">
					<ProfileItem icon={faCalendarPlus} label="Administrador de Turnos" />
					<ProfileItem icon={faAddressBook} label="Reseñas a Clientes" />
					<ProfileItem icon={faBookTanakh} label="Mis reseñas" />
				</div>
				<div className="flex flex-col gap-6 bg-white w-full p-6 rounded-3xl text-[var(--color-primary)] border border-[#949492]">
					<ProfileItem icon={faCalendarDays} label="Historial de servicios" />
					<ProfileItem icon={faBell} label="Notificaciones" />
					<ProfileItem icon={faGear} label="Configuración" />
				</div>
			</div>
			{/* Este button probablemente sea un component "use client" */}
			<button className="text-[20px] font-medium mt-4 px-4 py-1 bg-white rounded-lg border border-[#949492] hover:bg-[var(--color-background)]">Cerrar Sesión</button>
		</main>
	);
}
