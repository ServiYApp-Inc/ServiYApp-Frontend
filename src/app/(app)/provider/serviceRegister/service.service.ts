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

export const updateService = async (id: string, serviceData: any) => {
    const { data } = await apiClient.patch(`services/update/${id}`, serviceData);
    return data;
};

export const getOneService = async (id: string) => {
    const { data } = await apiClient.get(`services/find/${id}`);
    return data;
};

export const setStatusActive = async (id: string) => {
    const { data } = await apiClient.patch(`activate/${id}`);
    return data;
};
export const setStatusInactive = async (id: string) => {
    const { data } = await apiClient.patch(`deactivate/${id}`);
    return data;
};

export const changeServiceStatus = async (id: string, status: "ACTIVE" | "INACTIVE") => {
    const { data } = await apiClient.patch(`services/status/${id}`, { status });
    return data;
};