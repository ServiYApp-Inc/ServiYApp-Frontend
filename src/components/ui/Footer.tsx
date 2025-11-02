"use client";
import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export function Footer() {
	return (
		<footer className="bg-primary text-white pt-16 pb-12 text-sm border-t border-white/20">
			<div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-12">
				{/* Logo + descripción */}
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 bg-white/10 border border-white/20 text-white">
							S
						</span>

						<span className="text-lg font-semibold tracking-wide text-white">
							serviYApp
						</span>
					</div>
					<p className="leading-relaxed text-text-muted">
						Conectamos especialistas de belleza con clientes para
						servicios a domicilio. Todo en una sola plataforma,
						simple y segura.
					</p>
				</div>

				{/* Clientes */}
				<div>
					<h4 className="font-semibold mb-4 text-white tracking-wide">
						Clientes
					</h4>
					<ul className="space-y-2">
						<li>
							<Link
								href="/users/services"
								className="hover:text-white transition block"
							>
								Servicios disponibles
							</Link>
						</li>
					</ul>
				</div>

				{/* Especialistas */}
				<div>
					<h4 className="font-semibold mb-4 text-white tracking-wide">
						Especialistas
					</h4>
					<ul className="space-y-2">
						<li>
							<Link
								href="/registerProvider"
								className="hover:text-white transition block"
							>
								Únete al equipo
							</Link>
						</li>
					</ul>
				</div>

				{/* Contacto */}
				<div>
					<Link
						href="/contact"
						className="font-semibold mb-4 text-white tracking-wide hover:underline block"
					>
						Contacto
					</Link>
					<ul className="space-y-3">
						<li className="flex items-center text-text-muted">
							<Mail className="w-4 h-4 mr-2 text-white/80" />
							serviciosyaplicacion@gmail.com
						</li>
						<li className="flex items-center text-text-muted">
							<Phone className="w-4 h-4 mr-2 text-white/80" />
							+54 9 11 5555 5555
						</li>
						<li className="flex items-center text-text-muted">
							<MapPin className="w-4 h-4 mr-2 text-white/80" />
							Atención LATAM
						</li>
					</ul>
				</div>
			</div>

			{/* Operamos en */}
			<div className="text-center mt-14 text-text-muted text-sm">
				<p className="mb-2 font-medium text-white">Operamos en:</p>
				<p>México · Colombia · Argentina</p>
			</div>

			{/* Copyright */}
			<div className="text-center text-xs text-text-muted border-t border-white/10 mt-12 pt-6">
				© {new Date().getFullYear()} serviYApp. Todos los derechos
				reservados.
			</div>
		</footer>
	);
}

export default Footer;
