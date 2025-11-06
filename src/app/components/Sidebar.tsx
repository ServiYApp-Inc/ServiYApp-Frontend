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
	faBell,
	faPowerOff,
	faCartShopping,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "@/app/store/auth.store";

interface MenuItem {
	icon: any;
	label: string;
	href: string;
	showBadge?: boolean; // ✅ propiedad opcional para el carrito
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
	const { role, user, clearAuth, cart } = useAuthStore();

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
	];

	// 🛒 Agregar carrito solo si es usuario
	if (role === "user") {
		menuItems.splice(3, 0, {
			icon: faCartShopping,
			label: "Carrito",
			href: `${basePath}/cart`,
			showBadge: true,
		});
	}

	const handleLogout = () => {
		clearAuth();
		router.push("/");
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
								isCollapsed
									? "opacity-0 w-0"
									: "opacity-100 w-auto"
							}`}
						>
							serviYApp
						</span>
					</div>

					{/* PERFIL */}
					<div
						className="flex items-center gap-3 px-4 border-b h-[78px]"
						style={{ borderColor: "var(--color-primary-hover)" }}
					>
						<div className="relative group">
							{isAuthenticated && userHasPhoto ? (
								<img
									src={user.profilePicture}
									alt={user.names || "Usuario"}
									className="w-10 h-10 rounded-full object-cover border border-white/20 transition-transform duration-300 group-hover:scale-105"
								/>
							) : (
								<div
									className="w-10 h-10 rounded-full bg.white/10 border border-white/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
									style={{
										backgroundColor:
											"rgba(255,255,255,0.1)",
									}}
								>
									<FontAwesomeIcon
										icon={faUser}
										className="text-gray-300"
										style={{
											width: "1.2rem",
											height: "1.2rem",
										}}
									/>
								</div>
							)}
						</div>

						<div
							className={`flex flex-col transition-all duration-300 ${
								isCollapsed
									? "opacity-0 w-0"
									: "opacity-100 w-auto"
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
								<button
									className="text-sm font-semibold text-white underline underline-offset-2 hover:text-gray-200"
									onClick={() => router.push("/loginUser")}
								>
									Inicia sesión
								</button>
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
							<div
								key={item.label}
								className="relative group w-full"
							>
								{active && (
									<div className="absolute left-0 top-0 h-full w-[3px] rounded-l bg-white" />
								)}
								<Link
									href={item.href}
									className={`flex items-center px-6 py-2.5 w-full text-sm font-medium rounded-md transition-all duration-300 relative ${
										active
											? "text-white"
											: "text-gray-300 hover:text-white"
									}`}
									style={{
										backgroundColor: active
											? "var(--color-selected)"
											: "transparent",
									}}
									onMouseEnter={(e) => {
										if (!active)
											e.currentTarget.style.backgroundColor =
												"var(--color-primary-hover)";
									}}
									onMouseLeave={(e) => {
										if (!active)
											e.currentTarget.style.backgroundColor =
												"transparent";
									}}
								>
									<div className="w-6 flex justify-center relative">
										<FontAwesomeIcon
											icon={item.icon}
											className="text-base"
											style={{
												width: "1.25rem",
												height: "1.25rem",
											}}
										/>
										{/* 🔹 Badge del carrito */}
										{isCart && cart.length > 0 && (
											<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.6rem] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
												{cart.length}
											</span>
										)}
									</div>
									<span
										className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${
											isCollapsed
												? "opacity-0 w-0"
												: "opacity-100 w-auto"
										}`}
									>
										{item.label}
									</span>
								</Link>
							</div>
						);
					})}
				</nav>

				{/* FOOTER */}
				<div>
					{isAuthenticated && (
						<div className="relative group">
							<button
								className="flex items-center justify-start gap-3 px-6 py-3 w-full transition-all duration-300 relative"
								style={{
									borderTop:
										"1px solid var(--color-primary-hover)",
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.backgroundColor =
										"var(--color-primary-hover)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.backgroundColor =
										"transparent")
								}
								aria-label="Notificaciones"
							>
								<div className="relative w-6 flex justify-center">
									<FontAwesomeIcon
										icon={faBell}
										className="text-gray-300"
										style={{
											width: "1.25rem",
											height: "1.25rem",
										}}
									/>
									<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.6rem] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
										3
									</span>
								</div>
							</button>
						</div>
					)}

					{isAuthenticated && (
						<div
							className="relative group border-t"
							style={{
								borderColor: "var(--color-primary-hover)",
							}}
						>
							<button
								onClick={handleLogout}
								className="flex items-center w-full gap-2 px-6 py-3 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
								onMouseEnter={(e) =>
									(e.currentTarget.style.backgroundColor =
										"#dc2626")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.backgroundColor =
										"transparent")
								}
							>
								<div className="w-6 flex justify-center">
									<FontAwesomeIcon
										icon={faPowerOff}
										className="text-base"
										style={{
											width: "1.25rem",
											height: "1.25rem",
										}}
									/>
								</div>
								<span
									className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${
										isCollapsed
											? "opacity-0 w-0"
											: "opacity-100 w-auto"
									}`}
								>
									Cerrar sesión
								</span>
							</button>
						</div>
					)}

					<div className="relative group">
						<div
							className="flex items-center justify-between px-6 py-3 transition-all duration-300"
							style={{
								borderTop:
									"1px solid var(--color-primary-hover)",
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.backgroundColor =
									"var(--color-primary-hover)")
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.backgroundColor =
									"transparent")
							}
						>
							<button
								onClick={() => setIsCollapsed(!isCollapsed)}
								className="text-gray-300 hover:text-white transition-colors"
								aria-label="Colapsar menú"
							>
								<FontAwesomeIcon
									icon={faBars}
									className="text-lg"
									style={{
										width: "1.25rem",
										height: "1.25rem",
									}}
								/>
							</button>
						</div>
					</div>
				</div>
			</aside>

			{/* 📱 MOBILE HEADER & NAV */}
			<header className="md:hidden fixed top-0 left-0 right-0 h-12 flex items-center justify-between px-4 z-50 bg-white">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-white">
						S
					</div>
					<span
						className="text-sm font-semibold"
						style={{ color: "var(--color-primary)" }}
					>
						serviYApp
					</span>
				</div>
				<div className="flex items-center gap-4">
					{isAuthenticated && (
						<div className="relative">
							<FontAwesomeIcon
								icon={faBell}
								className="text-gray-700"
								style={{ width: "1.2rem", height: "1.2rem" }}
							/>
							<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.6rem] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
								3
							</span>
						</div>
					)}
					{isAuthenticated && (
						<button onClick={handleLogout}>
							<FontAwesomeIcon
								icon={faPowerOff}
								className="text-gray-700"
								style={{ width: "1.2rem", height: "1.2rem" }}
							/>
						</button>
					)}
				</div>
			</header>

			{/* 📱 MOBILE NAVBAR */}
			<nav className="fixed bottom-0 left-0 right-0 bg-bg-light border-t border-bg-hover flex justify-around items-center py-2 shadow-sm md:hidden z-40">
				{menuItems.map((item) => {
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
							<FontAwesomeIcon
								icon={item.icon}
								className="mb-1"
								style={{ width: "1.2rem", height: "1.2rem" }}
							/>
							{/* Badge móvil */}
							{isCart && cart.length > 0 && (
								<span className="absolute top-0 right-3 bg-red-500 text-white text-[0.6rem] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
									{cart.length}
								</span>
							)}
							<span>{item.label}</span>
						</Link>
					);
				})}
			</nav>
		</>
	);
}
