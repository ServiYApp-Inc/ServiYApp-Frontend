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

// ======================
// DATOS DE SERVICIOS
// ======================
const servicesData = [
  { title: "Peluquería", description: "Cortes, color y tratamientos profesionales en tu hogar.", image: "/peluqueria.jpg" },
  { title: "Maquillaje", description: "Looks para eventos, novias o sesiones fotográficas.", image: "/maquillaje.jpg" },
  { title: "Peinado", description: "Alisados, ondas y recogidos con técnicas de última tendencia.", image: "/peinado.png" },
  { title: "Manicura", description: "Diseños personalizados y cuidado profesional de tus manos.", image: "/manicura.jpg" },
  { title: "Pedicura", description: "Relajación y belleza en tus pies con productos premium.", image: "/pedicura.jpg" },
  { title: "Masajes", description: "Sesiones relajantes o descontracturantes a tu medida.", image: "/masajes.webp" },
  { title: "Cejas", description: "Diseño, laminado y microblading para una mirada impactante.", image: "/cejas.png" },
  { title: "Pestañas", description: "Extensiones, lifting y tintura para mayor volumen y longitud.", image: "/pestañas.webp" },
  { title: "Limpieza Facial", description: "Rutinas de hidratación y purificación profunda para un rostro radiante.", image: "/cuidado de la piel.webp" },
  { title: "Servicio a Domicilio", description: "Disfrutá de todos nuestros servicios donde vos elijas.", image: "/domicilio.jpg" },
];

// ======================
// COMPONENTE PRINCIPAL
// ======================
export default function HomePage() {
  return (
    <main className="bg-gray-50 text-gray-900">
      <Navbar /> 

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-rose-600 text-white pt-32 pb-24 text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto px-6"
        >
          <h1 className="text-6xl md:text-7xl font-serif mb-6 tracking-widest leading-tight">
            Descubrí la belleza <span className="text-rose-300">donde estés</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 font-light">
            Servicios premium ✨directo a tu domicilio✨.
          </p>
          <div className="flex justify-center gap-6">
            <Link
              href="/registerUser"
              className="bg-rose-600 text-white text-lg px-8 py-3 rounded-2xl shadow-xl inline-block hover:bg-rose-700 transition"
            >
              Reservar servicio
            </Link>
            <Link
              href="#services"
              className="border border-white text-white text-lg px-8 py-3 rounded-2xl shadow-xl inline-block hover:bg-white hover:text-blue-900 transition"
            >
              Conocer más
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Servicios */}
      <section id="services" className="py-24 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-serif text-gray-700 mb-4 tracking-wider">Nuestros Servicios</h2>
          <p className="text-xl text-gray-500 mb-16">
            Elegancia, comodidad y profesionalismo en cada servicio
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {servicesData.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                description={service.description}
                image={service.image}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Para Clientes */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">✨ Para Clientes</h2>
          <p className="text-xl text-gray-500 mb-16 max-w-2xl mx-auto">
            Belleza profesional en tus términos. Olvidate del estrés y las esperas.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard icon={<Clock className="w-8 h-8 text-rose-500" />} title="Ahorrá tiempo" text="Sin traslados, sin filas. Disfrutá de tu servicio en la comodidad de tu casa." />
            <FeatureCard icon={<ShieldCheck className="w-8 h-8 text-rose-500" />} title="Especialistas verificados" text="Solo profesionales con experiencia, certificados y valorados por nuestra comunidad." />
            <FeatureCard icon={<DollarSign className="w-8 h-8 text-rose-500" />} title="Precios transparentes" text="Tarifas claras y fijas. Sabés exactamente cuánto pagás antes de reservar." />
          </div>
        </div>
      </section>

      {/* Para Especialistas */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">🚀 Para Especialistas</h2>
          <p className="text-xl text-gray-500 mb-16 max-w-2xl mx-auto">
            Llevá tu talento a más clientes y gestioná tu agenda de forma inteligente.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard icon={<Users className="w-8 h-8 text-rose-500" />} title="Ampliá tu clientela" text="Accedé a miles de potenciales clientes en tu zona con una exposición inmediata." />
            <FeatureCard icon={<CalendarCheck className="w-8 h-8 text-rose-500" />} title="Gestión simplificada" text="Herramientas digitales para organizar citas, pagos y servicios, todo en un mismo lugar." />
            <FeatureCard icon={<TrendingUp className="w-8 h-8 text-rose-500" />} title="Crecé tu negocio" text="Obtené mayor libertad e incrementá tus ingresos con total flexibilidad horaria." />
          </div>
        </div>
      </section>

      {/* Final */}
      <section className="bg-slate-900 text-white text-center py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
            ¿Lista para experimentar la belleza a domicilio?
          </h2>
          <p className="text-xl mb-12 font-light text-slate-300">
            Unite a la plataforma que está revolucionando los servicios de belleza a domicilio.
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            <Link
              href="/registerUser"
              className="bg-rose-600 text-white text-lg px-8 py-3 rounded-2xl shadow-xl inline-block hover:bg-rose-700 transition"
            >
              Soy Cliente / Administrador
            </Link>
            <Link
              href="/registerProvider"
              className="border border-white text-white text-lg px-8 py-3 rounded-2xl shadow-xl inline-block hover:bg-white hover:text-blue-900 transition"
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

// ======================
// COMPONENTES AUXILIARES
// ======================
interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
}

function ServiceCard({ title, description, image }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03, zIndex: 10, boxShadow: "0 25px 50px -12px rgba(244, 63, 94, 0.25)" }} 
      className="relative h-72 rounded-3xl overflow-hidden shadow-lg cursor-pointer"
    >
      <Image
        src={image}
        alt={title}
        fill
        style={{ objectFit: "cover" }}
        quality={85}
        className="transition duration-500 ease-in-out transform hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent/10"></div>
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <h3 className="text-2xl font-serif mb-1 tracking-tight">{title}</h3>
        <p className="text-sm font-light text-gray-300">{description}</p>
      </div>
    </motion.div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

function FeatureCard({ icon, title, text }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(244, 63, 94, 0.2)" }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-gray-200 rounded-3xl p-10 flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition duration-300 cursor-default"
    >
      <div className="mb-6 p-4 bg-rose-50 rounded-xl">{icon}</div> 
      <h3 className="font-bold text-xl text-blue-900 mb-3">{title}</h3>
      <p className="text-gray-500 text-base">{text}</p>
    </motion.div>
  );
}
