"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { areas, companies } from "../lib/areas";

const Filters = ({ properties = [], onFilteredResults }) => {
  const [filters, setFilters] = useState({
    propertyType: "",
    location: "",
    area: "",
    developer: "",
    bedrooms: "",
    priceRange: "",
    search: "",
  });

  const [filteredProperties, setFilteredProperties] = useState(properties);



  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
  };

  // Apply all filters to properties when filters state changes
  useEffect(() => {
    let filtered = [...properties];

    // Filter by property type
    if (filters.propertyType) {
      filtered = filtered.filter(
        (property) =>
          property.type?.toLowerCase() === filters.propertyType.toLowerCase()
      );
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(
        (property) =>
          property.location?.toLowerCase() === filters.location.toLowerCase()
      );
    }

    // Filter by area
    if (filters.area) {
      filtered = filtered.filter(
        (property) =>
          property.area?.toLowerCase() === filters.area.toLowerCase()
      );
    }

    // Filter by developer
    if (filters.developer) {
      filtered = filtered.filter(
        (property) =>
          property.developer?.toLowerCase() === filters.developer.toLowerCase()
      );
    }

    // Filter by bedrooms
    if (filters.bedrooms) {
      filtered = filtered.filter((property) => {
        // Extract unit types (same logic as in PropertyCard)
        const units = property.unitTypes || [];
        
        if (units.length === 0) {
          return false;
        }
        
        // Calculate min and max bedrooms from unitTypes (same as PropertyCard)
        const minBedrooms = Math.min(...units.map((u) => u.bedrooms ?? 0));
        const maxBedrooms = Math.max(...units.map((u) => u.bedrooms ?? 0));
        
        if (filters.bedrooms === "studio") {
          // Studio: check if range includes 0 bedrooms
          return minBedrooms === 0;
        } else if (filters.bedrooms === "5+") {
          // 5+: check if max bedrooms is 5 or more
          return maxBedrooms >= 5;
        } else {
          // Exact bedroom count: check if the selected number falls within the range
          const selectedBedrooms = parseInt(filters.bedrooms);
          return minBedrooms <= selectedBedrooms && maxBedrooms >= selectedBedrooms;
        }
      });
    }

    // Filter by price range - Updated to handle price ranges
    if (filters.priceRange) {
      filtered = filtered.filter((property) => {
        // Get filter price range boundaries
        let filterMin = 0;
        let filterMax = Infinity;
        
        switch (filters.priceRange) {
          case "0-500k":
            filterMin = 0;
            filterMax = 500000;
            break;
          case "500k-1m":
            filterMin = 500000;
            filterMax = 1000000;
            break;
          case "1m-2m":
            filterMin = 1000000;
            filterMax = 2000000;
            break;
          case "2m-5m":
            filterMin = 2000000;
            filterMax = 5000000;
            break;
          case "5m-10m":
            filterMin = 5000000;
            filterMax = 10000000;
            break;
          case "10m+":
            filterMin = 10000000;
            filterMax = Infinity;
            break;
          default:
            return true;
        }
        
        // Check if property's price range overlaps with filter range
        // Properties with minPrice and maxPrice from your schema
        const propertyMin = property.minPrice || 0;
        const propertyMax = property.maxPrice || property.minPrice || Infinity;
        
        // Two ranges overlap if: propertyMin <= filterMax AND propertyMax >= filterMin
        return propertyMin <= filterMax && propertyMax >= filterMin;
      });
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (property) =>
          property.title?.toLowerCase().includes(searchTerm) ||
          property.description?.toLowerCase().includes(searchTerm) ||
          property.area?.toLowerCase().includes(searchTerm) ||
          property.developer?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredProperties(filtered);
    if (typeof onFilteredResults === "function") {
      onFilteredResults(filtered);
    }
  }, [filters, properties]);

  // Clear all filters
  const clearAllFilters = () => {
    const emptyFilters = {
      propertyType: "",
      location: "",
      area: "",
      developer: "",
      bedrooms: "",
      priceRange: "",
      search: "",
    };
    setFilters(emptyFilters);
  };

  return (
    <div className="p-4 rounded-lg shadow-sm border bg-white">
      <div className="flex flex-wrap gap-4 w-full items-center">
        {/* Property Type */}
        <select
          className="border-2 border-foreground px-3 py-2 rounded-lg min-w-32"
          value={filters.propertyType}
          onChange={(e) => handleFilterChange("propertyType", e.target.value)}
        >
          <option value="">Lloji Prones</option>
          <option value="apartment">Apartment</option>
          <option value="villa">Villa</option>
          <option value="townhouse">Townhouse</option>
          <option value="penthouse">Penthouse</option>
          <option value="mansion">Mansion</option>
        </select>

        {/* Location */}
        <select
          className="border-2 border-foreground px-3 py-2 rounded-lg min-w-40"
          value={filters.area}
          onChange={(e) => handleFilterChange("area", e.target.value)}
        >
          {areas.map(area => (
            <option key={area.value} value={area.value}>{area.label}</option>
          ))}
        </select>

        {/* Developers */}
        <select name="developers" id="developers"
        className="border-2 border-foreground px-3 py-2 rounded-lg min-w-40"
          value={filters.developer}
          onChange={(e) => handleFilterChange("developer", e.target.value)}>
            {companies.map((dev => (
              <option key={dev.value} value={dev.value}>{dev.label}</option>
            )))}
        </select>

        {/* Bedrooms */}
        <select
          className="border-2 border-foreground px-3 py-2 rounded-lg min-w-28"
          value={filters.bedrooms}
          onChange={(e) => handleFilterChange("bedrooms", e.target.value)}
        >
          <option value="">Numri i Dhomave</option>
          <option value="studio">Studio</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5+">5+</option>
        </select>

        {/* Price Range */}
        <select
          className="border-2 border-foreground px-3 py-2 rounded-lg min-w-32"
          value={filters.priceRange}
          onChange={(e) => handleFilterChange("priceRange", e.target.value)}
        >
          <option value="">Cmimi</option>
          <option value="0-500k">Under 500K AED</option>
          <option value="500k-1m">500K - 1M AED</option>
          <option value="1m-2m">1M - 2M AED</option>
          <option value="2m-5m">2M - 5M AED</option>
          <option value="5m-10m">5M - 10M AED</option>
          <option value="10m+">10M+ AED</option>
        </select>

        {/* Search Input */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            name="search"
            placeholder="Kerko prona..."
            className="border-2 border-foreground px-3 py-2 pl-10 rounded-lg w-full"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={clearAllFilters}
          className="text-foreground px-3 py-2 text-sm font-medium hover:bg-foreground hover:text-background rounded-lg transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Filter Results Count */}
      <div className="mt-3 text-sm">
        {Object.values(filters).some((filter) => filter !== "") && (
          <span>Active filters applied</span>
        )}
      </div>
    </div>
  );
};

export default Filters;