import axios from "axios";
import { useAuthStore } from "@/app/store/auth.store";

const apiClient = axios.create({
    baseURL: "https://serviyapp-backend-betl.onrender.com/",
    });

    apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    console.log(token);
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
    });

    export default apiClient;