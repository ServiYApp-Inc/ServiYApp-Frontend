✨ ServiYApp ✨

Plataforma integral de gestión de servicios de belleza a domicilio

---

🚀 Descripción General

**ServiYApp** es una plataforma integral diseñada para conectar a **clientes** con **proveedores de servicios de belleza**, permitiendo administrar reservas, coordinar citas mediante un chat interno y realizar pagos seguros a través de **Mercado Pago**.

El sistema incluye:

* Gestión completa de citas
* Chat en tiempo real entre clientes y proveedores
* Carrito de servicios
* Pagos mediante Mercado Pago
* Filtros avanzados de búsqueda
* Paneles diferenciados para cliente, proveedor y administrador.
* API documentada con Swagger
* Autenticación con JWT

Ofrece servicios como peluquería, maquillaje, manicura, pedicura, pestañas, cejas, masajes, limpieza facial y más.

---

 🧑‍💻 **Equipo de Desarrollo**

 **Frontend**

* Florencia Bustos
* Stefano Masotti
* Ariadna Ramírez

 **Backend**

* Jhonatan Cruz
* Diego Acuña
* Bruno Ramos Mejía

---

 🛠️ **Tecnologías Utilizadas**

## **Frontend**

| React | Next.js 14 | TypeScript | Zustand | Axios | Tailwind CSS | Mercado Pago |
| ----- | ---------- | ---------- | ------- | ----- | ------------ | ------------ |

## **Backend**

| Node.js | Express.js | Prisma ORM | PostgreSQL | JWT Auth | Swagger | Render |
| ------- | ---------- | ---------- | ---------- | -------- | ------- | ------ |


---

 🧭 **Características Principales (Frontend + Backend)**

 🎨 **Módulo Clientes**

* Registro e inicio de sesión
* Exploración de todos los servicios disponibles
* Filtros inteligentes:

  * Menor precio
  * Menor duración
  * Mejor valorados

* Vista de detalle y confirmación del servicio
* Carrito de compras
* Pago vía Mercado Pago
* Chat integrado con proveedores
* Gestión de citas:

  * Próximas
  * Completadas
  * Canceladas

---

## 💼 **Módulo Proveedores**

* Registro con datos profesionales
* Publicación de un servicio propio
* Chat interno para coordinar con clientes
* Gestión de citas:

  * Próximas
  * Finalizadas
  * Canceladas

* Perfil profesional editable
* Acceso a historial de turnos

---

# 💬 **Chat Integrado**

El sistema incorpora un módulo de mensajería que permite:

* Coordinar horarios con el proveedor
* Confirmar detalles del servicio
* Recibir indicaciones previas
* Facilitar la comunicación en tiempo real

---

# 💳 **Pasarela de Pagos — Mercado Pago**

Integramos **Mercado Pago Web Checkout**, lo que permite:

* Procesamiento seguro
* Tickets de pago
* Flujo: *selección → confirmación → carrito → pago*
* Validación del estado del pago en la API

---

# 🔧 **Backend — API y Base de Datos**

El backend cuenta con:

🔐 Autenticación

* JWT para manejo de sesiones
* Rutas protegidas
* Roles de **cliente**, **proveedor**, **administrador**

📄 API Documentada

### 🗄 Base de Datos

* PostgreSQL
* Relaciones entre usuarios, servicios y citas

---

# 🗂️ **Estructura General del Proyecto**

### **Frontend**

* Next.js + TypeScript
* Componentes reutilizables
* Manejo global del estado con Zustand
* Estilos con Tailwind CSS

### **Backend**

* Node.js + Express
* Módulos separados por dominio
* Type ORM para integridad y migraciones
* Middlewares de seguridad y validación
* Deploy en Render

---

# 🌐 **Deploys**

* **Frontend (Vercel):**
  👉 [https://serviyapp-frontend.vercel.app/](https://serviyapp-frontend.vercel.app/)

* **Backend (Render):**
  👉 [https://serviyapp-backend-betl.onrender.com/](https://serviyapp-backend-betl.onrender.com/)

* **API Docs (Swagger):**
  👉 [https://serviyapp-backend-betl.onrender.com/docs#/](https://serviyapp-backend-betl.onrender.com/docs#/)

---

 📄 **Licencia**

Proyecto desarrollado con fines educativos como entrega final del módulo correspondiente.
Sin licencia comercial.

---
