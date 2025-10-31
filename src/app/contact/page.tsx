"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button"; 
import { Navbar } from "@/components/ui/navbar"; 
import { Footer } from "@/components/ui/Footer";
import {
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";
import React from "react"; 

export default function ContactPage() {
  return (
    <main className="bg-gray-50 text-gray-900 min-h-screen pt-20">
      <Navbar />
      
      {/* Hero de Contacto */}
      <section className="pt-16 pb-16 bg-slate-900 text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto px-6"
        >
          <h1 className="text-6xl font-serif mb-4 tracking-widest leading-tight">
            Contactanos
          </h1>
          <p className="text-xl font-light text-slate-300">
            Estamos listos para resolver tus dudas y ayudarte a agendar tu cita de belleza.
          </p>
        </motion.div>
      </section>

      {/* Sección de Contacto y Formulario */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          
          {/* Columna de Información de Contacto */}
          <div>
            <h2 className="text-4xl font-bold text-blue-900 mb-6">Información Clave</h2>
            <p className="text-lg text-gray-600 mb-10">
              Podés llamarnos, enviarnos un correo electrónico o encontrarnos en nuestras oficinas.
            </p>

            <div className="space-y-6">
              <ContactItem 
                icon={<Mail className="w-6 h-6 text-rose-500" />}
                title="Correo Electrónico"
                detail="serviciosyaplicacion@gmail.com"
              />
              <ContactItem 
                icon={<Phone className="w-6 h-6 text-rose-500" />}
                title="Teléfono (Citas y Soporte)"
                detail="+54 9 11 5555 5555"
              />
              <ContactItem 
                icon={<MapPin className="w-6 h-6 text-rose-500" />}
                title="Oficina Central"
                detail="Av. Libertador 1234, Buenos Aires, Argentina"
              />
            </div>
          </div>

          {/* Columna de Formulario de Contacto */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-gray-100 p-8 rounded-xl shadow-lg"
          >
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Envianos un Mensaje</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  id="name" 
                  placeholder="Tu nombre"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="ejemplo@correo.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea 
                  id="message" 
                  rows={4} 
                  placeholder="Escribe aquí tu consulta..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                  required
                ></textarea>
              </div>
              <Button 
                variant="primary" 
                className="w-full py-3 text-lg flex items-center justify-center"
                type="submit"
              >
                <Send className="w-5 h-5 mr-2" /> Enviar Mensaje
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* COMPONENTES AUXILIARES DE CONTACTO */

interface ContactItemProps {
  icon: React.ReactNode;
  title: string;
  detail: string;
}

function ContactItem({ icon, title, detail }: ContactItemProps) {
  return (
    <div className="flex items-start p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
      <div className="p-3 bg-rose-100 rounded-full mr-4 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-blue-900 text-lg mb-0.5">{title}</h4>
        <p className="text-gray-600">{detail}</p>
      </div>
    </div>
  );
}