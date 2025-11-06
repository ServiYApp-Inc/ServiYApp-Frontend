import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface FilterTagProps {
	icon: IconDefinition;
	label: string;
	onClick?: () => void;
	isActive?: boolean;
}

export default function FilterTag({ icon, label, onClick, isActive }: FilterTagProps) {
	return (
		<li
			onClick={onClick}
			className={`max-w-[250px] border border-black/10 rounded-2xl px-4 py-2 cursor-pointer transition-colors flex items-center gap-2
				${isActive ? "bg-[var(--color-primary)] text-white" : "hover:bg-black/5"}`}
		>
			<FontAwesomeIcon
				icon={icon}
				className="text-sm md:text-base"
				style={{ width: "1rem", height: "1rem" }}
			/>
			{label}
		</li>
	);
}

