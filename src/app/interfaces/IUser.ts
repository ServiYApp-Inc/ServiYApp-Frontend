import ICountry from "./ICountry";

export default interface IUser {
	id: string;
	email: string;
	names?: string;
	surnames?: string;
	profilePicture?: string;
	country: ICountry;
	role: "admin" | "provider" | "user";
	phone: string;
	status?: string
}
