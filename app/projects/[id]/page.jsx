"use client";

import { useState, useEffect, use } from "react";
import { prisma } from "../../lib/prisma";

export default function ProjectDetails({ params }) {
  const { id } = use(params);

  const [project, setProject] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      setProject(data);
      setMainImage(data?.images?.[0]?.url || null);
    };

    fetchProject();
  }, [id]);

  if (!project) return <div className="pt-36 px-6">Loading...</div>;

  return (
    <div className="py-36 px-6 max-w-screen-lg mx-auto space-y-6">
      <h1 className="text-4xl font-bold text-center">{project.title}</h1>

      {/* Main Image */}
      {mainImage && (
        <div className="w-full max-w-3xl h-[300px] md:h-[400px] overflow-hidden rounded-lg shadow-md mx-auto">
          <img
            src={mainImage}
            alt="Main"
            className="w-full h-full object-cover transition duration-300"
          />
        </div>
      )}

      {/* Thumbnails */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {project.images.map((img) => (
          <img
            key={img.id}
            src={img.url}
            alt="Thumbnail"
            onClick={() => setMainImage(img.url)}
            className={`w-full max-w-42 h-20 md:h-24 object-cover rounded-lg cursor-pointer transition-transform duration-200 hover:scale-105 ${
              mainImage === img.url ? "ring-4 ring-blue-500" : ""
            }`}
          />
        ))}
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-2 gap-4 mt-6 text-sm md:text-base bg-white rounded-lg px-8 py-10 shadow-md">
        <p><strong>Location:</strong> {project.location}</p>
        <p><strong>Type:</strong> {project.type}</p>
        <p><strong>Developer:</strong> {project.developer}</p>
        <p><strong>Furnished:</strong> {project.furnished}</p>
        <p><strong>Price Range:</strong> AED {project.minPrice.toLocaleString()} – {project.maxPrice.toLocaleString()}</p>
        <p><strong>Area Range:</strong> {project.minArea} – {project.maxArea} m²</p>
        <p><strong>New Launch:</strong> {project.newLaunch ? "Yes" : "No"}</p>
      </div>

      {/* Unit Types */}
      {project.unitTypes?.length > 0 && (
        <div className="bg-white rounded-lg px-8 py-10 shadow-md space-y-4">
          <h2 className="text-xl font-semibold mb-4">Unit Types</h2>

          {project.unitTypes.map((unit) => (
            <div
              key={unit.id}
              className="border-b last:border-b-0 pb-4 mb-4 last:pb-0 last:mb-0"
            >
              <p className="text-gray-700 text-sm md:text-base">
                <strong>Bedrooms:</strong>{" "}
                {unit.bedrooms === 0 ? "Studio" : `${unit.bedrooms} BR`}
              </p>
              <p className="text-gray-700 text-sm md:text-base">
                <strong>Price Range:</strong>{" "}
                AED {unit.minPrice.toLocaleString()} – {unit.maxPrice.toLocaleString()}
              </p>
              <p className="text-gray-700 text-sm md:text-base">
                <strong>Area Range:</strong> {unit.minArea} – {unit.maxArea} m²
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {project.description && (
        <p className="text-md text-muted-foreground">{project.description}</p>
      )}
    </div>
  );
}
