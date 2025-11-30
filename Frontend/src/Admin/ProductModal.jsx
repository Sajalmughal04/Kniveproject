import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, Link } from 'lucide-react';

export default function ProductModal({ editingProduct, productForm, setProductForm, onSubmit, onClose }) {
  const [uploadMethod, setUploadMethod] = useState('url');
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    if (productForm && !productForm.hasOwnProperty('discountType')) {
      setProductForm(prev => ({
        ...prev,
        discountType: 'none',
        discountValue: ''
      }));
    }
  }, [productForm, setProductForm]);

  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);

    const totalFiles = imageFiles.length + newFiles.length;
    if (totalFiles > 5) {
      alert('⚠️ Maximum 5 images allowed! Currently selected: ' + imageFiles.length);
      return;
    }

    setImageFiles(prev => [...prev, ...newFiles]);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeFilePreview = (indexToRemove) => {
    URL.revokeObjectURL(previewUrls[indexToRemove]);
    setImageFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    setPreviewUrls(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (!productForm) return;

    setProductForm({
      ...productForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (index, value) => {
    if (!productForm) return;

    const newImages = [...productForm.images];
    newImages[index] = value;
    setProductForm({ ...productForm, images: newImages });
  };

  const addImageField = () => {
    if (!productForm) return;

    setProductForm({ ...productForm, images: [...productForm.images, ''] });
  };

  const removeImageField = (index) => {
    if (!productForm) return;

    const newImages = productForm.images.filter((_, i) => i !== index);
    setProductForm({ ...productForm, images: newImages.length ? newImages : [''] });
  };

  const handleAttributeChange = (index, field, value) => {
    if (!productForm) return;

    const newAttributes = [...productForm.attributes];
    newAttributes[index][field] = value;
    setProductForm({ ...productForm, attributes: newAttributes });
  };

  const addAttribute = () => {
    if (!productForm) return;

    setProductForm({
      ...productForm,
      attributes: [...productForm.attributes, { key: '', value: '' }]
    });
  };

  const removeAttribute = (index) => {
    if (!productForm) return;

    const newAttributes = productForm.attributes.filter((_, i) => i !== index);
    setProductForm({
      ...productForm,
      attributes: newAttributes.length ? newAttributes : [{ key: '', value: '' }]
    });
  };

  const calculateFinalPrice = () => {
    if (!productForm) return 0;

    const price = parseFloat(productForm.price) || 0;
    const discountValue = parseFloat(productForm.discountValue) || 0;

    if (!productForm.discountValue || discountValue === 0 || productForm.discountType === 'none') {
      return price;
    }

    if (productForm.discountType === 'percentage') {
      return price - (price * discountValue / 100);
    } else {
      return price - discountValue;
    }
  };

  const finalPrice = calculateFinalPrice();
  const savings = productForm ? (parseFloat(productForm.price || 0) - finalPrice) : 0;

  const handleSubmitWithFiles = async (e) => {
    e.preventDefault();

    console.log('🚀 ProductModal Submit');

    if (uploadMethod === 'file' && imageFiles.length > 0) {
      const formData = new FormData();

      const attributes = {};

      if (productForm.attributes && Array.isArray(productForm.attributes)) {
        productForm.attributes.forEach(attr => {
          if (attr && attr.key && attr.key.trim() && attr.value && attr.value.trim()) {
            attributes[attr.key.trim()] = attr.value.trim();
          }
        });
      }

      const productData = {
        title: String(productForm.title || ''),
        price: String(productForm.price || '0'),
        stock: String(productForm.stock || '0'),
        category: String(productForm.category || ''),
        description: String(productForm.description || ''),
        featured: Boolean(productForm.featured),
        discountType: String(productForm.discountType || 'none'),
        discountValue: String(productForm.discountValue || '0'),
        attributes: attributes
      };

      console.log('📦 Product data structure:', {
        ...productData,
        attributesType: typeof productData.attributes,
        attributesConstructor: productData.attributes.constructor.name
      });

      formData.append('productData', JSON.stringify(productData));

      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      console.log('📦 FormData contents:');
      for (let pair of formData.entries()) {
        if (pair[0] === 'productData') {
          console.log('  productData:', pair[1]);
          try {
            const parsed = JSON.parse(pair[1]);
            console.log('  Parsed successfully:', parsed);
          } catch (err) {
            console.error('  ❌ Parse error:', err);
          }
        } else {
          console.log('  ', pair[0], ':', pair[1].name || pair[1]);
        }
      }

      onSubmit(e, formData, 'file');
    } else {
      console.log('🔗 URL mode, calling onSubmit');
      onSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h3 className="text-2xl font-bold">
            {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium mb-2">Product Title *</label>
            <input
              type="text"
              name="title"
              value={productForm?.title || ''}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              name="category"
              value={productForm?.category || ''}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              <option value="Kitchen Knives">Kitchen Knives</option>
              <option value="Swords">Swords</option>
              <option value="Axes">Axes</option>
            </select>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price (PKR) *</label>
              <input
                type="number"
                name="price"
                value={productForm?.price || ''}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stock *</label>
              <input
                type="number"
                name="stock"
                value={productForm?.stock || ''}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                min="0"
                required
              />
            </div>
          </div>

          {/* Discount Section */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <label className="block text-sm font-medium mb-3">Discount (Optional)</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Discount Type</label>
                <select
                  name="discountType"
                  value={productForm?.discountType || 'none'}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">No Discount</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (PKR)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Discount Value</label>
                <input
                  type="number"
                  name="discountValue"
                  value={productForm?.discountValue || ''}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  disabled={productForm?.discountType === 'none'}
                />
              </div>
            </div>
            {savings > 0 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Final Price:</strong> PKR {finalPrice.toFixed(2)}
                  <span className="ml-2 text-green-600">(Save PKR {savings.toFixed(2)})</span>
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={productForm?.description || ''}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          {/* Image Upload */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium mb-3">Images *</label>

            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setUploadMethod('url')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition ${uploadMethod === 'url'
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition ${uploadMethod === 'file'
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
                        <button
                          type="button"
                          onClick={() => removeFilePreview(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {(productForm?.images || ['']).map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    {(productForm?.images?.length || 0) > 1 && (
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
            </label>
            <div className="space-y-2">
              {(productForm?.attributes || [{ key: '', value: '' }]).map((attr, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Key"
                    value={attr.key}
                    onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                    className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={attr.value}
                    onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                    className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                  {(productForm?.attributes?.length || 0) > 1 && (
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

          {/* Featured */}
          <div className="flex items-center gap-2 border-t pt-4">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={productForm?.featured || false}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
              ⭐ Featured Product
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <button
              onClick={handleSubmitWithFiles}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {editingProduct ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update Product
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div >
  );
}