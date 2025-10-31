"use client";
import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-sm">
          <div>
            {/* Logo y Marca */}
            <h1 className="text-2xl font-serif text-rose-500 mb-4 flex items-center">
              <Heart className="w-6 h-6 mr-2" /> ServiYApp
            </h1>
            <p className="text-gray-500">
              Conectamos especialistas de belleza verificados con clientes para servicios premium a domicilio en todo el país.
            </p>
          </div>
          {/* Enlaces de Navegación */}
          <div>
            <h4 className="font-semibold mb-4 text-white uppercase tracking-wider">Clientes</h4>
            <ul className="space-y-2">
              <li className="hover:text-rose-400 cursor-pointer transition">Cómo funciona</li>
              <li className="hover:text-rose-400 cursor-pointer transition">Servicios disponibles</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white uppercase tracking-wider">Especialistas</h4>
            <ul className="space-y-2">
              <li className="hover:text-rose-400 cursor-pointer transition">Únete al equipo</li>
            </ul>
          </div>
          {/* Información de Contacto */}
          <div>
            <h4 className="font-semibold mb-4 text-white uppercase tracking-wider">Contacto</h4>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-rose-500" />
                serviciosyaplicacion@gmail.com
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-rose-500" />
                +54 9 11 5555 5555
              </li>
              <li className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-rose-500" />
                Argentina
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-gray-600 border-t border-gray-800 pt-8 mt-12">
          © {new Date().getFullYear()} ServiYApp. Todos los derechos reservados.
        </div>
      </footer>
  );
}

