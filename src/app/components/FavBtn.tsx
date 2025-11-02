"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";

export default function FavBtn() {
    const [isFav, setIsFav] = useState(false);

    const toggleFav = () => {
        setIsFav(!isFav);
        console.log("Favorito:", !isFav);
    };

    return (
        <button
        onClick={toggleFav}
        className="absolute top-2 right-2 bg-white/80 px-2 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform"
        >
        <FontAwesomeIcon
            icon={isFav ? solidHeart : regularHeart}
            className={isFav ? "text-red-500 text-sm md:text-base" : "text-gray-500 text-sm md:text-base"} style={{ width: "1rem", height: "1rem" }}
        />
        </button>
    );
}