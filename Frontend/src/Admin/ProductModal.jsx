import React, { useState } from 'react';
import { X, Plus, Trash2, Upload, Link as LinkIcon } from 'lucide-react';

export default function ProductModal({ editingProduct, productForm, setProductForm, onSubmit, onClose }) {
  
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle image URL changes
  const handleImageChange = (index, value) => {
    const newImages = [...productForm.images];
    newImages[index] = value;
    setProductForm(prev => ({ ...prev, images: newImages }));
  };

  // Add new image field
  const addImageField = () => {
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  // Remove image field
  const removeImageField = (index) => {
    if (productForm.images.length > 1) {
      const newImages = productForm.images.filter((_, i) => i !== index);
      setProductForm(prev => ({ ...prev, images: newImages }));
    }
  };

  // Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle attribute changes
  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...productForm.attributes];
    newAttributes[index][field] = value;
    setProductForm(prev => ({ ...prev, attributes: newAttributes }));
  };

  // Add new attribute field
  const addAttributeField = () => {
    setProductForm(prev => ({
      ...prev,
      attributes: [...prev.attributes, { key: '', value: '' }]
    }));
  };

  // Remove attribute field
  const removeAttributeField = (index) => {
    if (productForm.attributes.length > 1) {
      const newAttributes = productForm.attributes.filter((_, i) => i !== index);
      setProductForm(prev => ({ ...prev, attributes: newAttributes }));
    }
  };

  // Modified submit to handle file
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If file is selected, add it to form
    if (imageFile) {
      // Create FormData
      const formData = new FormData();
      formData.append('title', productForm.title);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('stock', productForm.stock);
      formData.append('category', productForm.category);
      formData.append('featured', productForm.featured);
      formData.append('image', imageFile);
      
      // Add attributes
      const attributesObj = {};
      productForm.attributes.forEach(attr => {
        if (attr.key && attr.value) {
          attributesObj[attr.key] = attr.value;
        }
      });
      formData.append('attributes', JSON.stringify(attributesObj));
      
      onSubmit(e, formData);
    } else {
      onSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Product Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={productForm.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={productForm.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter product description"
              required
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={productForm.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={productForm.stock}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={productForm.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="kitchen">Kitchen</option>
              <option value="swords">Swords</option>
              <option value="axes">Axes</option>
            </select>
          </div>

          {/* Image URLs - WITH BROWSE OPTION */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Image URLs <span className="text-red-500">*</span>
            </label>

            {/* Toggle Buttons */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setUploadMethod('url')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition ${
                  uploadMethod === 'url'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <LinkIcon size={18} />
                Paste URL
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('file')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition ${
                  uploadMethod === 'file'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <Upload size={18} />
                Browse File
              </button>
            </div>

            {/* URL Input Method */}
            {uploadMethod === 'url' && (
              <div className="space-y-3">
                {productForm.images.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    {productForm.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  <Plus size={18} /> Add Image URL
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Add multiple image URLs. First image will be the main product image.
                </p>
              </div>
            )}

            {/* File Upload Method */}
            {uploadMethod === 'file' && (
              <div>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer bg-gray-50">
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                      <Upload size={48} className="text-gray-400 mb-3" />
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Click to browse and select image
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Attributes */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Product Attributes (Optional)
            </label>
            <div className="space-y-3">
              {productForm.attributes.map((attr, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={attr.key}
                    onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Attribute name (e.g., Blade Length)"
                  />
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Value (e.g., 8 inches)"
                  />
                  {productForm.attributes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAttributeField(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addAttributeField}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <Plus size={18} /> Add Attribute
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Add specifications like Blade Length, Material, Weight, etc.
            </p>
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              name="featured"
              id="featured"
              checked={productForm.featured}
              onChange={handleChange}
              className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="featured" className="text-sm font-semibold cursor-pointer">
              Mark as Featured Product
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}