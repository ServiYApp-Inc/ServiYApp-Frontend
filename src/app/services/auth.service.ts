import IUser from "../interfaces/IUser";
import { Api } from "./api";
import { Role } from "@/app/store/auth.store";

type LoginDto = {
	email: string;
	password: string;
};

export type AuthPayload = {
	token: string;
	role: Role;
	user: IUser;
};

export const AuthService = {
	async login(role: Role, dto: LoginDto): Promise<AuthPayload> {
		const endpoint =
			role === "provider" ? "/auth/login/provider" : "/auth/login/user";

		const { data } = await Api.post(endpoint, dto);

		// 🔸 Ajustamos según la estructura real de tu backend
		return {
			token: data.access_token,
			role: role,
			user: data.provider || data.user,
		};
	},

	startGoogle(role: Role) {
		const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/";
		window.location.href = `${base}auth/google/start?role=${role}`;
	},
};
