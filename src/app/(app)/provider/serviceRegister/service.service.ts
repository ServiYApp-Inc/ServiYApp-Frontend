import apiClient from "./apiClient";

export const createService = async (serviceData: any) => {
    const { data } = await apiClient.post("/services/create", serviceData);
    return data;
    };