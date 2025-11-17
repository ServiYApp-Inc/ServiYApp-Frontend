"use client";

import { Api } from "@/app/services/api";

// 🧾 1️⃣ Crear orden de servicio
export const createServiceOrder = async (payload: {
	providerId: string;
	userId: string;
	serviceId: string;
	addressId: string;
	price: number; // ⭐ AGREGADO
}) => {
	try {
		console.log("📦 Enviando orden de servicio:", payload);

		const { data } = await Api.post("service-orders/create", payload);

		if (!data?.id) {
			throw new Error("❌ El backend no devolvió el ID de la orden");
		}

		console.log("✅ Orden creada exitosamente:", data);
		return data;
	} catch (error: any) {
		console.error(
			"❌ Error al crear la orden de servicio:",
			error.response?.data || error.message
		);
		throw new Error("Error al crear la orden de servicio");
	}
};

// 💳 2️⃣ Crear preferencia de pago (solo si existe la orden)
export const createPaymentPreference = async (payload: {
	amount: number;
	description: string;
	payerEmail: string;
	currency: string;
	serviceOrderId: string;
}) => {
	try {
		console.log("💰 Enviando preferencia de pago:", payload);

		const { data } = await Api.post("payments/create-preference", payload);

		if (!data?.init_point) {
			throw new Error("❌ No se recibió init_point de Mercado Pago");
		}

		console.log("✅ Preferencia de pago creada:", data);
		return data;
	} catch (error: any) {
		console.error(
			"❌ Error al crear la preferencia de pago:",
			error.response?.data || error.message
		);
		throw new Error("Error al crear la preferencia de pago");
	}
};

// 🧠 3️⃣ Flujo combinado seguro
export const createOrderAndPayment = async (payload: {
	providerId: string;
	userId: string;
	serviceId: string;
	addressId: string;
	amount: number;
	description: string;
	payerEmail: string;
	currency: string;
}) => {
	try {
		// Paso 1: Crear la orden
		const order = await createServiceOrder({
			providerId: payload.providerId,
			userId: payload.userId,
			serviceId: payload.serviceId,
			addressId: payload.addressId,
			price: payload.amount,
		});

		// Paso 2: Crear la preferencia solo si la orden tiene ID
		const payment = await createPaymentPreference({
			amount: Number(payload.amount),
			description: payload.description,
			payerEmail: payload.payerEmail,
			currency: payload.currency,
			serviceOrderId: order.id,
		});

		return { order, payment };
	} catch (error: any) {
		console.error(
			"❌ Error general en la creación de orden y pago:",
			error
		);
		throw error;
	}
};
