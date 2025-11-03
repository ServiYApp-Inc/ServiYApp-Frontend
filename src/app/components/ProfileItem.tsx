
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faGear, IconDefinition } from "@fortawesome/free-solid-svg-icons";


interface ProfileItemProps {
  icon: IconDefinition;
  label: string;
}

const ProfileItem = ({ icon, label }: ProfileItemProps) => (
  <div className="w-full flex justify-between items-center text-[20px] font-semibold border-b border-[#949492]
      cursor-pointer rounded-xl py-4 px-1 transition duration-200 hover:bg-gray-100">
      <span className="flex items-center gap-3">
        <FontAwesomeIcon icon={icon}  style={{ width: "1rem", height: "1rem" }}/>
        {label}
      </span>
      <FontAwesomeIcon icon={faChevronRight} style={{ width: "1rem", height: "1rem" }}/>
  </div>
);

export default ProfileItem;