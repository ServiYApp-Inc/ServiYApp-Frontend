"use client";
/*-- Componentes --*/
import ProfileItem from "@/app/components/ProfileItem";
import { useAuthStore } from "@/app/store/auth.store";

/*-- iconos --*/
import { faBell, faCalendar, faHeart, faStar, faUser } from "@fortawesome/free-regular-svg-icons";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
	const { user, clearAuth } = useAuthStore();

	const router = useRouter();

		const handleLogout = () => {
		clearAuth();
		router.push("/");
	};

	return (
		<main className="max-w-4xl  mt-8">
			<h1 className="text-[48px] font-bold text-[var(--color-primary)] mb-6">Perfil</h1>
			{/* Contenedor Información del USUARIO */}
			<div className="bg-[var(--color-primary)] p-6 rounded-3xl text-white flex flex-col gap-8">
				<div className="flex flex-col md:flex-row items-center gap-6">
					{user?.profilePicture ? (
                    <img
                        src={user.profilePicture}
                        alt="User profile"
                        className="w-[130px] h-[130px] rounded-full border-2 border-white object-cover"
                    />
                ) : (
                    <div className="w-[130px] h-[130px] rounded-full border-2 border-white flex items-center justify-center bg-gray-200">
                        <FontAwesomeIcon icon={faUser} className="text-4xl text-gray-400" />
                    </div>
                )}
					<div>
						<h3 className="font-bold text-[36px]">{user?.names} {user?.surnames}</h3>
						<h5 className="font-Medium text-[24px]">{user?.email}</h5>
					</div>
				</div>
				<span className="flex flex-col md:flex-row justify-around">
					<div className="flex flex-col items-center gap-1">
						<p className="text-[36px] font-regular">10</p>
						<h5 className="text-[24px] font-regular">Servicios</h5>
					</div>
					<div className="flex flex-col items-center gap-1">
						<p className="text-[36px] font-regular">10</p>
						<h5 className="text-[24px] font-regular">Favoritos</h5>
					</div>
					<div className="flex flex-col items-center gap-1">
						<p className="text-[36px] font-regular">10</p>
						<h5 className="text-[24px] font-regular">Reseñas</h5>
					</div>
				</span>
			</div>
			{/* Contenedor de Items del perfil, Todavia no tienen funcionalidad, ni Link */}
			<div className="flex flex-col lg:flex-row justify-around gap-4 mt-8 w-[100%]">
				<div className="flex flex-col gap-6 bg-white w-full p-6 rounded-3xl text-[var(--color-primary)] border border-[#949492]">
					<ProfileItem icon={faUser} label="Editar Perfil" />
					<ProfileItem icon={faHeart} label="Favoritos" />
					<ProfileItem icon={faStar} label="Mis reseñas" />
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
