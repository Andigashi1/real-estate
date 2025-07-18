"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { areas, companies } from "../lib/areas";

export default function ProjectForm({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    location: "",
    type: "", // This is the main project-level type
    developer: "",
    furnished: "",
    newLaunch: false,
  });

  // Unit types state - NO LONGER includes 'type' field for each unit
  const [unitTypes, setUnitTypes] = useState([
    {
      bedrooms: 0,
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
      name: "",
    },
  ]);

  useEffect(() => {
    if (params?.id) {
      setIsEdit(true);
      fetchProject();
    }
  }, [params?.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch project");
      const project = await response.json();

      setFormData({
        title: project.title || "",
        slug: project.slug || "",
        description: project.description || "",
        location: project.location || "",
        type: project.type || "", // Populate the main project type
        developer: project.developer || "",
        furnished: project.furnished || "",
        newLaunch: project.newLaunch || false,
      });

      // Set unit types from project data, EXCLUDING the 'type' field
      if (project.unitTypes && project.unitTypes.length > 0) {
        setUnitTypes(
          project.unitTypes.map((unit) => ({
            bedrooms: unit.bedrooms,
            minPrice: unit.minPrice?.toString() || "",
            maxPrice: unit.maxPrice?.toString() || "",
            minArea: unit.minArea?.toString() || "",
            maxArea: unit.maxArea?.toString() || "",
            name: unit.name || getDefaultUnitName(unit.bedrooms),
          }))
        );
      } else {
        // Default empty unit type if no unitTypes
        setUnitTypes([
          {
            bedrooms: 0,
            minPrice: "",
            maxPrice: "",
            minArea: "",
            maxArea: "",
            name: getDefaultUnitName(0),
          },
        ]);
      }

      setImages(project.images || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load project");
    }
  };

  const getDefaultUnitName = (bedrooms) => {
    if (bedrooms === 0) return "Studio";
    if (bedrooms === 1) return "1 Bedroom";
    return `${bedrooms} Bedrooms`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "title" && !isEdit
        ? {
            slug: value
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
          }
        : {}),
    }));
  };

  // Function to handle changes within individual unit type fields
  const handleUnitTypeChange = (index, field, value) => {
    setUnitTypes((prev) =>
      prev.map((unit, i) =>
        i === index
          ? {
              ...unit,
              [field]: value,
              // Update name if bedrooms changes
              ...(field === "bedrooms" && {
                name: getDefaultUnitName(parseInt(value) || 0),
              }),
            }
          : unit
      )
    );
  };

  const addUnitType = () => {
    const nextBedrooms = unitTypes.length > 0 ? Math.max(...unitTypes.map((u) => u.bedrooms)) + 1 : 0;
    setUnitTypes([
      ...unitTypes,
      {
        bedrooms: nextBedrooms <= 7 ? nextBedrooms : 1, // Ensure sensible default bedroom count
        minPrice: "",
        maxPrice: "",
        minArea: "",
        maxArea: "",
        name: getDefaultUnitName(nextBedrooms <= 7 ? nextBedrooms : 1),
      },
    ]);
  };

  const removeUnitType = (index) => {
    if (unitTypes.length > 1) {
      setUnitTypes(unitTypes.filter((_, i) => i !== index));
    }
  };

  const addImage = async (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;

    if (!isEdit) {
      setImages([
        ...images,
        {
          id: Date.now(),
          url: newImageUrl,
          isNew: true,
        },
      ]);
      setNewImageUrl("");
      return;
    }

    setImagesLoading(true);
    try {
      const response = await fetch(`/api/admin/projects/${params.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newImageUrl }),
      });

      if (response.ok) {
        const newImage = await response.json();
        setImages([...images, newImage]);
        setNewImageUrl("");
      } else {
        alert("Failed to add image");
      }
    } catch (error) {
      console.error(error);
      alert("Error adding image");
    } finally {
      setImagesLoading(false);
    }
  };

  const deleteImage = async (imageId, isNew = false) => {
    if (!confirm("Delete this image?")) return;

    if (!isEdit || isNew) {
      setImages(images.filter((img) => img.id !== imageId));
      return;
    }

    try {
      const response = await fetch(`/api/admin/images/${imageId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setImages(images.filter((img) => img.id !== imageId));
      } else {
        alert("Failed to delete image");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting image");
    }
  };

  const handleFileUpload = async (files) => {
    setImagesLoading(true);
    try {
      const uploadPromises = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 5 * 1024 * 1024) continue;

        const previewUrl = URL.createObjectURL(file);
        const tempId = Date.now() + Math.random();

        setImages((prev) => [
          ...prev,
          {
            id: tempId,
            url: previewUrl,
            file,
            isNew: true,
            isLocal: true,
          },
        ]);

        if (isEdit) {
          const formData = new FormData();
          formData.append("image", file);

          const promise = fetch(`/api/admin/projects/${params.id}/images/upload`, {
            method: "POST",
            body: formData,
          })
            .then(async (res) => {
              if (res.ok) {
                const newImage = await res.json();
                setImages((prev) =>
                  prev.map((img) =>
                    img.id === tempId ? { ...newImage, isUploaded: true } : img
                  )
                );
              } else {
                setImages((prev) => prev.filter((img) => img.id !== tempId));
                throw new Error(`Failed to upload ${file.name}`);
              }
            })
            .catch((err) => {
              console.error(err);
              setImages((prev) => prev.filter((img) => img.id !== tempId));
            });

          uploadPromises.push(promise);
        }
      }

      await Promise.all(uploadPromises);
    } catch (error) {
      console.error("File upload error:", error);
      alert("Error processing files");
    } finally {
      setImagesLoading(false); // ✅ Ensures this runs only after all uploads
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      handleFileUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files?.length) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  const handleSubmitWithImages = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        alert("Project title is required");
        return;
      }
      if (!formData.type.trim()) {
        alert("Project Property Type is required");
        return;
      }

      // Validate unit types
      const validUnitTypes = unitTypes.filter(
        (unit) =>
          unit.minPrice &&
          unit.maxPrice &&
          unit.minArea &&
          unit.maxArea &&
          unit.bedrooms !== ""
      );

      if (validUnitTypes.length === 0) {
        alert(
          "At least one unit type with all required fields (Bedrooms, Min/Max Price/Area) is required"
        );
        return;
      }

      // Validate that maxPrice >= minPrice and maxArea >= minArea
      for (const unit of validUnitTypes) {
        if (parseFloat(unit.maxPrice) < parseFloat(unit.minPrice)) {
          alert(
            "Max price must be greater than or equal to min price for all unit types."
          );
          return;
        }
        if (parseFloat(unit.maxArea) < parseFloat(unit.minArea)) {
          alert(
            "Max area must be greater than or equal to min area for all unit types."
          );
          return;
        }
      }

      // Prepare project data with unit types
      const projectData = {
        ...formData,
        unitTypes: validUnitTypes.map((unit) => ({
          bedrooms: parseInt(unit.bedrooms) || 0,
          minPrice: parseFloat(unit.minPrice),
          maxPrice: parseFloat(unit.maxPrice),
          minArea: parseFloat(unit.minArea),
          maxArea: parseFloat(unit.maxArea),
          name: unit.name || getDefaultUnitName(parseInt(unit.bedrooms) || 0),
        })),
      };

      const url = isEdit
        ? `/api/admin/projects/${params.id}`
        : "/api/admin/projects";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Unknown error";

        if (contentType && contentType.includes("application/json")) {
          try {
            const errorJson = await response.json();
            errorMessage = errorJson?.message || JSON.stringify(errorJson);
          } catch (parseError) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        } else {
          errorMessage = await response.text();
        }

        alert(
          `Failed to ${isEdit ? "update" : "create"} project: ${errorMessage}`
        );
        return;
      }

      const project = await response.json();

      // Handle image uploads for new projects
      if (!isEdit && project && images.length > 0) {
        const imageUploadPromises = images
          .filter((img) => img.isLocal && img.file)
          .map(async (img) => {
            const formData = new FormData();
            formData.append("image", img.file);

            try {
              const uploadResponse = await fetch(
                `/api/admin/projects/${project.id}/images/upload`,
                {
                  method: "POST",
                  body: formData,
                }
              );

              if (!uploadResponse.ok) {
                console.error(`Failed to upload image ${img.file.name}`);
                return { success: false, filename: img.file.name };
              }

              return { success: true, filename: img.file.name };
            } catch (uploadError) {
              console.error(`Upload error for ${img.file.name}:`, uploadError);
              return { success: false, filename: img.file.name };
            }
          });

        const uploadResults = await Promise.all(imageUploadPromises);
        const failedUploads = uploadResults.filter((result) => !result.success);

        if (failedUploads.length > 0) {
          const failedFiles = failedUploads
            .map((result) => result.filename)
            .join(", ");
          alert(`Project created but failed to upload images: ${failedFiles}`);
        }
      }

      // Handle URL-based images for new projects
      if (
        !isEdit &&
        project &&
        images.some((img) => img.isNew && !img.isLocal)
      ) {
        const urlImages = images.filter((img) => img.isNew && !img.isLocal);

        for (const img of urlImages) {
          try {
            const response = await fetch(
              `/api/admin/projects/${project.id}/images`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: img.url }),
              }
            );

            if (!response.ok) {
              console.error(`Failed to add image URL: ${img.url}`);
            }
          } catch (error) {
            console.error(`Error adding image URL: ${img.url}`, error);
          }
        }
      }

      router.push("/admin");
    } catch (error) {
      console.error("Submit error:", error);
      alert(
        `Error ${isEdit ? "updating" : "creating"} project: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/admin")}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Admin
        </button>
        <h1 className="text-3xl font-bold">
          {isEdit ? "Edit Project" : "Create New Project"}
        </h1>
      </div>

      <form onSubmit={handleSubmitWithImages} className="space-y-8">
        {/* Project Details Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Project Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter project title"
              />
            </div>
            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                placeholder="Auto-generated from title"
                readOnly={!isEdit}
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter project description"
              />
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Location
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Location</option>
                {areas.map((area) => (
                  <option key={area.value} value={area.value}>
                    {area.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Property Type *
              </label>
              <input
                type="text"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required // Added required for the main type field
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., apartment,penthouse or just apartment"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter multiple types separated by commas (e.g.,
                apartment,penthouse)
              </p>
            </div>
            <div>
              <label
                htmlFor="developer"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Developer
              </label>
              <select
                name="developer"
                id="developer"
                value={formData.developer}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Developer</option>
                {companies.map((dev) => (
                  <option key={dev.value} value={dev.value}>
                    {dev.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="furnished"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Furnished
              </label>
              <select
                name="furnished"
                id="furnished"
                value={formData.furnished}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="not-furnished">Not Furnished</option>
                <option value="semi">Semi Furnished</option>
                <option value="fully">Fully Furnished</option>
                <option value="all">All Furnishings</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="newLaunch"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Launch
              </label>
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={formData.newLaunch}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    newLaunch: e.target.checked,
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Unit Types Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Unit Types & Pricing</h2>
            <button
              type="button"
              onClick={addUnitType}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
            >
              + Add Unit Type
            </button>
          </div>

          <div className="space-y-4">
            {unitTypes.map((unit, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-900">
                    Unit Type {index + 1}
                  </h3>
                  {unitTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUnitType(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Bedrooms Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrooms
                    </label>
                    <select
                      value={unit.bedrooms}
                      onChange={(e) =>
                        handleUnitTypeChange(index, "bedrooms", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={0}>Studio</option>
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <option key={num} value={num}>
                          {num} Bedroom{num > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Min Price Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Price (AED) *
                    </label>
                    <input
                      type="number"
                      value={unit.minPrice}
                      onChange={(e) =>
                        handleUnitTypeChange(index, "minPrice", e.target.value)
                      }
                      min="0"
                      step="0.01"
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter minimum price"
                    />
                  </div>

                  {/* Max Price Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Price (AED) *
                    </label>
                    <input
                      type="number"
                      value={unit.maxPrice}
                      onChange={(e) =>
                        handleUnitTypeChange(index, "maxPrice", e.target.value)
                      }
                      min="0"
                      step="0.01"
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter maximum price"
                    />
                  </div>

                  {/* Min Area Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Area (m²) *
                    </label>
                    <input
                      type="number"
                      value={unit.minArea}
                      onChange={(e) =>
                        handleUnitTypeChange(index, "minArea", e.target.value)
                      }
                      min="0"
                      step="0.01"
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter minimum area"
                    />
                  </div>

                  {/* Max Area Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Area (m²) *
                    </label>
                    <input
                      type="number"
                      value={unit.maxArea}
                      onChange={(e) =>
                        handleUnitTypeChange(index, "maxArea", e.target.value)
                      }
                      min="0"
                      step="0.01"
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter maximum area"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Images Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Project Images</h2>

          {/* Add Image by URL */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium mb-2">Add Image by URL</h3>
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={addImage}
                disabled={imagesLoading || !newImageUrl.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-2">
              <div className="text-gray-500">
                <svg
                  className="mx-auto h-12 w-12"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-gray-600">
                <p className="text-lg font-medium">
                  Drop images here or click to browse
                </p>
                <p className="text-sm">
                  Supports: JPG, PNG, GIF (max 5MB each)
                </p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
              >
                Choose Files
              </label>
            </div>
          </div>

          {/* Images Loading State */}
          {imagesLoading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Uploading images...</p>
            </div>
          )}

          {/* Images Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt="Project Image"
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => deleteImage(image.id, image.isNew)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-1 1v1H5a1 1 0 000 2h1v10a2 2 0 002 2h8a2 2 0 002-2V6h1a1 1 0 100-2h-3V3a1 1 0 00-1-1H9zm1 2H9v1h2V4zm4 2H6v10h8V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading || imagesLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Saving..."
              : isEdit
              ? "Update Project"
              : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}