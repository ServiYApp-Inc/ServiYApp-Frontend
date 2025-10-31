
import "./globals.css";
import { Nunito } from "next/font/google";
import React from "react";

const nunito = Nunito({ subsets: ["latin"], weight: ["400","600","700"] });

export const metadata = {
  title: "ServiYApp",
  description: "Descubre la belleza donde estés",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={nunito.className}>
        {children}
      </body>
    </html>
  );
}
