'use client';

import { useState, useEffect } from 'react';
import { prisma } from '../lib/prisma'; // Adjust the path to your prisma instance
import PropertyCard from '../components/PropertyCard';
import Filters from '../components/Filters';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects'); // You'll need to create this API route
        const data = await response.json();
        setProjects(data);
        setFilteredProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Handle filtered results from Filters component
  const handleFilteredResults = (filtered) => {
    setFilteredProjects(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col pt-36 items-center justify-center">
        <div className="text-xl">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-36 items-center space-y-6 mx-8 mb-20">
      <h1 className="text-4xl font-bold">Explore our options</h1>
      <Filters 
        properties={projects} 
        onFilteredResults={handleFilteredResults}
      />
      <div className="w-full max-w-7xl">
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredProjects.length} of {projects.length} properties
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full">
          {filteredProjects.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        {filteredProjects.length === 0 && projects.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            No properties match your current filters. Try adjusting your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}