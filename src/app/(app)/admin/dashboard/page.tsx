"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileItem from "@/app/components/ProfileItem";

/*-- iconos --*/
import { faBell, faCalendar, faHeart, faStar, faUser } from "@fortawesome/free-regular-svg-icons";
import { faBook, faGear, faTag, faTags, faUsersGear } from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "@/app/store/auth.store";
import Swal from "sweetalert2";
import IService from "@/app/interfaces/IService";
import { getAllAdminServices } from "../../provider/serviceRegister/service.service";

export default function AdminDashboard() {
	const router = useRouter();
	const {user, clearAuth} = useAuthStore();

	const [services, setServices] = useState<IService[]>([]);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get("token");
		const id = params.get("id");

		if (token) localStorage.setItem("access_token", token);
		if (id) localStorage.setItem("provider_id", id);
	}, []);


	const fetchServices = async () => {
		try {
			const data = await getAllAdminServices();
			setServices(data);
		} catch (error) {
			console.error("Error al obtener servicios:", error);
		}
	}

	useEffect(() => {
		fetchServices();
	}, [])

	const servicesActives = services.filter((s)=> s.status === "active");
	const servicesPendings = services.filter((s)=> s.status === "pending");
	const servicesDesactives = services.filter((s)=> s.status === "inactive");

		// 🔴 Logout con confirmación
	const handleLogout = async () => {
		const result = await Swal.fire({
			title: "¿Cerrar sesión?",
			html: `<p style="font-size:14px; color:#555; margin-top:6px;">
				Se cerrará tu sesión actual y volverás al inicio.
			</p>`,
			icon: "warning",
			iconColor: "#1D2846",
			width: 360,
			padding: "1.2rem",
			showCancelButton: true,
			focusCancel: true,
			reverseButtons: true,
			background: "#fff",
			color: "#1D2846",
			confirmButtonText: "Sí, cerrar",
			cancelButtonText: "Cancelar",
			confirmButtonColor: "#1D2846",
			cancelButtonColor: "#d33",
			customClass: {
				popup: "rounded-2xl shadow-lg",
				title: "text-base font-semibold",
				confirmButton: "px-4 py-2 rounded-lg text-sm font-medium",
				cancelButton: "px-4 py-2 rounded-lg text-sm font-medium",
				icon: "scale-75",
			},
		});

		if (result.isConfirmed) {
			clearAuth();
			router.push("/");
		}
	};

	return (
		<main className="max-w-4xl  mt-8">
			<h1 className="text-[48px] font-bold text-[var(--color-primary)] mb-6">Dashboard <strong>Adiministrador</strong></h1>
			{/* Contenedor Información del USUARIO */}
			<div className="bg-[var(--color-primary)] p-6 rounded-3xl text-white flex flex-col gap-8">
				<div className="flex flex-col md:flex-row items-center gap-6">
					<img
						src={user?.profilePicture}
						alt="Foto de Perfil"
						className="w-[130px] h-[130px] rounded-full border border-2 border-white object-cover"
					/>
					<div>
						<h3 className="font-bold text-[36px]">{user?.names}, {user?.surnames}</h3>
						<h5 className="font-Medium text-[24px]">{user?.email}</h5>
					</div>
				</div>
				<span className="flex flex-col md:flex-row justify-around">
					<div className="flex flex-col items-center gap-1">
						<p className="text-[36px] font-regular">{servicesActives.length}</p>
						<h5 className="text-[24px] font-regular">Servicios Activos</h5>
					</div>
					<div className="flex flex-col items-center gap-1">
						<p className="text-[36px] font-regular">{servicesDesactives.length}</p>
						<h5 className="text-[24px] font-regular">Servicios Desactivados</h5>
					</div>
					<div className="flex flex-col items-center gap-1">
						<p className="text-[36px] font-regular">{servicesPendings.length}</p>
						<h5 className="text-[24px] font-regular">En Espera</h5>
					</div>
				</span>
			</div>
			{/* Contenedor de Items del perfil, Todavia no tienen funcionalidad, ni Link */}
			<div className="flex flex-col lg:flex-row justify-around gap-4 mt-8 w-[100%]">
				<div className="flex flex-col gap-6 bg-white w-full p-6 rounded-3xl text-[var(--color-primary)] border border-[#949492]">
					<ProfileItem icon={faUsersGear} label="Administracion de Perfiles" />
					<ProfileItem path="admin/dashboard/categories" icon={faTags} label="Administrar Categorías" />
					<ProfileItem icon={faBook} label="Mis Anotaciones" />
				</div>
				<div className="flex flex-col gap-6 bg-white w-full p-6 rounded-3xl text-[var(--color-primary)] border border-[#949492]">
					<ProfileItem icon={faCalendar} label="Historial de servicios" />
					<ProfileItem icon={faBell} label="Notificaciones" />
					<ProfileItem icon={faGear} label="Configuración" />
				</div>
			</div>
			{/* Este button probablemente sea un component "use client" */}
			<button onClick={handleLogout} className="text-[20px] font-medium mt-4 px-4 py-1 bg-white rounded-lg border border-[#949492] hover:bg-[var(--color-background)]">Cerrar Sesión</button>
		</main>
	);
}
