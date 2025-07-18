"use client"
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
  const [loading, setLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

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
          furnished: project.furnished || "not-furnished", // Default value
          newLaunch: project.newLaunch || false,
        });

        setUnitTypes(project.unitTypes || []);
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

  if (loading) return <div>Loading...</div>;

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

          {/* Unit Types Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Unit Types</h2>
            <div className="space-y-4">
              {unitTypes.map((unit, index) => (
                <div key={index} className="border border-gray-200 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium">Unit Type {index + 1}</h3>
                    {unitTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUnitType(index)}
                        className="text-red-600"
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
                          handleUnitTypeChange(index, "bedrooms", e.target.value)
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
                          handleUnitTypeChange(index, "minPrice", e.target.value)
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
                          handleUnitTypeChange(index, "maxPrice", e.target.value)
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
                className="text-blue-600 hover:text-blue-700"
              >
                Add Unit Type
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading || imagesLoading}
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
