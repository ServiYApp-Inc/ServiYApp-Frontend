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
	const { item: itemCart } = useCartStore(); // ✅ carrito con un solo servicio

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

	// 🔹 Menú base
	let menuItems: MenuItem[] = [
		{ icon: faHome, label: "Inicio", href: `${basePath}/dashboard` },
		{ icon: faCalendar, label: "Citas", href: `${basePath}/appointments` },
		{ icon: faSearch, label: "Servicios", href: `${basePath}/services` },
	];

	if (role === "user") {
		menuItems.push({
			icon: faCartShopping,
			label: "Carrito",
			href: `${basePath}/cart`,
			showBadge: true,
		});
	}

	if (role !== "admin") {
		menuItems.push({
			icon: faCommentDots,
			label: "Mensajes",
			href: `${basePath}/messages`,
		});
	}

	// 🔴 Logout con confirmación
	const handleLogout = async () => {
		const result = await MySwal.fire({
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

	const userHasPhoto = user?.profilePicture && user.profilePicture !== "";

	return (
		<>
			{/* 🖥️ SIDEBAR (Desktop) */}
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
						<div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 bg-white text--primary">
							S
						</div>
						<span
							className={`text-lg text-white font-semibold tracking-wide whitespace-nowrap overflow-hidden transition-all duration-400 ${
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
						className="flex items-center gap-3 px-4 border-b h-[78px] cursor-pointer relative group transition-all"
						style={{ borderColor: "var(--color-primary-hover)" }}
					>
						{/* Tooltip */}
						<span
							className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 text-[11px] text-white bg-[#1D2846] px-2 py-1 rounded-lg shadow-md z-[9999] opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
								!isCollapsed ? "hidden" : "block"
							}`}
						>
							Ir al perfil
						</span>

						<div className="relative">
							{isAuthenticated && userHasPhoto ? (
								<img
									src={user.profilePicture}
									alt={user.names || "Usuario"}
									className="w-10 h-10 rounded-full object-cover border border-white/20 transition-transform duration-300 group-hover:scale-105"
								/>
							) : (
								<div
									className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
									style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
								>
									<FontAwesomeIcon icon={faUser} className="text-gray-300" />
								</div>
							)}
						</div>

						<div
							className={`flex flex-col transition-all duration-300 ${
								isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
							}`}
						>
							{isAuthenticated ? (
								<>
									<p className="text-sm font-semibold text-white leading-tight">
										{user?.names}
									</p>
									<p className="text-xs italic text-gray-300 leading-tight truncate">
										{user?.email}
									</p>
									<p className="text-[11px] text-gray-400 italic mt-0.5">
										{roleLabel}
									</p>
								</>
							) : (
								<p className="text-sm font-semibold text-white underline underline-offset-2 hover:text-gray-200">
									Inicia sesión
								</p>
							)}
						</div>
					</div>
				</div>

				{/* MENÚ PRINCIPAL */}
				<nav className="mt-6 flex flex-col items-start relative flex-1">
					{menuItems.map((item) => {
						const active = pathname === item.href;
						const isCart = item.label === "Carrito";
						return (
							<div key={item.label} className="relative group w-full">
								{isCollapsed && (
									<span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 text-[11px] text-white bg-[#1D2846] px-2 py-1 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
										{item.label}
									</span>
								)}

								<Link
									href={item.href}
									className={`flex items-center px-6 py-2.5 w-full text-sm font-medium rounded-md transition-all duration-300 ${
										active
											? "text-white"
											: "text-gray-300 hover:text-white"
									}`}
									style={{
										backgroundColor: active
											? "var(--color-selected)"
											: "transparent",
									}}
								>
									<div className="w-6 flex justify-center relative">
										<FontAwesomeIcon icon={item.icon} />
										{/* 🔴 Badge solo si hay servicio en carrito */}
										{isCart && itemCart && (
											<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.6rem] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
												1
											</span>
										)}
									</div>
									<span
										className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${
											isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
										}`}
									>
										{item.label}
									</span>
								</Link>
							</div>
						);
					})}
				</nav>

				{/* 🔻 FOOTER */}
				{isAuthenticated && (
					<button
						onClick={handleLogout}
						className="flex items-center w-full gap-2 px-6 py-3 text-sm font-medium text-gray-300 hover:text-white border-t border-[var(--color-primary-hover)] hover:bg-red-600 transition-all"
					>
						<FontAwesomeIcon icon={faPowerOff} />
						<span
							className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${
								isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
							}`}
						>
							Cerrar sesión
						</span>
					</button>
				)}

				{/* COLAPSAR */}
				<div
					className="border-t border-[var(--color-primary-hover)] px-6 py-3 flex items-center justify-between hover:bg-[var(--color-primary-hover)] transition-all cursor-pointer"
					onClick={() => setIsCollapsed(!isCollapsed)}
				>
					<FontAwesomeIcon icon={faBars} className="text-gray-300 hover:text-white" />
				</div>
			</aside>

			{/* 📱 MOBILE NAVBAR */}
			<nav className="fixed bottom-0 left-0 right-0 bg-bg-light border-t border-bg-hover flex justify-around items-center py-2 shadow-sm md:hidden z-40">
				{[
					...menuItems,
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
							className="flex flex-col items-center justify-center text-xs font-medium relative"
							style={{
								color: active
									? "var(--color-primary)"
									: "var(--color-foreground)",
							}}
						>
							<div className="relative">
								<FontAwesomeIcon
									icon={item.icon}
									className="mb-1"
									style={{ width: "1.2rem", height: "1.2rem" }}
								/>
								{/* 🔴 Badge solo si hay algo en carrito */}
								{isCart && itemCart && (
									<span className="absolute -top-1 -right-2 bg-red-500 text-white text-[0.6rem] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
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
