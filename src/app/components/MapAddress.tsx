interface MapAddressProps {
  lat: number;
  lng: number;
  height?: string;
}

export default function MapAddress({
  lat,
  lng,
  height = "260px",
}: MapAddressProps) {
  const mapSrc = `https://www.google.com/maps?q=${lat},${lng}&z=17&hl=es&output=embed`;

  return (
    <div className="w-full bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      {/* Mapa */}
      <div className="w-full" style={{ height }}>
        <iframe
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {/* Footer con botón */}
      <div className="p-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">Ubicación exacta</p>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[var(--color-primary)] text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-[var(--color-primary-hover)] transition"
        >
          Cómo llegar
        </a>
      </div>
    </div>
  );
}
