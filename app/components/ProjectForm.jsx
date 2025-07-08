"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProjectForm({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    location: '',
    area: '',
    bedrooms: '',
    type: '',
    developer: '',
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
      if (!response.ok) throw new Error('Failed to fetch project');
      const project = await response.json();

      setFormData({
        title: project.title || '',
        slug: project.slug || '',
        description: project.description || '',
        price: project.price?.toString() || '',
        location: project.location || '',
        area: project.area?.toString() || '',
        bedrooms: project.bedrooms?.toString() || '',
        type: project.type || '',
        developer: project.developer || '',
      });

      setImages(project.images || []);
    } catch (error) {
      console.error(error);
      alert('Failed to load project');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' && !isEdit
        ? {
            slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          }
        : {})
    }));
  };

  const addImage = async (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;

    if (!isEdit) {
      setImages([...images, {
        id: Date.now(),
        url: newImageUrl,
        isNew: true
      }]);
      setNewImageUrl('');
      return;
    }

    setImagesLoading(true);
    try {
      const response = await fetch(`/api/admin/projects/${params.id}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newImageUrl }),
      });

      if (response.ok) {
        const newImage = await response.json();
        setImages([...images, newImage]);
        setNewImageUrl('');
      } else {
        alert('Failed to add image');
      }
    } catch (error) {
      console.error(error);
      alert('Error adding image');
    } finally {
      setImagesLoading(false);
    }
  };

  const deleteImage = async (imageId, isNew = false) => {
    if (!confirm('Delete this image?')) return;

    if (!isEdit || isNew) {
      setImages(images.filter(img => img.id !== imageId));
      return;
    }

    try {
      const response = await fetch(`/api/admin/images/${imageId}`, { method: 'DELETE' });
      if (response.ok) {
        setImages(images.filter(img => img.id !== imageId));
      } else {
        alert('Failed to delete image');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting image');
    }
  };

  const handleFileUpload = async (files) => {
    setImagesLoading(true);
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) continue;

        const previewUrl = URL.createObjectURL(file);
        setImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: previewUrl,
          file,
          isNew: true,
          isLocal: true
        }]);

        if (isEdit) {
          const formData = new FormData();
          formData.append('image', file);
          const res = await fetch(`/api/admin/projects/${params.id}/images/upload`, {
            method: 'POST',
            body: formData
          });

          if (res.ok) {
            const newImage = await res.json();
            setImages(prev => [...prev, newImage]);
          }
        }
      }
    } catch (error) {
      console.error(error);
      alert('Error uploading files');
    } finally {
      setImagesLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
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
      const url = isEdit ? `/api/admin/projects/${params.id}` : '/api/admin/projects';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          area: parseFloat(formData.area),
          bedrooms: parseInt(formData.bedrooms),
        }),
      });

      const contentType = response.headers.get("content-type");
      const project = contentType?.includes("application/json") ? await response.json() : null;

      if (!response.ok) {
        const text = await response.text();
        alert(`Failed to ${isEdit ? 'update' : 'create'} project: ${text}`);
        return;
      }

      if (!isEdit && project && images.length > 0) {
        for (const img of images) {
          if (img.isLocal && img.file) {
            const formData = new FormData();
            formData.append('image', img.file);
            const uploadResponse = await fetch(`/api/admin/projects/${project.id}/images/upload`, {
              method: 'POST',
              body: formData,
            });
            if (!uploadResponse.ok) {
              console.error(`Failed to upload image ${img.file.name}`);
              alert(`Failed to upload image: ${img.file.name}`);
            }
          }
        }
      }

      router.push('/admin');
    } catch (error) {
      console.error(error);
      alert(`Error ${isEdit ? 'updating' : 'creating'} project`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/admin')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Admin
        </button>
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Edit Project' : 'Create New Project'}
        </h1>
      </div>

      <form onSubmit={handleSubmitWithImages} className="space-y-8">
        {/* Project Details Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Project Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter project title"
              />
            </div>
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter project slug"
                disabled={isEdit}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter project description"
              ></textarea>
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (AED)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter price"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter location"
              />
            </div>
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">Area (m²)</label>
              <input
                type="number"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter area"
              />
            </div>
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter number of bedrooms"
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <input
                type="text"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter property type"
              />
            </div>
            <div>
              <label htmlFor="developer" className="block text-sm font-medium text-gray-700 mb-1">Developer</label>
              <input
                type="text"
                id="developer"
                name="developer"
                value={formData.developer}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter developer name"
              />
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Project Images</h2>
          
          {/* Drag and Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {/* Drag and Drop UI */}
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative border rounded-lg overflow-hidden">
                <img
                  src={image.url}
                  alt="Project"
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <button
                    type="button"
                    onClick={() => deleteImage(image.id, image.isNew)}
                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full text-xs"
                    title="Delete image"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-2 bg-gray-50">
                  {/* Label for image status */}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Project' : 'Create Project')}
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="border-2 border-red-500 hover:bg-red-500 text-red-500 hover:text-white px-6 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
