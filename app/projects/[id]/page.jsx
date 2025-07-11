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
      <div className="grid grid-cols-2 gap-4 mt-6 text-sm md:text-base bg-white rounded-lg px-8 py-10">
        <p><strong>Location:</strong> {project.location}</p>
        <p><strong>Area:</strong> {project.area}</p>
        <p><strong>Type:</strong> {project.type}</p>
        <p><strong>Developer:</strong> {project.developer}</p>
        <p><strong>Bedrooms:</strong> {project.bedrooms}</p>
        <p><strong>Price:</strong> AED {project.price.toLocaleString()}</p>
      </div>

      <p className="text-md text-muted-foreground">{project.description}</p>
    </div>
  );
}
