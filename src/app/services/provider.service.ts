import { Api } from "./api";

//Obtener lista de países
export const getCountries = async () => {
	const { data } = await Api.get("/locations/countries");
	return data;
};

//Obtener regiones por país
export const getRegionsByCountry = async (countryId: string) => {
	const { data } = await Api.get(`/locations/${countryId}/regions`);
	return data;
};

//Obtener ciudades por región
export const getCitiesByRegion = async (regionId: string) => {
	const { data } = await Api.get(`/locations/regions/${regionId}/cities`);
	return data;
};

//Registrar proveedor manual
export const registerProvider = async (payload: any) => {
	const { data } = await Api.post("/auth/register/provider", payload);
	return data;
};

export const getCategories = async () => {
	const { data } = await Api.get("/categories");
	return data;
};

export const updateProvider = async (
	id: string,
	values: any,
	token: string
) => {
	return Api.patch(`/providers/${id}`, values, {
		headers: { Authorization: `Bearer ${token}` },
	});
};
