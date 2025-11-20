import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faStar,
	faClock,
	faTag,
	faCartPlus,
} from "@fortawesome/free-solid-svg-icons";
import FavBtn from "./FavBtn";
import SeeMoreBtn from "./SeeMoreBtn";
import IService from "../interfaces/IService";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth.store";

export default function ServiceCard({
	id,
	name,
	description,
	photos,     // <-- ✔️ ahora sí
	status,
	duration,
	createdAt,
	provider,
	rating,
	price,
	category,
}: IService) {
	const providerName = `${provider.names} ${provider.surnames}`;
	const { user, role } = useAuthStore();
	const router = useRouter();

	const handleAddToCart = () => {
		router.push(`/user/order/confirm?id=${id}`);
	};

	const getCurrencyByCountry = (countryName?: string) => {
		if (!countryName) return "COP"; // default

		const normalized = countryName.toLowerCase();

		if (normalized.includes("colombia")) return "COP";
		if (normalized.includes("méxico") || normalized.includes("mexico")) return "MXN";
		if (normalized.includes("argentina")) return "ARS";

		return "COP"; // fallback
	};

	const userCountry = user?.country?.name;
	const currency = getCurrencyByCountry(userCountry);

	// -------------------------
	// URL DE LA IMAGEN (robusta)
	// -------------------------
	const baseUrl =
		process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";

	const firstPhoto =
		photos?.[0]
			? photos[0] // ✔️ Cloudinary ya viene con URL completa
			: "/images/placeholder-service.png";

	return (
		<div className="flex flex-col w-full max-w-[330px] h-[440px] border border-[#949492] rounded-lg hover:scale-105 transition-transform hover:shadow-lg bg-white">
			<div className="relative h-[60%]">
				<img
					src={firstPhoto}
					alt={`Imagen de ${name}`}
					className="w-full h-full rounded-t-lg object-cover"
				/>

				<span className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded-lg text-sm font-medium">
					<FontAwesomeIcon icon={faTag} /> {category.name}
				</span>
			</div>

			<p className="pt-4 px-4 text-2xl font-semibold text-[var(--color-primary)] overflow-hidden text-ellipsis whitespace-nowrap">
				{name}
			</p>

			<span className="px-4 text-md text-[#949492] font-medium">
				Por {providerName}
			</span>

			<span className="flex flex-row justify-between mt-7 pb-1 px-4 border-b border-[#949492]">
				<p className="text-md text-black/40 font-medium">
					<FontAwesomeIcon icon={faClock} /> {duration} min
				</p>
			</span>

			<span className="flex flex-row justify-between items-center px-4 mt-2">
				<p className="text-md text-[var(--color-primary)] font-bold">
					${price}
				</p>
				<div className="flex items-center gap-2">
					<SeeMoreBtn id={id} />

					{role === "provider" || role === "admin" ? null : (
						<FontAwesomeIcon
							icon={faCartPlus}
							className="bg-[var(--color-primary)] p-1 rounded-lg text-white hover:scale-[1.05] hover:bg-[var(--color-primary-hover)] transition"
							style={{ width: "1.4rem", height: "1.4rem" }}
							onClick={handleAddToCart}
						/>
					)}
				</div>
			</span>
		</div>
	);
}
