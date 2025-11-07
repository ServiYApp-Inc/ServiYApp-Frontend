import apiClient from "./apiClient";

export const createService = async (serviceData: any) => {
    const { data } = await apiClient.post("services/create", serviceData);
    return data;
    };

// Traer todos los servicios de un proveedor específico
export const getProviderServices = async (providerId: string) => {
    const { data } = await apiClient.get(`services/provider/${providerId}`);
    return data;
    };

