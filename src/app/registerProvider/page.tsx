"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import RegisterProviderForm from "../components/RegisterProviderForm";

export default function RegisterProviderPage() {
	return (
		<div className="flex min-h-screen overflow-hidden">
			{/* PANEL IZQUIERDO (diseño refinado y animado) */}
			<motion.div
				initial={{ opacity: 0, x: -40 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6 }}
				className="hidden md:flex flex-col justify-between items-center w-2/5 text-white p-12 pt-30 sticky top-0 h-screen relative"
				style={{
					backgroundImage:
						"url('https://madivasalon.com/wp-content/uploads/2024/09/Salon-de-belleza-en-San-Cristobal.jpg')",
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			>
				{/* Overlay degradado con blur */}
				<div
					className="absolute inset-0"
					style={{
						background:
							"linear-gradient(180deg, rgba(29,40,70,0.95) 0%, rgba(29,40,70,0.88) 50%, rgba(29,40,70,0.95) 100%)",
						backdropFilter: "blur(6px)",
					}}
				/>

				{/* CONTENIDO CENTRAL */}
				<div className="relative z-10 text-center flex flex-col items-center max-w-sm mt-12">
					<h1 className="text-6xl font-bold mb-10 tracking-tight leading-tight">
						¡El éxito empieza aquí!
					</h1>

					<p className="text-base text-gray-200 mb-5">
						¿Ya tienes una cuenta?
					</p>

					{/* BOTÓN PRINCIPAL */}
					<Link
						href="/loginProvider"
						className="px-10 py-2 rounded-xl text-base font-semibold transition-all duration-300 backdrop-blur-md bg-white/20 border border-white/30 hover:bg-white hover:text-[var(--color-primary)] hover:shadow-xl"
					>
						Inicia sesión
					</Link>
				</div>

				{/* CONTENIDO INFERIOR */}
				<div className="relative z-10 flex justify-between items-end w-full px-6 mb-3 text-sm">
					{/* Izquierda: volver (sutil) */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8, duration: 0.6 }}
					>
						<Link
							href="/"
							className="underline hover:text-gray-200 transition-all opacity-70 hover:opacity-100"
							style={{ fontSize: "0.85rem" }}
						>
							← Volver a la página principal
						</Link>
					</motion.div>

					
				</div>
			</motion.div>

			{/* PANEL DERECHO (scroll + degradado + links extra) */}
			<div
				className="flex flex-col justify-start items-center w-full md:w-3/5 overflow-y-auto h-screen"
				style={{
					background:
						"linear-gradient(180deg, #ffffff 0%, #f8f9fb 100%)",
				}}
			>
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="w-full px-2 sm:px-6 md:px-0 lg:px-0 py-0"
				>
					{/* Formulario */}
					<div className="w-full">
						<RegisterProviderForm />
					</div>
				</motion.div>
			</div>
		</div>
	);
}
