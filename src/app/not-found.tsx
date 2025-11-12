export default function NotFound() {
	return (
		<main className="flex flex-col items-center justify-center h-screen  text-white text-center">
			<h1 className="text-6xl font-bold text-[var(--color-primary)] mb-4">
				404
			</h1>
			<p className="text-lg mb-6 text-[var(--color-primary)] ">
				Oops... la página que buscás no existe o fue movida
			</p>
			<a
				href="/"
				className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-6 py-3 rounded-2xl font-semibold transition"
			>
				Volver a la pagina principal
			</a>
		</main>
	);
}
