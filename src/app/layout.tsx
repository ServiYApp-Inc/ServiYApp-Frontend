import AuthGuard from "@/components/AuthGuard";
import "./globals.css";
import { Nunito } from "next/font/google";
import React from "react";
import { ToastContainer } from "react-toastify";

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata = {
	title: "ServiYApp",
	description: "Descubre la belleza donde estés",
	icons: {
		icon: "/icon.png",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="es">
			<body className={nunito.className}>
				<AuthGuard>{children}</AuthGuard>
				<ToastContainer
					position="top-right"
					autoClose={2000}
					hideProgressBar={false}
					newestOnTop={true}
					closeOnClick
					pauseOnHover
					draggable
					theme="light"
				/>
			</body>
		</html>
	);
}
