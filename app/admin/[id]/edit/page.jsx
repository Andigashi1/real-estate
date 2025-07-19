"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";

export default function EditProjectPage({ params }) {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    location: "",
    type: "",
    developer: "",
    furnished: "",
    newLaunch: false,
  });
  const [unitTypes, setUnitTypes] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const router = useRouter();

  const { id } = React.use(params);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) throw new Error("Failed to fetch project");

        const project = await response.json();
        setFormData({
          title: project.title || "",
          slug: project.slug || "",
          description: project.description || "",
          location: project.location || "",
          type: project.type || "",
          developer: project.developer || "",
          furnished: project.furnished || "not-furnished",
          newLaunch: project.newLaunch || false,
        });

        setUnitTypes(project.unitTypes || []);
        setImages(project.images || []);
      } catch (error) {
        console.error("Error fetching project:", error);
      }
      setLoading(false);
    };

    if (id) fetchProject();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "title"
        ? {
            slug: value
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
          }
        : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          unitTypes,
          images,
        }),
      });

      if (!response.ok) throw new Error("Failed to update project");

      router.push("/admin");
    } catch (error) {
      console.error("Error updating project:", error);
      setLoading(false);
    }
  };

  const handleUnitTypeChange = (index, key, value) => {
    const updatedUnitTypes = [...unitTypes];
    updatedUnitTypes[index][key] = value;
    setUnitTypes(updatedUnitTypes);
  };

  const addUnitType = () => {
    setUnitTypes([
      ...unitTypes,
      {
        bedrooms: 1,
        minPrice: 0,
        maxPrice: 0,
        minArea: 0,
        maxArea: 0,
      },
    ]);
  };

  const removeUnitType = (index) => {
    const updatedUnitTypes = [...unitTypes];
    updatedUnitTypes.splice(index, 1);
    setUnitTypes(updatedUnitTypes);
  };

  // Enhanced image upload with better error handling
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clear previous errors
    setUploadError("");

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    setUploadingImage(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("image", file); // Changed from 'file' to 'image'
      uploadFormData.append("projectId", id);

      console.log(
        "Uploading file:",
        file.name,
        "Size:",
        file.size,
        "Type:",
        file.type
      );
      console.log("Project ID:", id);
      console.log("FormData entries:");
      for (let [key, value] of uploadFormData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch(`/api/admin/projects/${id}/images/upload`, {
        method: "POST",
        body: uploadFormData,
      });

      console.log("Upload response status:", response.status);
      console.log("Upload response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload error response:", errorText);
        console.error("Upload error status:", response.status);
        console.error("Upload error headers:", response.headers);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Upload successful:", data);

      setImages((prev) => [
        ...prev,
        {
          id: data.id, // Use the actual database ID returned from API
          url: data.url,
          alt: `${formData.title} image`,
          isPrimary: images.length === 0,
        },
      ]);

      // Clear the file input
      e.target.value = "";
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const addImageByUrl = () => {
    if (!newImageUrl.trim()) return;

    // Basic URL validation
    try {
      new URL(newImageUrl);
    } catch {
      setUploadError("Please enter a valid URL");
      return;
    }

    setImages((prev) => [
      ...prev,
      {
        id: `temp_${Date.now()}`, // Temporary ID for URL-added images
        url: newImageUrl.trim(),
        alt: `${formData.title} image`,
        isPrimary: images.length === 0,
      },
    ]);
    setNewImageUrl("");
    setUploadError("");
  };

  const removeImage = async (imageId) => {
    try {
      // Find the image to get its details
      const imageToDelete = images.find((img) => img.id === imageId);

      // Only call API delete if this is a saved image (has numeric ID from database)
      if (imageToDelete && !imageId.toString().startsWith("temp_")) {
        const response = await fetch(
          `/api/admin/projects/${id}/images/${imageId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          console.error("Failed to delete image from server");
          // Continue with local removal even if server delete fails
        }
      }

      // Remove from local state
      setImages((prev) => {
        const filtered = prev.filter((img) => img.id !== imageId);
        // If we removed the primary image, make the first remaining image primary
        if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
          filtered[0].isPrimary = true;
        }
        return filtered;
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      // Still remove from local state even if API call fails
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    }
  };

  const setPrimaryImage = (imageId) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === imageId,
      }))
    );
  };

  const updateImageAlt = (imageId, alt) => {
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, alt } : img))
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Project</h1>
      <div className="p-8 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Details Section */}
          <div className="bg-white p-6 rounded-lg shadow">
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
                  readOnly
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
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter location"
                />
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
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., apartment, penthouse"
                />
              </div>
              <div>
                <label
                  htmlFor="developer"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Developer
                </label>
                <input
                  type="text"
                  id="developer"
                  name="developer"
                  value={formData.developer}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter developer name"
                />
              </div>
              <div>
                <label
                  htmlFor="furnished"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Furnished
                </label>
                <select
                  id="furnished"
                  name="furnished"
                  value={formData.furnished}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="not-furnished">Not Furnished</option>
                  <option value="semi">Semi Furnished</option>
                  <option value="fully">Fully Furnished</option>
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
                  id="newLaunch"
                  name="newLaunch"
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

          {/* Images Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Project Images</h2>

            {/* Error Display */}
            {uploadError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
                {uploadError}
              </div>
            )}

            {/* Upload and Add Image Controls */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="w-full p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploadingImage && (
                  <div className="mt-2 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <p className="text-sm text-blue-600">Uploading...</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, GIF, WebP (Max 10MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Image by URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Enter image URL"
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={addImageByUrl}
                    disabled={!newImageUrl.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Display Images */}
            {images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="relative mb-3">
                      <img
                        src={image.url}
                        alt={image.alt || `Project image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-md"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg";
                          e.target.alt = "Failed to load image";
                        }}
                      />
                      {image.isPrimary && (
                        <span className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                          Primary
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={image.alt || ""}
                        onChange={(e) =>
                          updateImageAlt(image.id, e.target.value)
                        }
                        placeholder="Image alt text"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />

                      <div className="flex gap-2">
                        {!image.isPrimary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(image.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No images added yet
              </p>
            )}
          </div>

          {/* Unit Types Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Unit Types</h2>
            <div className="space-y-4">
              {unitTypes.map((unit, index) => (
                <div
                  key={index}
                  className="border border-gray-200 p-4 rounded-lg"
                >
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium">
                      Unit Type {index + 1}
                    </h3>
                    {unitTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUnitType(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label
                        htmlFor={`bedrooms-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        id={`bedrooms-${index}`}
                        name="bedrooms"
                        value={unit.bedrooms}
                        onChange={(e) =>
                          handleUnitTypeChange(
                            index,
                            "bedrooms",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`minPrice-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Min Price
                      </label>
                      <input
                        type="number"
                        id={`minPrice-${index}`}
                        name="minPrice"
                        value={unit.minPrice}
                        onChange={(e) =>
                          handleUnitTypeChange(
                            index,
                            "minPrice",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`maxPrice-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Max Price
                      </label>
                      <input
                        type="number"
                        id={`maxPrice-${index}`}
                        name="maxPrice"
                        value={unit.maxPrice}
                        onChange={(e) =>
                          handleUnitTypeChange(
                            index,
                            "maxPrice",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`minArea-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Min Area (sq. ft.)
                      </label>
                      <input
                        type="number"
                        id={`minArea-${index}`}
                        name="minArea"
                        value={unit.minArea}
                        onChange={(e) =>
                          handleUnitTypeChange(index, "minArea", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`maxArea-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Max Area (sq. ft.)
                      </label>
                      <input
                        type="number"
                        id={`maxArea-${index}`}
                        name="maxArea"
                        value={unit.maxArea}
                        onChange={(e) =>
                          handleUnitTypeChange(index, "maxArea", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addUnitType}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Unit Type
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading || imagesLoading || uploadingImage}
              className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Update Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
