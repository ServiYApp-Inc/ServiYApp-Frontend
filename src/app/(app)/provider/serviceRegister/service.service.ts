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

export const getAllServices = async (page: number, limit = 9) => {
    const { data } = await apiClient.get(`services/find-all?page=${page}&limit=${limit}`);
    return data;
};
export const getAllAdminServices = async () => {
    const { data } = await apiClient.get(`services/admin/all`);
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
    const { data } = await apiClient.patch(`services/activate/${id}`);
    return data;
};
export const setStatusInactive = async (id: string) => {
    const { data } = await apiClient.patch(`services/deactivate/${id}`);
    return data;
};

export const changeServiceStatus = async (id: string, status: "ACTIVE" | "INACTIVE") => {
    const { data } = await apiClient.patch(`services/status/${id}`, { status });
    return data;
};

export const deleteService = async (id: string) => {
    const { data } = await apiClient.delete(`services/delete/${id}`);
    return data;
};

// CATEGORIAS //

export const createCategory = async (categoryData: any) => {
    const { data } = await apiClient.post(`categories/create`, categoryData);
    return data;
};

export const getCategories = async () => {
    const { data } = await apiClient.get(`categories`);
    return data;
}
export const updateCategory = async (id: string, payload: any) => {
    const { data } = await apiClient.patch(`categories/update/${id}`, payload);
    return data;
};

export const deleteCategory = async (id: string) => {
    const { data } = await apiClient.delete(`categories/delete/${id}`);
    return data;
};


// Providers //

export const getProviders = async () => {
    const { data } = await apiClient.get(`providers`);
    return data;
}

export const inactiveProvider = async (id: string) => {
    const { data } = await apiClient.delete(`providers/${id}`);
    return data;
};

export const activeProvider = async (id: string) => {
    const { data } = await apiClient.patch(`providers/${id}/reactivate`);
    return data;
};

export const getReviewService = async (providerId: string, serviceId: string) => {
    const { data } = await apiClient.get(`/provider/${providerId}/service/${serviceId}/reviews`);
    return data;
};


// Users //

export const getUsers = async () => {
    const { data } = await apiClient.get(`users`);
    return data;
}

export const inactiveUser = async (id: string) => {
    const { data } = await apiClient.delete(`users/${id}`);
    return data;
};

export const activeUser = async (id: string) => {
    const { data } = await apiClient.patch(`users/${id}/reactivate`);
    return data;
};