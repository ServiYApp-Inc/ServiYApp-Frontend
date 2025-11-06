import axios from "axios";
import { useAuthStore } from "@/app/store/auth.store";

export const Api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Interceptor para agregar token del store
Api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			const { clearAuth } = useAuthStore.getState();
			clearAuth();
			if (typeof window !== "undefined") {
				window.location.href = "/loginUser";
			}
		}
		return Promise.reject(error);
	}
);
