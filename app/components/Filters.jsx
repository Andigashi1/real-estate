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

    // Filter by developer
    if (filters.developer) {
      filtered = filtered.filter(
        (property) =>
          property.developer?.toLowerCase() === filters.developer.toLowerCase()
      );
    }

    // Filter by bedrooms
    if (filters.bedrooms) {
      if (filters.bedrooms === "studio") {
        filtered = filtered.filter(
          (property) =>
            property.bedrooms === 0 || property.type?.toLowerCase() === "studio"
        );
      } else if (filters.bedrooms === "5+") {
        filtered = filtered.filter((property) => property.bedrooms >= 5);
      } else {
        filtered = filtered.filter(
          (property) => property.bedrooms === parseInt(filters.bedrooms)
        );
      }
    }

    // Filter by price range
    if (filters.priceRange) {
      filtered = filtered.filter((property) => {
        const price = property.price || 0;
        switch (filters.priceRange) {
          case "0-500k":
            return price < 500000;
          case "500k-1m":
            return price >= 500000 && price < 1000000;
          case "1m-2m":
            return price >= 1000000 && price < 2000000;
          case "2m-5m":
            return price >= 2000000 && price < 5000000;
          case "5m-10m":
            return price >= 5000000 && price < 10000000;
          case "10m+":
            return price >= 10000000;
          default:
            return true;
        }
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
  }, [filters, properties]); // Removed onFilteredResults from dependency array

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
          <option value="studio">Studio</option>
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