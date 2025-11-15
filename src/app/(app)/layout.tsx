"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import LogoutButton from "../components/LogoutButton";
import { useAuthStore } from "@/app/store/auth.store";
import "../globals.css";
import ChatWidget from "../components/chatWidget";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const { isAuthenticated } = useAuthStore(); // ⭐ saber si está logueado

  // Detecta si estamos en escritorio (≥768px)
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Define ancho dinámico solo en desktop
  const sidebarWidth = isDesktop
    ? isCollapsed
      ? "4.5rem"
      : "13rem"
    : "0";

  return (
    <div
      className="flex min-h-screen transition-all duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Sidebar visible solo en desktop */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Contenido principal */}
      <main
        className="flex-1 transition-all duration-300 relative"
        style={{
          marginLeft: sidebarWidth,
          padding: "2rem",
        }}
      >
        {/* Wrap de contenido */}
        <div className="pt-10 pb-10 md:pt-0 md:pb-0">{children}</div>

        {/* ⭐ CHAT WIDGET — solo desktop y solo logueado */}
        {isDesktop && isAuthenticated && <ChatWidget />}
      </main>
    </div>
  );
}
