"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faHome,
	faSearch,
	faCalendar,
	faCommentDots,
	faUser,
	faBars,
	faBell,
} from "@fortawesome/free-solid-svg-icons";

export default function Sidebar({
	isCollapsed,
	setIsCollapsed,
}: {
	isCollapsed: boolean;
	setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const pathname = usePathname();

	const menuItems = [
		{ icon: faHome, label: "Inicio", href: "/home" },
		{ icon: faSearch, label: "Servicios", href: "/services" },
		{ icon: faCalendar, label: "Reservas", href: "/appointments" },
		{ icon: faCommentDots, label: "Mensajes", href: "/messages" },
		{ icon: faUser, label: "Perfil", href: "/profile" },
	];

	return (
		<>
			{/* ===== SIDEBAR (Desktop) ===== */}
			<aside
				className="fixed top-0 left-0 h-full flex-col justify-between transition-all duration-400 shadow-lg hidden md:flex"
				style={{
					backgroundColor: "var(--color-primary)",
					width: isCollapsed ? "4.5rem" : "13rem",
				}}
			>
				{/* Sección del Logo */}
				<div>
					<div
						className="flex items-center gap-4 px-6 py-6 border-b"
						style={{ borderColor: "var(--color-primary-hover)" }}
					>
						<div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 bg-white">
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

					{/* Menú principal */}
					<nav className="mt-8 flex flex-col items-start relative">
						{menuItems.map((item) => {
							const active = pathname === item.href;
							return (
								<div
									key={item.label}
									className="relative group w-full"
								>
									{/* Indicador activo */}
									{active && (
										<div className="absolute left-0 top-0 h-full w-[3px] rounded-l bg-white" />
									)}

									{/* Link principal */}
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
										<div className="w-6 flex justify-center">
											<FontAwesomeIcon
												icon={item.icon}
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
											{item.label}
										</span>
									</Link>

									{/* Tooltip (solo visible si está colapsado) */}
									{isCollapsed && (
										<span
											className="absolute left-18 top-1/2 -translate-y-1/2 px-3 py-1 text-xs rounded-md text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
											style={{
												backgroundColor:
													"var(--color-primary-hover)",
												whiteSpace: "nowrap",
											}}
										>
											{item.label}
										</span>
									)}
								</div>
							);
						})}
					</nav>
				</div>

				{/* Sección inferior */}
				<div>
					{/* Notificaciones */}
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
							{/* Ícono con badge */}
							<div className="relative w-6 flex justify-center">
								<FontAwesomeIcon
									icon={faBell}
									className="text-gray-300"
									style={{
										width: "1.25rem",
										height: "1.25rem",
									}}
								/>
								{/* Badge rojo */}
								<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.6rem] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
									3
								</span>
							</div>
						</button>

						{/* Tooltip (solo cuando está colapsado) */}
						{isCollapsed && (
							<span
								className="absolute left-18 top-1/2 -translate-y-1/2 px-3 py-1 text-xs rounded-md text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
								style={{
									backgroundColor:
										"var(--color-primary-hover)",
									whiteSpace: "nowrap",
								}}
							>
								Notificaciones
							</span>
						)}
					</div>

					{/* Control colapsar/expandir */}
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
						{isCollapsed && (
							<span
								className="absolute left-18 top-1/2 -translate-y-1/2 px-3 py-1 text-xs rounded-md text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
								style={{
									backgroundColor:
										"var(--color-primary-hover)",
									whiteSpace: "nowrap",
								}}
							>
								Expandir
							</span>
						)}
					</div>

					{/* Usuario */}
					<div
						className="flex items-center gap-3 px-5 py-3 overflow-hidden transition-all duration-300 justify-start"
						onMouseEnter={(e) =>
							(e.currentTarget.style.backgroundColor =
								"var(--color-primary-hover)")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.backgroundColor =
								"transparent")
						}
					>
						<img
							src="https://i.pravatar.cc/40?img=3"
							alt="User profilePicture"
							className="w-8 h-8 rounded-full object-cover"
						/>
						{!isCollapsed && (
							<div>
								<p className="text-sm font-semibold text-white">
									Juana Díaz
								</p>
								<p className="text-xs text-gray-300">
									juanadiaz@email.com
								</p>
							</div>
						)}
					</div>
				</div>
			</aside>

			{/* ===== TOPBAR (Mobile) ===== */}
			<header className="fixed top-0 left-0 right-0 flex justify-between items-center px-4 py-2 bg-bg-light border-b border-bg-hover md:hidden z-50">
				{/* Logo */}
				<div className="flex items-center gap-2">
					<div
						className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
						style={{
							backgroundColor: "var(--color-primary)",
							color: "white",
						}}
					>
						S
					</div>
					<span className="text-color-primary font-semibold text-base">
						serviYApp
					</span>
				</div>

				{/* Notificaciones*/}
				<div className="relative">
					<FontAwesomeIcon
						icon={faBell}
						className="text-primary-hover"
						style={{ width: "1.3rem", height: "1.3rem" }}
					/>
					<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.6rem] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
						3
					</span>
				</div>
			</header>

			{/* ===== NAVBAR inferior (Mobile) ===== */}
			<nav className="fixed bottom-0 left-0 right-0 bg-bg-light border-t border-bg-hover flex justify-around items-center py-2 shadow-sm md:hidden z-50">
				{menuItems.map((item) => {
					const active = pathname === item.href;
					return (
						<Link
							key={item.label}
							href={item.href}
							className="flex flex-col items-center justify-center text-xs font-medium"
							style={{
								color: active
									? "var(--color-primary)"
									: "var(--color-foreground)",
							}}
						>
							<FontAwesomeIcon
								icon={item.icon}
								className="mb-1"
								style={{
									width: "1.2rem",
									height: "1.2rem",
								}}
							/>
							<span>{item.label}</span>
						</Link>
					);
				})}
			</nav>
		</>
	);
}
