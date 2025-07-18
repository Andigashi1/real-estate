import Link from "next/link";
import { areas, companies } from "../lib/areas";
import { MapPin, Bed, Square } from "lucide-react";

const typeColorMap = {
  Villa: "bg-red-600",
  Apartment: "bg-blue-600",
  Townhouse: "bg-purple-600",
  Penthouse: "bg-yellow-600",
  Studio: "bg-green-600",
  // Ensure consistency: If your data might have "studio" (lowercase), add it here
  // or ensure the normalization handles it to match existing keys.
  Default: "bg-gray-600",
};

const PropertyCard = ({ property }) => {
  const formatPrice = (price) => {
    if (!Number.isFinite(price)) {
      return "N/A";
    }
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}M`;
    if (price >= 1_000) return `${(price / 1_000).toFixed(0)}K`;
    return `${price}`;
  };

  const imageUrl =
    property.images?.[0]?.url ||
    "https://via.placeholder.com/300x200?text=No+Image+Available";

  const locationLabel =
    areas.find((loc) => loc.value === property.location)?.label ||
    property.location;
  const companyLabel =
    companies.find((company) => company.value === property.developer)?.label ||
    property.developer;

  const units = property.unitTypes || [];
  const hasUnits = units.length > 0;

  const minPrice = hasUnits
    ? Math.min(...units.map((u) => u.minPrice ?? Infinity))
    : 0;
  const maxPrice = hasUnits
    ? Math.max(...units.map((u) => u.maxPrice ?? 0))
    : 0;

  const minArea = hasUnits
    ? Math.min(...units.map((u) => u.minArea ?? Infinity))
    : 0;
  const maxArea = hasUnits ? Math.max(...units.map((u) => u.maxArea ?? 0)) : 0;

  const validBedrooms = units.map((u) => u.bedrooms).filter((b) => b != null);

  const minBedrooms =
    hasUnits && validBedrooms.length > 0 ? Math.min(...validBedrooms) : 0;
  const maxBedrooms =
    hasUnits && validBedrooms.length > 0 ? Math.max(...validBedrooms) : 0;

  const bedroomLabel =
    hasUnits && validBedrooms.length > 0
      ? minBedrooms === maxBedrooms
        ? minBedrooms === 0
          ? "Studio"
          : `${minBedrooms} BR`
        : `${minBedrooms}–${maxBedrooms} BR`
      : "N/A";

  // --- Start of refined type handling ---

  // Helper function to normalize a type string
  const normalizeTypeString = (type) => {
    if (!type || typeof type !== "string" || type.trim() === "") {
      return null; // Return null for invalid or empty strings
    }
    // Capitalize first letter, lowercase the rest
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  const types = property.type
    ? property.type.split(",").map((t) => t.trim())
    : [];

  // Function to get class based on type
  const getTypeClass = (type) => {
    switch (type.toLowerCase()) {
      case "apartment":
        return "bg-blue-500";
      case "penthouse":
        return "bg-purple-500";
      case "house":
        return "bg-green-500";
      case "villa":
        return "bg-yellow-500";
      case "condo":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Function to render multiple type badges
  const renderTypeBadges = () => {
    return (
      <div className="flex gap-1">
        {types.length > 0 && (
          <div className="flex flex-col gap-2">
            {types.map((type, index) => {
              const typeClass = getTypeClass(type);
              return (
                <span
                  key={index}
                  className={`${typeClass} text-white px-2 py-0.5 rounded-full text-xs font-semibold uppercase`}
                >
                  {type}
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  // --- End of refined type handling ---

  return (
    <Link href={`/projects/${property.id}`} className="group">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden max-w-80 h-full w-full mx-auto relative">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          <div className="absolute top-3 left-3">{renderTypeBadges()}</div>

          <div className="absolute top-3 right-3">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-bold shadow-md">
              {formatPrice(minPrice)} {!property.newLaunch && <span>-</span>}{" "}
              {!property.newLaunch && formatPrice(maxPrice)} AED
            </span>
          </div>

          {property.newLaunch && (
            <div className="absolute bottom-3 right-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                NEW LAUNCH
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
            {property.title}
          </h3>

          <div className="flex items-center gap-1 text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{locationLabel}</span>
          </div>

          <div className="flex items-center gap-4 mb-4 text-gray-600">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span className="text-sm">{bedroomLabel}</span>
            </div>

            <div className="flex items-center gap-1">
              <Square className="w-4 h-4" />
              <span className="text-sm">
                {minArea} – {maxArea} m²
              </span>
            </div>
          </div>

          {property.developer && (
            <div className="mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Developer
              </span>
              <p className="text-sm font-medium text-gray-700">
                {companyLabel}
              </p>
            </div>
          )}

          {property.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {property.description}
            </p>
          )}
        </div>

        {property.featured && (
          <div className="absolute top-0 left-0 bg-yellow-500 text-white px-3 py-1 text-xs font-bold uppercase transform -rotate-45 -translate-x-4 translate-y-4">
            Featured
          </div>
        )}
      </div>
    </Link>
  );
};

export default PropertyCard;
