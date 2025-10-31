"use client";
import React from 'react';
import { Heart, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button"; 
import Link from 'next/link'; 

export function Navbar() {
  return (
    <nav className="bg-white shadow-lg/5 py-5 px-6 fixed top-0 w-full z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo que enlaza al inicio */}
        <Link href="/" passHref>
          <h1 className="text-2xl font-serif text-blue-900 flex items-center cursor-pointer">
            <Heart className="w-6 h-6 mr-2 text-rose-500" /> ServiYApp
          </h1>
        </Link>
        
        {/* Menú de Navegación */}
        <ul className="hidden md:flex gap-10 text-gray-700 font-medium">
          
          <li className="hover:text-rose-500 cursor-pointer transition duration-200">
            <Link href="/servicios" passHref>Servicios</Link>
          </li>
          
          <li className="hover:text-rose-500 cursor-pointer transition duration-200">
            <Link href="/contact" passHref>Contacto</Link> 
          </li>
        </ul>
        
        {/* Botones de Acción */}
        <div className="flex gap-4 items-center">
          <Button variant="default" className="text-blue-900 border-blue-900 hover:bg-blue-50 transition duration-300">
            <Link href="/login" passHref>Login</Link>
          </Button>
          <Button variant="primary" className="hover:bg-rose-600 text-white transition duration-300">
            <Link href="/register" passHref>Registrarse</Link>
          </Button>
          <button className="md:hidden text-blue-900 p-2 rounded-md hover:bg-gray-100">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}

