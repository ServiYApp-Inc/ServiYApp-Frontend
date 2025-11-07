"use client";

import Image from "next/image";
import { useCartStore } from "../../../src/app/store/useCartStore";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export default function ProductCard({ id, name, price, image }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price,
      image,
      quantity: 1,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
      {image && (
        <Image
          src={image}
          alt={name}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          <p className="text-gray-600 mt-1">${price.toFixed(2)}</p>
        </div>
        <button
          onClick={handleAddToCart}
          className="mt-4 bg-gradient-to-r from-red-500 to-rose-600 text-white py-2 px-4 rounded-xl hover:opacity-90 transition-all"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
