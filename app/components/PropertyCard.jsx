import Link from 'next/link';
import { MapPin, Bed, Bath, Square, Eye } from 'lucide-react';

const PropertyCard = ({ property }) => {
  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M AED`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K AED`;
    }
    return `${price} AED`;
  };

  const getBedroomText = (bedrooms, type) => {
    if (type?.toLowerCase() === 'studio' || bedrooms === 0) {
      return 'Studio';
    }
    return `${bedrooms} BR`;
  };

  const imageUrl =
    property.images?.[0]?.url || '/api/placeholder/400/300';

  return (
    <Link href={`/projects/${property.id}`} className="group">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden max-w-80 w-full mx-auto relative">
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Property Type Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
              {property.type}
            </span>
          </div>

          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-bold shadow-md">
              {formatPrice(property.price)}
            </span>
          </div>
        
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
            {property.title}
          </h3>

          <div className="flex items-center gap-1 text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{property.location}</span>
          </div>

          <div className="flex items-center gap-4 mb-4 text-gray-600">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span className="text-sm">{getBedroomText(property.bedrooms, property.type)}</span>
            </div>

            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span className="text-sm">{property.bathrooms} Bath</span>
              </div>
            )}

            {property.area && (
              <div className="flex items-center gap-1">
                <Square className="w-4 h-4" />
                <span className="text-sm">{property.area} m²</span>
              </div>
            )}
          </div>

          {property.developer && (
            <div className="mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Developer</span>
              <p className="text-sm font-medium text-gray-700">{property.developer}</p>
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
