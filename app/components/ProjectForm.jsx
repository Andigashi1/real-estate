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
    price: "",
    location: "",
    area: "",
    bedrooms: "",
    type: "",
    developer: "",
  });

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
        price: project.price?.toString() || "",
        location: project.location || "",
        area: project.area?.toString() || "",
        bedrooms: project.bedrooms?.toString() || "",
        type: project.type || "",
        developer: project.developer || "",
      });

      setImages(project.images || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load project");
    }
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
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          console.warn(`Skipping non-image file: ${file.name}`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          console.warn(`Skipping large file: ${file.name}`);
          continue;
        }

        const previewUrl = URL.createObjectURL(file);
        const tempId = Date.now() + Math.random();
        
        // Add to images array immediately for preview
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

        // If editing, upload immediately
        if (isEdit) {
          const formData = new FormData();
          formData.append("image", file);
          
          try {
            const res = await fetch(
              `/api/admin/projects/${params.id}/images/upload`,
              {
                method: "POST",
                body: formData,
              }
            );

            if (res.ok) {
              const newImage = await res.json();
              // Replace the temporary image with the uploaded one
              setImages((prev) => 
                prev.map(img => 
                  img.id === tempId 
                    ? { ...newImage, isUploaded: true }
                    : img
                )
              );
            } else {
              // Remove the failed upload from images
              setImages((prev) => prev.filter(img => img.id !== tempId));
              console.error(`Failed to upload ${file.name}`);
              alert(`Failed to upload ${file.name}`);
            }
          } catch (uploadError) {
            console.error(`Upload error for ${file.name}:`, uploadError);
            setImages((prev) => prev.filter(img => img.id !== tempId));
            alert(`Error uploading ${file.name}`);
          }
        }
      }
    } catch (error) {
      console.error("File upload error:", error);
      alert("Error processing files");
    } finally {
      setImagesLoading(false);
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

      // Prepare project data
      const projectData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        area: formData.area ? parseFloat(formData.area) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
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
        
        alert(`Failed to ${isEdit ? "update" : "create"} project: ${errorMessage}`);
        return;
      }

      const project = await response.json();

      // Handle image uploads for new projects
      if (!isEdit && project && images.length > 0) {
        const imageUploadPromises = images
          .filter(img => img.isLocal && img.file)
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
        const failedUploads = uploadResults.filter(result => !result.success);
        
        if (failedUploads.length > 0) {
          const failedFiles = failedUploads.map(result => result.filename).join(", ");
          alert(`Project created but failed to upload images: ${failedFiles}`);
        }
      }

      // Handle URL-based images for new projects
      if (!isEdit && project && images.some(img => img.isNew && !img.isLocal)) {
        const urlImages = images.filter(img => img.isNew && !img.isLocal);
        
        for (const img of urlImages) {
          try {
            const response = await fetch(`/api/admin/projects/${project.id}/images`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: img.url }),
            });
            
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
      alert(`Error ${isEdit ? "updating" : "creating"} project: ${error.message}`);
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
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price (AED)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter price"
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
                htmlFor="area"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Area (m²)
              </label>
              <input
                type="number"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter area"
              />
            </div>
            <div>
              <label
                htmlFor="bedrooms"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bedrooms
              </label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                min="0"
                step="1"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter number of bedrooms"
              />
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Type
              </label>
              <select
                name="type"
                id="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Property Type</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="townhouse">Townhouse</option>
                <option value="penthouse">Penthouse</option>
                <option value="studio">Studio</option>
              </select>
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
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-gray-600">
                <p className="text-lg font-medium">Drop images here or click to browse</p>
                <p className="text-sm">Supports: JPG, PNG, GIF (max 5MB each)</p>
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
                <div
                  key={image.id}
                  className="relative border rounded-lg overflow-hidden group"
                >
                  <img
                    src={image.url}
                    alt="Project"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x200?text=Image+Not+Found";
                    }}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => deleteImage(image.id, image.isNew)}
                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full text-xs w-6 h-6 flex items-center justify-center"
                      title="Delete image"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-2 bg-gray-50 text-xs text-gray-600">
                    {image.isLocal ? "Local file" : image.isNew ? "New URL" : "Uploaded"}
                    {image.isUploaded && " ✓"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {loading
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
              ? "Update Project"
              : "Create Project"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin")}
            disabled={loading}
            className="border-2 border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-md disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}