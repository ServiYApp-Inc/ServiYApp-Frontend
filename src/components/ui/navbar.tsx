"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/app/store/auth.store";
import { useRouter } from "next/navigation";

export function Navbar() {
	const [openClient, setOpenClient] = useState(false);
	const [openProvider, setOpenProvider] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const clientRef = useRef<HTMLDivElement>(null);
	const providerRef = useRef<HTMLDivElement>(null);

	const { isAuthenticated, role } = useAuthStore();
	const router = useRouter();

	// Cerrar dropdowns al hacer clic fuera
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			const t = e.target as Node;
			if (clientRef.current && !clientRef.current.contains(t))
				setOpenClient(false);
			if (providerRef.current && !providerRef.current.contains(t))
				setOpenProvider(false);
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Evitar scroll cuando el drawer está abierto
	useEffect(() => {
		document.body.style.overflow = drawerOpen ? "hidden" : "";
	}, [drawerOpen]);

	// Cerrar con ESC
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") {
				setOpenClient(false);
				setOpenProvider(false);
				setDrawerOpen(false);
			}
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, []);

	// Redirección a dashboard según el rol
	const handleGoToPanel = () => {
		if (role === "user") router.push("/user/services");
		else if (role === "provider") router.push("/provider/dashboard");
		else if (role === "admin") router.push("/admin/dashboard");
	};

	return (
		<nav className="fixed top-0 w-full bg-bg-light/95 backdrop-blur shadow-sm z-100">
			<div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
				{/* LOGO */}
				<Link href="/" className="flex items-center gap-3">
					<div
						className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 bg-bg-light border"
						style={{ borderColor: "var(--color-primary)" }}
					>
						S
					</div>
					<span className="text-xl font-semibold tracking-wide text-primary">
						serviYApp
					</span>
				</Link>

				{/* DESKTOP NAV */}
				<div className="hidden md:flex items-center gap-6">
					{isAuthenticated ? (
						<button
							onClick={handleGoToPanel}
							className="px-6 py-2 rounded-full font-semibold text-white bg-primary hover:bg-primary-hover transition"
						>
							Ir a mi panel
						</button>
					) : (
						<>
							{/* CLIENTE DROPDOWN */}
							<div className="relative" ref={clientRef}>
								<button
									onClick={() => {
										setOpenClient((v) => !v);
										setOpenProvider(false);
									}}
									className="px-5 py-2 rounded-full font-semibold text-white transition hover:opacity-90 bg-primary"
								>
									Soy Cliente
								</button>

								<AnimatePresence>
									{openClient && (
										<motion.div
											initial={{ opacity: 0, y: -6 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -6 }}
											transition={{ duration: 0.18 }}
											className="absolute right-0 mt-2 bg-bg-light border rounded-xl shadow-lg overflow-hidden w-48 text-sm"
										>
											<Link
												href="/loginUser"
												className="block px-4 py-2 hover:bg-bg-hover"
												onClick={() =>
													setOpenClient(false)
												}
											>
												Iniciar sesión
											</Link>
											<Link
												href="/registerUser"
												className="block px-4 py-2 hover:bg-bg-hover"
												onClick={() =>
													setOpenClient(false)
												}
											>
												Registrarme
											</Link>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{/* PROVEEDOR DROPDOWN */}
							<div className="relative" ref={providerRef}>
								<button
									onClick={() => {
										setOpenProvider((v) => !v);
										setOpenClient(false);
									}}
									className="px-5 py-2 rounded-full font-semibold text-white transition hover:opacity-90 bg-primary"
								>
									Soy Proveedor
								</button>

								<AnimatePresence>
									{openProvider && (
										<motion.div
											initial={{ opacity: 0, y: -6 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -6 }}
											transition={{ duration: 0.18 }}
											className="absolute right-0 mt-2 bg-bg-light border rounded-xl shadow-lg overflow-hidden w-48 text-sm"
										>
											<Link
												href="/loginProvider"
												className="block px-4 py-2 hover:bg-bg-hover"
												onClick={() =>
													setOpenProvider(false)
												}
											>
												Iniciar sesión
											</Link>
											<Link
												href="/registerProvider"
												className="block px-4 py-2 hover:bg-bg-hover"
												onClick={() =>
													setOpenProvider(false)
												}
											>
												Registrarme
											</Link>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</>
					)}
				</div>

				{/* MOBILE BUTTON */}
				<button
					className="md:hidden p-2 rounded-md text-primary hover:bg-bg-hover"
					onClick={() => setDrawerOpen(true)}
					aria-label="Abrir menú"
				>
					<Menu className="w-6 h-6" />
				</button>
			</div>

			{/* MOBILE SIDEBAR */}
			<AnimatePresence>
				{drawerOpen && (
					<>
						<motion.div
							className="fixed inset-0 bg-black/40 z-98"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setDrawerOpen(false)}
						/>

						<motion.aside
							className="fixed top-0 right-0 h-full w-[80%] max-w-xs bg-bg-light shadow-2xl flex flex-col z-999"
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ duration: 0.24 }}
						>
							{/* Header */}
							<div className="flex items-center justify-between px-5 py-4 border-b">
								<span className="text-lg font-semibold text-primary">
									serviYApp
								</span>
								<button
									className="p-2 rounded-md text-primary hover:bg-bg-hover"
									onClick={() => setDrawerOpen(false)}
								>
									<X className="w-6 h-6" />
								</button>
							</div>

							{/* Links */}
							<div className="p-5 space-y-6 bg-white">
								{isAuthenticated ? (
									<button
										onClick={() => {
											handleGoToPanel();
											setDrawerOpen(false);
										}}
										className="w-full text-center bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-hover transition"
									>
										Ir a mi panel
									</button>
								) : (
									<>
										<div>
											<p className="text-xs uppercase text-text-muted mb-2">
												Cliente / Admin
											</p>
											<div className="flex flex-col gap-2">
												<Link
													href="/loginUser"
													onClick={() =>
														setDrawerOpen(false)
													}
													className="text-[15px] font-medium hover:text-primary"
												>
													Iniciar sesión
												</Link>
												<Link
													href="/registerUser"
													onClick={() =>
														setDrawerOpen(false)
													}
													className="text-[15px] font-medium hover:text-primary"
												>
													Registrarme
												</Link>
											</div>
										</div>

										<div>
											<p className="text-xs uppercase text-text-muted mb-2">
												Proveedor
											</p>
											<div className="flex flex-col gap-2">
												<Link
													href="/loginProvider"
													onClick={() =>
														setDrawerOpen(false)
													}
													className="text-[15px] font-medium hover:text-primary"
												>
													Iniciar sesión
												</Link>
												<Link
													href="/registerProvider"
													onClick={() =>
														setDrawerOpen(false)
													}
													className="text-[15px] font-medium hover:text-primary"
												>
													Registrarme
												</Link>
											</div>
										</div>
									</>
								)}
							</div>
						</motion.aside>
					</>
				)}
			</AnimatePresence>
		</nav>
	);
}

export default Navbar;
