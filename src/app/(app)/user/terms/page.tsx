

export default function PageTerms() {
	return (
		<main className="max-w-4xl mx-auto px-6 py-12 text-gray-800 leading-relaxed">
			<h1 className="text-3xl font-bold mb-6 text-center text-[var(--color-primary)]">
				Términos y Condiciones de Uso — ServiYApp
			</h1>

			<p className="text-sm text-gray-500 mb-8 text-center">
				Última actualización: 13 de noviembre de 2025
			</p>

			<section className="space-y-5">
				<p>
					Bienvenido/a a <strong>ServiYApp</strong>, una plataforma digital que
					conecta a <strong>prestadores de servicios de belleza</strong> con{" "}
					<strong>personas interesadas en contratarlos</strong>. Al acceder y
					utilizar nuestro sitio o aplicación, usted acepta los presentes
					Términos y Condiciones de Uso. Le recomendamos leerlos atentamente
					antes de registrarse o utilizar cualquier funcionalidad.
				</p>

				<h2 className="text-xl font-semibold mt-8">1. Definiciones</h2>
				<ul className="list-disc pl-6 space-y-2">
					<li>
						<strong>“ServiYApp”:</strong> Plataforma tecnológica que facilita la
						conexión entre usuarios y prestadores de servicios de belleza.
					</li>
					<li>
						<strong>“Usuario” o “Cliente”:</strong> Persona que utiliza la
						plataforma para buscar o contratar un servicio.
					</li>
					<li>
						<strong>“Prestador” o “Proveedor”:</strong> Persona o empresa que
						ofrece servicios de belleza a través de ServiYApp.
					</li>
					<li>
						<strong>“Plataforma”:</strong> Sitio web y/o aplicación móvil de
						ServiYApp.
					</li>
				</ul>

				<h2 className="text-xl font-semibold mt-8">
					2. Objeto de la Plataforma
				</h2>
				<p>
					ServiYApp actúa <strong>únicamente como intermediario tecnológico</strong> entre usuarios y prestadores.
					No presta servicios de belleza, ni garantiza la calidad o
					disponibilidad de los mismos. Los acuerdos comerciales se celebran{" "}
					<strong>directamente entre el Usuario y el Prestador</strong>.
				</p>

				<h2 className="text-xl font-semibold mt-8">
					3. Registro y Cuenta de Usuario
				</h2>
				<p>El usuario se compromete a:</p>
				<ul className="list-disc pl-6 space-y-2">
					<li>Proporcionar información veraz, completa y actualizada.</li>
					<li>Mantener la confidencialidad de sus credenciales.</li>
					<li>
						Ser responsable de todas las actividades realizadas con su cuenta.
					</li>
				</ul>
				<p>
					ServiYApp podrá suspender o eliminar cuentas que infrinjan estos
					Términos o hagan uso indebido de la plataforma.
				</p>

				<h2 className="text-xl font-semibold mt-8">
					4. Responsabilidad del Prestador
				</h2>
				<p>
					Los prestadores son los únicos responsables de la veracidad de la
					información publicada, la calidad y legalidad de los servicios, y de
					poseer las habilitaciones necesarias. ServiYApp no garantiza ni
					certifica su experiencia o idoneidad profesional.
				</p>

				<h2 className="text-xl font-semibold mt-8">
					5. Responsabilidad del Usuario
				</h2>
				<p>
					El Usuario debe utilizar la plataforma de forma lícita y respetuosa,
					evaluar libremente a los Prestadores y coordinar los servicios bajo
					su propia responsabilidad. ServiYApp no se hace responsable por daños
					derivados de las interacciones entre Usuarios y Prestadores.
				</p>

				<h2 className="text-xl font-semibold mt-8">
					6. Pagos y Transacciones
				</h2>
				<p>
					ServiYApp puede ofrecer sistemas de pago propios o de terceros. En
					caso de utilizar medios externos, aplicarán las condiciones de esos
					proveedores. ServiYApp no se responsabiliza por errores o demoras
					generadas por sistemas de pago ajenos.
				</p>

				<h2 className="text-xl font-semibold mt-8">
					7. Propiedad Intelectual
				</h2>
				<p>
					Todo el contenido de la plataforma (marca, diseño, software, logos,
					textos e imágenes) es propiedad de ServiYApp o de sus respectivos
					titulares. Queda prohibido su uso o reproducción sin autorización
					previa y por escrito.
				</p>

				<h2 className="text-xl font-semibold mt-8">
					8. Privacidad y Protección de Datos
				</h2>
				<p>
					ServiYApp trata los datos personales conforme a su{" "}
					<strong>Política de Privacidad</strong>, la cual forma parte de estos
					Términos. Al utilizar la plataforma, el usuario autoriza dicho
					tratamiento.
				</p>

				<h2 className="text-xl font-semibold mt-8">
					9. Limitación de Responsabilidad
				</h2>
				<p>
					ServiYApp no garantiza el funcionamiento ininterrumpido del servicio y
					no se hace responsable por fallas técnicas, información incorrecta o
					daños derivados de servicios contratados fuera de la plataforma.
				</p>

				<h2 className="text-xl font-semibold mt-8">10. Modificaciones</h2>
				<p>
					ServiYApp podrá modificar estos Términos en cualquier momento. Las
					modificaciones serán publicadas y entrarán en vigor desde su
					publicación. El uso continuado implica la aceptación de las nuevas
					condiciones.
				</p>

				<h2 className="text-xl font-semibold mt-8">
					11. Legislación Aplicable y Jurisdicción
				</h2>
				<p>
					Estos Términos se rigen por las leyes de la{" "}
					<strong>República Argentina</strong>. Cualquier controversia será
					resuelta por los tribunales de la Ciudad de Buenos Aires, salvo
					disposición legal en contrario.
				</p>

				<h2 className="text-xl font-semibold mt-8">12. Contacto</h2>
				<p>
					Para consultas o reclamos sobre los presentes Términos, puede
					contactarnos en:
				</p>
				<ul className="list-none pl-0">
					<li>📧 <strong>serviyapp.auth@gmail.com</strong></li>
					<li>🌐 <strong>https://serviyapp-frontend.vercel.app/</strong></li>
				</ul>
			</section>
		</main>
	);
}
