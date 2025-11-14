import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface FilterTagsProviderProps {
	icon?: any;
	label: string;
	onClick?: () => void;
	active?: boolean;
}

export default function FilterTag({ icon, label, onClick, active = false }: FilterTagsProviderProps) {
	return (
		<li
			onClick={onClick}
			className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 
        ${active
				? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
				: "bg-white text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
			}`}
		>
			<FontAwesomeIcon icon={icon} />
			<span>{label}</span>
		</li>
	);
}
