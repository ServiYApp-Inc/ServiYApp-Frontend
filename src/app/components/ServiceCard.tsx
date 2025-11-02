import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faClock, faTag } from "@fortawesome/free-solid-svg-icons";
import FavBtn from "./FavBtn";
import SeeMoreBtn from "./SeeMoreBtn";
import IService from "../interfaces/IService";

export default function ServiceCard({
	id,
	name,
	description,
	photo,
	status,
	duration,
	createdAt,
	provider,
	rating,
	price,
	category,
}: IService) {
	const providerName = `${provider.names} ${provider.surnames}`;

	return (
		<div className="flex flex-col w-full max-w-[330px] h-[440px] border border-[#949492] rounded-lg hover:scale-105 transition-transform hover:shadow-lg bg-white">
			<div className="relative h-[60%]">
				<img
					src={photo}
					alt={`Imagen de ${name}`}
					className="w-full h-full rounded-t-lg object-cover"
				/>
				<FavBtn />
				<span className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded-lg text-sm font-medium">
					<FontAwesomeIcon
						icon={faTag}
						className="text-sm md:text-base"
						style={{ width: "1rem", height: "1rem" }}
					/>{" "}
					{category.name}
				</span>
			</div>

			<p className="pt-4 px-4 text-2xl font-semibold text-[var(--color-primary)]">
				{name}
			</p>
			<span className="px-4 text-md text-[#949492] font-medium">
				Por {providerName}
			</span>

			<span className="flex flex-row justify-between mt-7 pb-1 px-4 border-b border-[#949492]">
				<p className="text-md text-black/40 font-medium">
					<FontAwesomeIcon
						icon={faClock}
						className="text-sm md:text-base"
						style={{ width: "1rem", height: "1rem" }}
					/>{" "}
					{duration} min
				</p>
				<p className=" text-md text-[var(--color-primary)] font-bold">
					{rating}{" "}
					<FontAwesomeIcon
						icon={faStar}
						className="text-sm md:text-base"
						style={{ width: "1rem", height: "1rem" }}
					/>
				</p>
			</span>

			<span className="flex flex-row justify-between px-4 mt-2">
				<p className="text-md text-[var(--color-primary)] font-bold">
					${price} mxn
				</p>
				<SeeMoreBtn id={id} />
			</span>
		</div>
	);
}
