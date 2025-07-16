"use client";

import { useState, useEffect, use } from "react";
import { prisma } from "../../lib/prisma";
import { areas, companies } from "@/app/lib/areas";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSwipeable } from "react-swipeable";

export default function ProjectDetails({ params }) {
  const { id } = use(params);

  const [project, setProject] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      setProject(data);
      setMainImage(data?.images?.[0]?.url || null);
    };

    fetchProject();
  }, [id]);

  const goToNextImage = () => {
    const currentIndex = project.images.findIndex(
      (img) => img.url === mainImage
    );
    const nextIndex = (currentIndex + 1) % project.images.length;
    setMainImage(project.images[nextIndex].url);
  };

  const goToPrevImage = () => {
    const currentIndex = project.images.findIndex(
      (img) => img.url === mainImage
    );
    const prevIndex =
      (currentIndex - 1 + project.images.length) % project.images.length;
    setMainImage(project.images[prevIndex].url);
  };

  const handlers = useSwipeable({
    onSwipedLeft: goToNextImage,
    onSwipedRight: goToPrevImage,
    trackMouse: true, // allows desktop swipe with mouse
  });

  const capitalizeFirst = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (!project) return <div className="pt-36 px-6">Loading...</div>;

  const locationLabel =
    areas.find((loc) => loc.value === project.location)?.label ||
    project.location;
  const companyLabel =
    companies.find((company) => company.value === project.developer)?.label ||
    project.developer;

  return (
    <div className="py-36 px-6 max-w-screen-lg mx-auto space-y-6">
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 flex flex-col items-center justify-center p-6"
        >
          <img
            {...handlers}
            src={mainImage}
            alt="Enlarged"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] max-w-full object-contain mb-6 rounded-lg shadow-lg"
          />

          {/* Thumbnails inside modal */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="overflow-x-auto whitespace-nowrap w-full max-w-4xl"
          >
            <div className="inline-flex gap-3 justify-center">
              {project.images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt="Thumbnail"
                  onClick={() => setMainImage(img.url)}
                  className={`w-24 h-16 object-cover rounded-lg cursor-pointer transition-transform duration-200 hover:scale-105 ${
                    mainImage === img.url ? "ring-4 ring-blue-500" : ""
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold text-center">{project.title}</h1>

      {/* Main Image */}
      {mainImage && (
        <div className="w-full max-w-3xl h-[300px] md:h-[400px] overflow-hidden rounded-lg shadow-md mx-auto relative">
          <img
            src={mainImage}
            alt="Main"
            onClick={() => setIsModalOpen(true)}
            className="w-full h-full object-cover transition duration-300 cursor-pointer"
          />

          {/* Prev Image */}
          <button
            onClick={() => {
              const currentIndex = project.images.findIndex(
                (img) => img.url === mainImage
              );
              const prevIndex =
                (currentIndex - 1 + project.images.length) %
                project.images.length;
              setMainImage(project.images[prevIndex].url);
            }}
            className="absolute top-1/2 left-2 bg-white rounded-full -translate-y-1/2 p-2 z-10 shadow hover:bg-gray-100"
          >
            <ChevronLeft />
          </button>

          {/* Next Image */}
          <button
            onClick={() => {
              const currentIndex = project.images.findIndex(
                (img) => img.url === mainImage
              );
              const nextIndex = (currentIndex + 1) % project.images.length;
              setMainImage(project.images[nextIndex].url);
            }}
            className="absolute top-1/2 right-2 bg-white rounded-full -translate-y-1/2 p-2 z-10 shadow hover:bg-gray-100"
          >
            <ChevronRight />
          </button>
        </div>
      )}

      {/* Thumbnails */}
      <div className="flex justify-center overflow-y-hidden overflow-x-auto whitespace-nowrap p-4 max-md:hidden">
        <div className="inline-flex gap-3">
          {project.images.map((img) => (
            <img
              key={img.id}
              src={img.url}
              alt="Thumbnail"
              onClick={() => setMainImage(img.url)}
              className={`w-32 h-20 md:h-24 object-cover rounded-lg cursor-pointer transition-transform duration-200 hover:scale-105 ${
                mainImage === img.url ? "ring-4 ring-blue-500" : ""
              }`}
            />
          ))}
        </div>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-2 gap-4 mt-6 text-sm md:text-base bg-white rounded-lg px-8 py-10 shadow-md">
        <p>
          <strong>Lokacioni:</strong> {locationLabel}
        </p>
        <p>
          <strong>Lloji:</strong> {capitalizeFirst(project.type)}
        </p>
        <p>
          <strong>Ndertuesi:</strong> {companyLabel}
        </p>
        <p>
          <strong>Mobilimi:</strong> {capitalizeFirst(project.furnished)}
        </p>
        <p>
          <strong>Cmimi:</strong> AED {project.minPrice.toLocaleString()}{" "}
          – {project.maxPrice.toLocaleString()}
        </p>
        <p>
          <strong>Madhesia:</strong> {project.minArea} – {project.maxArea} m²
        </p>
        <p>
          <strong>Lansim i ri?:</strong> {project.newLaunch ? "Yes" : "No"}
        </p>
      </div>

      {/* Unit Types */}
      {project.unitTypes?.length > 0 && (
        <div className="bg-white rounded-lg px-8 py-10 shadow-md space-y-4">
          <h2 className="text-xl font-semibold mb-4">Llojet</h2>

          {project.unitTypes.map((unit) => (
            <div
              key={unit.id}
              className="border-b last:border-b-0 pb-4 mb-4 last:pb-0 last:mb-0"
            >
              <p className="text-sm md:text-base">
                <strong>Dhoma:</strong>{" "}
                {unit.bedrooms === 0 ? "Studio" : `${unit.bedrooms} ${unit.bedrooms === 1 ? 'Dhome Gjumi' : 'Dhoma Gjumi'}`}
              </p>
              <p className="text-sm md:text-base">
                <strong>Cmimi:</strong> AED{" "}
                {unit.minPrice.toLocaleString()} –{" "}
                {unit.maxPrice.toLocaleString()}
              </p>
              <p className="text-sm md:text-base">
                <strong>Madhesia:</strong> {unit.minArea} – {unit.maxArea} m²
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {project.description && (
        <div className="bg-white px-8 py-10 rounded-lg shadow-md space-y-5">
          <h2 className="text-3xl font-bold">Pershkrimi</h2>
          <p className="text-md">{project.description}</p>
        </div>
      )}
    </div>
  );
}
