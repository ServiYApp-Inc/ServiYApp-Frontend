"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/Footer";
import {
	Clock,
	ShieldCheck,
	DollarSign,
	Users,
	CalendarCheck,
	TrendingUp,
} from "lucide-react";
import React from "react";

const servicesData = [
	{
		title: "Peluquería",
		description: "Cortes, color y tratamientos profesionales en tu hogar.",
		image: "/peluqueria.jpg",
	},
	{
		title: "Maquillaje",
		description: "Looks para eventos, novias o sesiones fotográficas.",
		image: "/maquillaje.jpg",
	},
	{
		title: "Peinado",
		description:
			"Alisados, ondas y recogidos con técnicas de última tendencia.",
		image: "/peinado.png",
	},
	{
		title: "Manicura",
		description:
			"Diseños personalizados y cuidado profesional de tus manos.",
		image: "/manicura.jpg",
	},
	{
		title: "Pedicura",
		description: "Relajación y belleza en tus pies con productos premium.",
		image: "/pedicura.jpg",
	},
	{
		title: "Masajes",
		description: "Sesiones relajantes o descontracturantes a tu medida.",
		image: "/masajes.webp",
	},
	{
		title: "Cejas",
		description:
			"Diseño, laminado y microblading para una mirada impactante.",
		image: "/cejas.png",
	},
	{
		title: "Pestañas",
		description:
			"Extensiones, lifting y tintura para mayor volumen y longitud.",
		image: "/pestañas.webp",
	},
	{
		title: "Limpieza Facial",
		description:
			"Rutinas de hidratación y purificación profunda para un rostro radiante.",
		image: "/cuidado de la piel.webp",
	},
];

const fadeUp = {
	initial: { opacity: 0, y: 28 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.6, ease: "easeOut" as const },
};

export default function HomePage() {
	return (
		<main className="bg-white text-gray-900">
			<Navbar />

			{/* HERO */}
			<section
				className="relative h-[92vh] flex items-center bg-fixed bg-center bg-cover"
				style={{
					backgroundImage: `url('/peluqueria.jpg')`,
				}}
			>
				<div className="absolute inset-0 bg-primary/90" />
				<div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
					<motion.div
						initial={fadeUp.initial}
						animate={fadeUp.animate}
						transition={fadeUp.transition}
						className="max-w-xl text-white"
					>
						<h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
							Descubre la belleza
							<br />
							donde estés
						</h1>
						<p className="mt-5 text-lg md:text-xl text-white/90">
							Reserva en minutos y recibe especialistas
							certificados en tu domicilio.
						</p>
						<div className="mt-8">
							<Link
								href="/user/services"
								className="inline-flex items-center justify-center px-8 py-3 rounded-full font-semibold shadow-lg bg-white text-primary hover:bg-gray-100 transition"
							>
								Reservar servicio
							</Link>
						</div>
					</motion.div>
				</div>
			</section>

			{/* SERVICIOS */}
			<section id="services" className="py-20 md:py-24 bg-bg-light">
				<div className="max-w-7xl mx-auto px-6 text-center">
					<motion.h2
						initial={fadeUp.initial}
						whileInView={fadeUp.animate}
						viewport={{ once: true }}
						transition={fadeUp.transition}
						className="text-3xl md:text-5xl font-extrabold mb-4 text-primary"
					>
						Nuestros Servicios
					</motion.h2>
					<motion.p
						initial={fadeUp.initial}
						whileInView={fadeUp.animate}
						viewport={{ once: true }}
						transition={{ ...fadeUp.transition, delay: 0.05 }}
						className="text-lg md:text-xl mb-14 text-text-muted"
					>
						Elegancia, comodidad y profesionalismo en cada servicio
					</motion.p>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
						{servicesData.map((s, i) => (
							<ServiceCard key={i} {...s} />
						))}
					</div>
				</div>
			</section>

			{/* PARA CLIENTES */}
			<section className="py-20 md:py-24 bg-white">
				<div className="max-w-6xl mx-auto px-6 text-center">
					<motion.h2
						initial={fadeUp.initial}
						whileInView={fadeUp.animate}
						viewport={{ once: true }}
						transition={fadeUp.transition}
						className="text-3xl md:text-4xl font-extrabold mb-4 text-primary"
					>
						Para Clientes
					</motion.h2>
					<motion.p
						initial={fadeUp.initial}
						whileInView={fadeUp.animate}
						viewport={{ once: true }}
						transition={{ ...fadeUp.transition, delay: 0.05 }}
						className="text-lg text-text-muted mb-14 max-w-2xl mx-auto"
					>
						Belleza profesional en tus términos. Sin traslados ni
						esperas.
					</motion.p>

					<div className="grid md:grid-cols-3 gap-8 md:gap-10">
						<FeatureCard
							icon={
								<Clock
									className="w-7 h-7"
									color="var(--color-accent)"
								/>
							}
							title="Ahorro de tiempo"
							text="Reservá y recibí el servicio en tu casa, oficina o donde elijas."
						/>
						<FeatureCard
							icon={
								<ShieldCheck
									className="w-7 h-7"
									color="var(--color-accent)"
								/>
							}
							title="Especialistas verificados"
							text="Profesionales con experiencia, certificados y valorados por la comunidad."
						/>
						<FeatureCard
							icon={
								<DollarSign
									className="w-7 h-7"
									color="var(--color-accent)"
								/>
							}
							title="Precios transparentes"
							text="Tarifas claras y confirmadas antes de reservar."
						/>
					</div>
				</div>
			</section>

			{/* PARA ESPECIALISTAS */}
			<section className="py-20 md:py-24 bg-bg-light">
				<div className="max-w-6xl mx-auto px-6 text-center">
					<motion.h2
						initial={fadeUp.initial}
						whileInView={fadeUp.animate}
						viewport={{ once: true }}
						transition={fadeUp.transition}
						className="text-3xl md:text-4xl font-extrabold mb-4 text-primary"
					>
						Para Especialistas
					</motion.h2>
					<motion.p
						initial={fadeUp.initial}
						whileInView={fadeUp.animate}
						viewport={{ once: true }}
						transition={{ ...fadeUp.transition, delay: 0.05 }}
						className="text-lg text-text-muted mb-14 max-w-2xl mx-auto"
					>
						Haz crecer tu cartera de clientes y gestiona tu agenda
						con herramientas simples y efectivas.
					</motion.p>

					<div className="grid md:grid-cols-3 gap-8 md:gap-10">
						<FeatureCard
							icon={
								<Users
									className="w-7 h-7"
									color="var(--color-accent)"
								/>
							}
							title="Más visibilidad"
							text="Accede a una audiencia activa cerca de tu ubicación."
						/>
						<FeatureCard
							icon={
								<CalendarCheck
									className="w-7 h-7"
									color="var(--color-accent)"
								/>
							}
							title="Gestión simplificada"
							text="Organiza citas, pagos y servicios desde un mismo lugar."
						/>
						<FeatureCard
							icon={
								<TrendingUp
									className="w-7 h-7"
									color="var(--color-accent)"
								/>
							}
							title="Impulso a tu negocio"
							text="Mayores ingresos con flexibilidad horaria y mejor planificación."
						/>
					</div>
				</div>
			</section>

			{/* TESTIMONIOS */}
			<section className="py-20 md:py-24 bg-white">
				<div className="max-w-6xl mx-auto px-6">
					<motion.h2
						initial={fadeUp.initial}
						whileInView={fadeUp.animate}
						viewport={{ once: true }}
						transition={fadeUp.transition}
						className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-primary"
					>
						Lo que dicen nuestros usuarios
					</motion.h2>

					<div className="grid md:grid-cols-3 gap-8">
						<TestimonialCard
							name="Carolina"
							role="Clienta"
							text="Reservé un maquillaje para una sesión y el servicio fue puntual y profesional. Me encantó la experiencia."
						/>
						<TestimonialCard
							name="Jorge"
							role="Proveedor"
							text="Desde que uso ServiYApp aumentaron mis reservas. La app es clara y fácil para gestionar todo."
						/>
						<TestimonialCard
							name="Sofía"
							role="Clienta"
							text="Muy conveniente y con precios transparentes. Recomiendo totalmente el servicio a domicilio."
						/>
					</div>
				</div>
			</section>
			{/* CTA FINAL */}
			<section className="text-white text-center py-20 md:py-24 bg-primary">
				<div className="max-w-3xl mx-auto px-6">
					<motion.h2
						initial={fadeUp.initial}
						whileInView={fadeUp.animate}
						viewport={{ once: true }}
						transition={fadeUp.transition}
						className="text-3xl md:text-5xl font-extrabold mb-5 tracking-tight"
					>
						¿Lista para experimentar la belleza a domicilio?
					</motion.h2>
					<motion.p
						initial={fadeUp.initial}
						whileInView={fadeUp.animate}
						viewport={{ once: true }}
						transition={{ ...fadeUp.transition, delay: 0.05 }}
						className="text-lg md:text-xl mb-10 text-white/90"
					>
						Únete a la plataforma que está transformando los
						servicios de belleza a domicilio.
					</motion.p>
					<div className="flex justify-center gap-4 md:gap-6 flex-wrap">
						<Link
							href="/registerUser"
							className="bg-white text-gray-900 text-base md:text-lg px-6 md:px-8 py-3 rounded-full font-semibold shadow-md inline-block hover:shadow-lg transition"
						>
							Soy Cliente / Administrador
						</Link>
						<Link
							href="/registerProvider"
							className="border text-white text-base md:text-lg px-6 md:px-8 py-3 rounded-full font-semibold inline-block hover:bg-white hover:text-gray-900 transition"
							style={{ borderColor: "var(--color-white)" }}
						>
							Soy Proveedor
						</Link>
					</div>
				</div>
			</section>

			<Footer />
		</main>
	);
}

/* ==== COMPONENTES AUXILIARES ==== */

function ServiceCard({ title, description, image }: any) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.98, y: 8 }}
			whileInView={{ opacity: 1, scale: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.45, ease: "easeOut" as const }}
			whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
			className="relative h-64 md:h-72 rounded-2xl overflow-hidden shadow-lg bg-gray-200 border border-card-border"
		>
			<Image src={image} alt={title} fill className="object-cover" />
			<div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
			<div className="absolute bottom-0 left-0 p-5 text-white">
				<h3 className="text-xl font-semibold mb-1">{title}</h3>
				<p className="text-sm text-white/90">{description}</p>
			</div>
		</motion.div>
	);
}

function FeatureCard({ icon, title, text }: any) {
	return (
		<motion.div
			whileHover={{ y: -6 }}
			transition={{ duration: 0.25 }}
			className="bg-white rounded-2xl p-8 md:p-10 text-center shadow-sm hover:shadow-lg transition border border-card-border"
		>
			<div
				className="mx-auto mb-6 w-12 h-12 rounded-xl grid place-items-center"
				style={{ backgroundColor: "var(--color-icon-bg)" }}
			>
				{icon}
			</div>
			<h3 className="font-bold text-xl mb-2 text-primary">{title}</h3>
			<p className="text-base text-text-muted">{text}</p>
		</motion.div>
	);
}

function TestimonialCard({ name, role, text }: any) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 14 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.45 }}
			className="bg-white rounded-2xl p-7 md:p-8 shadow-sm border border-card-border"
		>
			<p className="text-gray-700 mb-6">{text}</p>
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-full bg-gray-200" />
				<div>
					<p className="font-semibold text-gray-900">{name}</p>
					<p className="text-sm text-text-muted">{role}</p>
				</div>
			</div>
		</motion.div>
	);
}
