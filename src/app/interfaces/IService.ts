import { ICategory } from "./ICategory";
import IProvider from "./IProvider";

export default interface IService {
	id: string;
	name: string;
	description:string;
	photo?: string;
	status:string;
	duration: number;
	createdAt:string;
	provider: IProvider;	
	rating: number;
	price: number;
	category: ICategory;
}