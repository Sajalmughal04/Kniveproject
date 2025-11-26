import React, { useState } from 'react';
import { X, Plus, Trash2, Upload, Link } from 'lucide-react';

export default function ProductModal({ editingProduct, productForm, setProductForm, onSubmit, onClose }) {
  const [uploadMethod, setUploadMethod] = useState('url'); // 'file' or 'url'
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Handle File Upload - FIXED: Now adds files instead of replacing
  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    
    // Check total file count (max 5)
    const totalFiles = imageFiles.length + newFiles.length;
    if (totalFiles > 5) {
      alert('⚠️ Maximum 5 images allowed! Currently selected: ' + imageFiles.length);
      return;
    }
    
    // ADD to existing files instead of replacing
    setImageFiles(prev => [...prev, ...newFiles]);
    
    // Create preview URLs for new files
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
    
    console.log('📁 Files added:', newFiles.length, '| Total:', totalFiles);
  };

  // Remove individual file from selection
  const removeFilePreview = (indexToRemove) => {
    // Revoke object URL to free memory
    URL.revokeObjectURL(previewUrls[indexToRemove]);
    
    // Remove from arrays
    setImageFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    setPreviewUrls(prev => prev.filter((_, i) => i !== indexToRemove));
    
    console.log('🗑️ File removed. Remaining:', imageFiles.length - 1);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm({
      ...productForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle URL input
  const handleImageChange = (index, value) => {
    const newImages = [...productForm.images];
    newImages[index] = value;
    setProductForm({ ...productForm, images: newImages });
  };

  const addImageField = () => {
    setProductForm({ ...productForm, images: [...productForm.images, ''] });
  };

  const removeImageField = (index) => {
    const newImages = productForm.images.filter((_, i) => i !== index);
    setProductForm({ ...productForm, images: newImages.length ? newImages : [''] });
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...productForm.attributes];
    newAttributes[index][field] = value;
    setProductForm({ ...productForm, attributes: newAttributes });
  };

  const addAttribute = () => {
    setProductForm({ 
      ...productForm, 
      attributes: [...productForm.attributes, { key: '', value: '' }] 
    });
  };

  const removeAttribute = (index) => {
    const newAttributes = productForm.attributes.filter((_, i) => i !== index);
    setProductForm({ 
      ...productForm, 
      attributes: newAttributes.length ? newAttributes : [{ key: '', value: '' }] 
    });
  };

  // Modified submit handler with detailed logging
  const handleSubmitWithFiles = async (e) => {
    e.preventDefault();
    
    console.log('🚀 SUBMIT TRIGGERED');
    console.log('📤 Upload Method:', uploadMethod);
    console.log('📁 Image Files Count:', imageFiles.length);
    
    if (uploadMethod === 'file' && imageFiles.length > 0) {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all form fields
      formData.append('title', productForm.title);
      formData.append('price', productForm.price);
      formData.append('stock', productForm.stock);
      formData.append('category', productForm.category);
      formData.append('description', productForm.description);
      formData.append('featured', productForm.featured);
      
      // Add attributes
      const attributesObject = {};
      productForm.attributes.forEach(attr => {
        if (attr.key.trim() && attr.value.trim()) {
          attributesObject[attr.key.trim()] = attr.value.trim();
        }
      });
      formData.append('attributes', JSON.stringify(attributesObject));
      
      // Add files - CRITICAL: Each file appended separately with same key
      console.log('📎 Adding files to FormData...');
      imageFiles.forEach((file, index) => {
        formData.append('images', file);
        console.log(`  ✅ File ${index + 1}:`, file.name, '|', (file.size / 1024).toFixed(2), 'KB');
      });
      
      // Debug: Show all FormData entries
      console.log('📋 Final FormData entries:');
      let imageCount = 0;
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          imageCount++;
          console.log(`  ${pair[0]} [${imageCount}]:`, pair[1].name);
        } else {
          console.log(`  ${pair[0]}:`, pair[1]);
        }
      }
      
      console.log(`📦 Total images in FormData: ${imageCount}`);
      
      // Call modified submit with FormData
      onSubmit(e, formData, 'file');
    } else {
      console.log('🔗 Using URL method');
      // Regular URL-based submit
      onSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold">
            {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmitWithFiles} className="p-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={productForm.title}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={productForm.price}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={productForm.stock}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                name="category"
                value={productForm.category}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                <option value="kitchen">🔪 Kitchen Knives</option>
                <option value="swords">⚔️ Swords</option>
                <option value="axes">🪓 Axes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={productForm.description}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            {/* Image Upload Method Selection */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-3">Images *</label>
              
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadMethod('url')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition ${
                    uploadMethod === 'url' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Link size={18} />
                  Image URL
                </button>
                
                <button
                  type="button"
                  onClick={() => setUploadMethod('file')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition ${
                    uploadMethod === 'file' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Upload size={18} />
                  Upload Files
                </button>
              </div>

              {uploadMethod === 'file' ? (
                <div>
                  <label className="block w-full">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 cursor-pointer transition">
                      <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-sm text-gray-600">
                        Click to upload images or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG, WEBP up to 5MB (Max 5 images)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  
                  {previewUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={url} 
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <div className="absolute top-2 left-2 bg-white rounded-full px-2 py-1 text-xs shadow">
                            {imageFiles[index].name.substring(0, 12)}...
                          </div>
                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removeFilePreview(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                            title="Remove this image"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {imageFiles.length > 0 && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <span className="text-lg">✅</span>
                      {imageFiles.length} file(s) selected
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {productForm.images.map((image, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
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
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 hover:underline"
                  >
                    <Plus size={16} />
                    Add another URL
                  </button>
                </div>
              )}
            </div>

            {/* Attributes */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-3">
                Attributes (Optional)
                <span className="text-xs text-gray-500 ml-2">e.g., Material, Blade Length, Weight</span>
              </label>
              <div className="space-y-2">
                {productForm.attributes.map((attr, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Key (e.g., Material)"
                      value={attr.key}
                      onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                      className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g., Damascus Steel)"
                      value={attr.value}
                      onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                      className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    {productForm.attributes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAttribute(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAttribute}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 hover:underline"
                >
                  <Plus size={16} />
                  Add attribute
                </button>
              </div>
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-center gap-2 border-t pt-4">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={productForm.featured}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                ⭐ Featured Product (Show on homepage)
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition shadow-md hover:shadow-lg"
            >
              {editingProduct ? '💾 Update Product' : '➕ Add Product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}