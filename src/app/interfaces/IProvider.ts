import ICity from "./ICity";
import ICountry from "./ICountry";
import IRegion from "./IRegion";

export default interface IProvider {
	id: string;
	names: string;
	surnames: string;
	userName?: string;
	email: string;
	phone: string;
	password?: string;
	country?: ICountry;
	region?: IRegion;
	city?: ICity;
	address?:string;
	profilePicture?: string;
	role?:string;
	status?: string;
	isComplete?: string;
	registrationDate?:string;

}
