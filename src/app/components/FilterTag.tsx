import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface FilterTagProps {
    icon: IconDefinition;
    label: string;
}

export default function FilterTag({icon, label}: FilterTagProps) {
    return (
        <li className="max-w-[250px] border border-black/10 rounded-2xl px-4 py-2 hover:bg-black/5">
            <FontAwesomeIcon icon={icon}   className="text-sm md:text-base" style={{ width: "1rem", height: "1rem" }} /> {label}
        </li>
    );
}
