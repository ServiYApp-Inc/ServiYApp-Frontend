import { Api } from "./api"; // instancia base de Axios configurada (baseURL, interceptors, etc.)

// ====================
// 📍 LOCATIONS
// ====================

// Obtener lista de países
export const getCountries = async () => {
	const { data } = await Api.get("/locations/countries");
	return data;
};

// Obtener regiones por país
export const getRegionsByCountry = async (countryId: string) => {
	const { data } = await Api.get(`/locations/${countryId}/regions`);
	return data;
};

// Obtener ciudades por región
export const getCitiesByRegion = async (regionId: string) => {
	const { data } = await Api.get(`/locations/regions/${regionId}/cities`);
	return data;
};

// ====================
// 👤 PROVIDERS
// ====================

// Registrar proveedor manual
export const registerProvider = async (payload: any) => {
	const { data } = await Api.post("auth/register/provider", payload);
	return data;
};

// Obtener categorías
export const getCategories = async () => {
	const { data } = await Api.get("categories");
	return data;
};

// Actualizar proveedor (requiere token)
export const updateProvider = async (
	id: string,
	values: any,
	token: string
) => {
	return Api.patch(`providers/${id}`, values, {
		headers: { Authorization: `Bearer ${token}` },
	});
};

// Crear nueva dirección
// ====================
// 🏠 DIRECCIONES — con logs detallados
// ====================

// Crear dirección del usuario autenticado
export const createAddress = async (payload: any, token: string) => {
	const { data } = await Api.post("addresses", payload, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return data;
};

// Obtener todas las direcciones del usuario
export const getAddresses = async (token: string) => {
	const { data } = await Api.get("addresses", {
		headers: { Authorization: `Bearer ${token}` },
	});
	return data;
};

// Obtener una dirección por id
export const getAddressById = async (id: string, token: string) => {
	const { data } = await Api.get(`addresses/${id}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return data;
};

// Actualizar dirección (PATCH /addresses/:id)
export const updateAddress = async (
	id: string,
	payload: any,
	token: string
) => {
	const { data } = await Api.patch(`addresses/${id}`, payload, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return data;
};

// Desactivar dirección
export const deactivateAddress = async (id: string, token: string) => {
	const { data } = await Api.patch(
		`addresses/deactivate/${id}`,
		{},
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	return data;
};

// Reactivar dirección
export const reactivateAddress = async (id: string, token: string) => {
	const { data } = await Api.patch(
		`addresses/reactivate/${id}`,
		{},
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	return data;
};

export const createProviderReview = async (formData: FormData, token: string) => {
	const { data } = await Api.post(
		"reviews/createReviewProvider",
		formData,
		{
		headers: {
			Authorization: `Bearer ${token}`,
			// ❌ NO AGREGAR Content-Type
		},
		}
	);

	return data;
	};


