"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faHome,
	faSearch,
	faCalendar,
	faCommentDots,
	faUser,
	faBars,
	faPowerOff,
	faCartShopping,
} from "@fortawesome/free-solid-svg-icons";

import { useAuthStore } from "@/app/store/auth.store";
import { useCartStore } from "../store/useCartStore";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface MenuItem {
	icon: any;
	label: string;
	href: string;
	showBadge?: boolean;
}

export default function Sidebar({
	isCollapsed,
	setIsCollapsed,
}: {
	isCollapsed: boolean;
	setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const { role, user, clearAuth } = useAuthStore();
	const { item: itemCart } = useCartStore();

	const isAuthenticated = !!user;

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

	// 🔹 Menú Desktop (NO mensajes)
	let menuItems: MenuItem[] = [
		{ icon: faHome, label: "Inicio", href: `${basePath}/dashboard` },
		{ icon: faCalendar, label: "Citas", href: `${basePath}/appointments` },
		{ icon: faSearch, label: "Servicios", href: `${basePath}/services` },
	];

	// Carrito solo para usuarios
	if (role === "user") {
		menuItems.push({
			icon: faCartShopping,
			label: "Carrito",
			href: `${basePath}/cart`,
			showBadge: true,
		});
	}

	// 🔴 Logout
	const handleLogout = async () => {
		const result = await MySwal.fire({
			title: "¿Cerrar sesión?",
			html: `<p style="font-size:14px; color:#555;">Se cerrará tu sesión actual.</p>`,
			icon: "warning",
			confirmButtonText: "Sí, cerrar",
			cancelButtonText: "Cancelar",
			showCancelButton: true,
			confirmButtonColor: "#1D2846",
			cancelButtonColor: "#d33",
			customClass: {
				popup: "rounded-xl",
			},
		});
		if (result.isConfirmed) {
			clearAuth();
			router.push("/");
		}
	};

	const userHasPhoto = user?.profilePicture && user.profilePicture !== "";

	return (
		<>
			{/* 🖥️ SIDEBAR DESKTOP */}
			<aside
				className="fixed top-0 left-0 h-full flex-col justify-between transition-all duration-400 shadow-lg hidden md:flex"
				style={{
					backgroundColor: "var(--color-primary)",
					width: isCollapsed ? "4.5rem" : "13rem",
				}}
			>
				{/* LOGO */}
				<div>
					<div
						className="flex items-center gap-4 px-6 py-5 border-b"
						style={{ borderColor: "var(--color-primary-hover)" }}
					>
						<div className="w-8 h-8 rounded-full flex items-center justify-center bg-white font-bold">
							S
						</div>

						<span
							className={`text-lg text-white font-semibold transition-all ${
								isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
							}`}
						>
							serviYApp
						</span>
					</div>

					{/* PERFIL */}
					<div
						onClick={() =>
							isAuthenticated
								? router.push(`${basePath}/profile`)
								: router.push("/loginUser")
						}
						className="flex items-center gap-3 px-4 border-b h-[78px] cursor-pointer"
						style={{ borderColor: "var(--color-primary-hover)" }}
					>
						<div className="relative">
							{isAuthenticated && userHasPhoto ? (
								<img
									src={user.profilePicture}
									className="w-10 h-10 rounded-full object-cover"
								/>
							) : (
								<div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
									<FontAwesomeIcon icon={faUser} className="text-gray-300" />
								</div>
							)}
						</div>

						<div
							className={`flex-col transition-all ${
								isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
							}`}
						>
							{isAuthenticated ? (
								<>
									<p className="text-sm font-semibold text-white leading-tight">
										{user?.names}
									</p>
									<p className="text-xs text-gray-300 leading-tight">
										{user?.email}
									</p>
									<p className="text-[11px] text-gray-400 italic mt-0.5">
										{roleLabel}
									</p>
								</>
							) : (
								<p className="text-sm font-semibold text-white underline">
									Inicia sesión
								</p>
							)}
						</div>
					</div>
				</div>

				{/* MENÚ */}
				<nav className="mt-6 flex flex-col items-start flex-1">
					{menuItems.map((item) => {
						const active = pathname === item.href;
						const isCart = item.label === "Carrito";

						return (
							<Link
								key={item.label}
								href={item.href}
								className={`flex items-center px-6 py-2.5 text-sm font-medium rounded-md w-full transition ${
									active ? "text-white" : "text-gray-300 hover:text-white"
								}`}
								style={{
									backgroundColor: active
										? "var(--color-selected)"
										: "transparent",
								}}
							>
								<div className="w-6 flex justify-center relative">
									<FontAwesomeIcon icon={item.icon} />

									{isCart && itemCart && (
										<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
											1
										</span>
									)}
								</div>

								<span
									className={`ml-3 transition-all ${
										isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
									}`}
								>
									{item.label}
								</span>
							</Link>
						);
					})}
				</nav>

				{/* FOOTER */}
				{isAuthenticated && (
					<button
						onClick={handleLogout}
						className="flex items-center gap-2 px-6 py-3 w-full text-sm text-gray-300 hover:text-white hover:bg-red-600 transition"
					>
						<FontAwesomeIcon icon={faPowerOff} />
						<span
							className={`transition ${
								isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
							}`}
						>
							Cerrar sesión
						</span>
					</button>
				)}

				{/* COLAPSAR */}
				<div
					className="border-t border-[var(--color-primary-hover)] px-6 py-3 cursor-pointer hover:bg-[var(--color-primary-hover)]"
					onClick={() => setIsCollapsed(!isCollapsed)}
				>
					<FontAwesomeIcon icon={faBars} className="text-gray-300" />
				</div>
			</aside>

			{/* 📱 NAVBAR MOBILE */}
			<nav className="fixed bottom-0 left-0 right-0 bg-bg-light border-t border-bg-hover flex justify-around items-center py-2 shadow-sm md:hidden z-40">
				{[
					...menuItems,
					// 👇 AQUÍ AÑADIMOS MENSAJES (SOLO MOBILE)
					{
						icon: faCommentDots,
						label: "Mensajes",
						href: `${basePath}/messages`,
					},
					{
						icon: faUser,
						label: "Perfil",
						href: isAuthenticated ? `${basePath}/profile` : "/loginUser",
					},
				].map((item) => {
					const active = pathname === item.href;
					const isCart = item.label === "Carrito";

					return (
						<Link
							key={item.label}
							href={item.href}
							className="flex flex-col items-center text-xs font-medium relative"
						>
							<div className="relative">
								<FontAwesomeIcon icon={item.icon} />
								{isCart && itemCart && (
									<span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
										1
									</span>
								)}
							</div>
							<span>{item.label}</span>
						</Link>
					);
				})}
			</nav>
		</>
	);
}
