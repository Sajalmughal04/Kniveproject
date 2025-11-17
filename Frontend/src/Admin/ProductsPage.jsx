import React, { useState } from 'react';
import { Plus, RefreshCw, Search } from 'lucide-react';
import axios from 'axios';
import ProductsTable from './ProductsTable';
import ProductModal from './ProductModal';

export default function ProductsPage({ products, fetchProducts, setLoading, API_URL }) {
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [productForm, setProductForm] = useState({
    title: '',
    price: '',
    stock: '',
    category: 'kitchen',
    description: '',
    images: [''],
    featured: false,
    attributes: [{ key: '', value: '' }]
  });

  // Get token from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Debug logging
    console.log('🔍 Submitting product:', productForm);
    console.log('🔍 API URL:', `${API_URL}/products`);
    console.log('🔍 Token exists:', !!localStorage.getItem('adminToken'));
    
    try {
      // Validate required fields
      if (!productForm.title || !productForm.price || !productForm.category) {
        alert('Please fill in all required fields!');
        setLoading(false);
        return;
      }

      // Filter out empty images
      const validImages = productForm.images.filter(url => url.trim() !== '');
      
      if (validImages.length === 0) {
        alert('Please add at least one image URL!');
        setLoading(false);
        return;
      }

      // Convert attributes array to object
      const attributesObject = {};
      productForm.attributes.forEach(attr => {
        if (attr.key.trim() && attr.value.trim()) {
          attributesObject[attr.key.trim()] = attr.value.trim();
        }
      });

      const productData = {
        title: productForm.title.trim(),
        price: Number(productForm.price),
        stock: Number(productForm.stock) || 0,
        category: productForm.category.toLowerCase(),
        description: productForm.description.trim(),
        images: validImages,
        featured: productForm.featured || false,
        attributes: attributesObject
      };

      if (editingProduct) {
        // Update existing product
        console.log('📝 Updating product:', editingProduct._id);
        const response = await axios.put(
          `${API_URL}/products/${editingProduct._id}`,
          productData,
          { headers: getAuthHeaders() }
        );
        
        console.log('✅ Update response:', response.data);
        
        if (response.data.success) {
          alert('Product updated successfully! ✅');
          fetchProducts();
        }
      } else {
        // Create new product
        console.log('➕ Creating new product');
        const response = await axios.post(
          `${API_URL}/products`,
          productData,
          { headers: getAuthHeaders() }
        );
        
        console.log('✅ Create response:', response.data);
        
        if (response.data.success) {
          alert('Product added successfully! ✅');
          fetchProducts();
        }
      }
      
      setShowProductModal(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      console.error('❌ Full error object:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error config:', error.config);
      
      if (error.code === 'ERR_NETWORK') {
        alert('❌ Network Error! Backend server is not running.\n\nPlease start backend: cd backend && npm start');
      } else if (error.response?.status === 401) {
        alert('❌ Authentication failed! Please login again.');
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      } else if (error.response?.status === 400) {
        alert(`❌ Validation Error: ${error.response?.data?.message || 'Invalid data'}`);
      } else {
        alert(`❌ Failed to save product!\n\nError: ${error.response?.data?.message || error.message}\n\nCheck console for details.`);
      }
    }
    setLoading(false);
  };

  const resetForm = () => {
    setProductForm({
      title: '',
      price: '',
      stock: '',
      category: 'kitchen',
      description: '',
      images: [''],
      featured: false,
      attributes: [{ key: '', value: '' }]
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    
    // Extract image URLs from images array
    const imageUrls = product.images?.length > 0 
      ? product.images.map(img => typeof img === 'string' ? img : img.url)
      : [''];

    // Convert attributes object to array
    const attributesArray = product.attributes && typeof product.attributes === 'object'
      ? Object.entries(product.attributes).map(([key, value]) => ({ key, value }))
      : [{ key: '', value: '' }];

    setProductForm({
      title: product.title || '',
      price: product.price || '',
      stock: product.stock || 0,
      category: product.category || 'kitchen',
      description: product.description || '',
      images: imageUrls,
      featured: product.featured || false,
      attributes: attributesArray.length > 0 ? attributesArray : [{ key: '', value: '' }]
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      const response = await axios.delete(
        `${API_URL}/products/${id}`,
        { headers: getAuthHeaders() }
      );
      
      if (response.data.success) {
        alert('Product deleted successfully! ✅');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      if (error.response?.status === 401) {
        alert('Authentication failed! Please login again.');
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      } else {
        alert(`Failed to delete product! ${error.response?.data?.message || error.message}`);
      }
    }
    setLoading(false);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    resetForm();
    setShowProductModal(true);
  };

  const filteredProducts = products.filter(p => {
    const title = p.title || '';
    const category = p.category || '';
    const description = p.description || '';
    const searchLower = searchTerm.toLowerCase();
    
    return title.toLowerCase().includes(searchLower) ||
           category.toLowerCase().includes(searchLower) ||
           description.toLowerCase().includes(searchLower);
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Products Management</h2>
          <p className="text-gray-600 mt-1">
            Total Products: {products.length} | Showing: {filteredProducts.length}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchProducts}
            className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition">
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
          <button 
            onClick={handleAddNew}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
            <Plus size={20} className="mr-2" />
            Add Product
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by title, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredProducts.length === 0 && searchTerm && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No products found matching "{searchTerm}"</p>
        </div>
      )}

      <ProductsTable 
        products={filteredProducts}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      {showProductModal && (
        <ProductModal
          editingProduct={editingProduct}
          productForm={productForm}
          setProductForm={setProductForm}
          onSubmit={handleProductSubmit}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
            resetForm();
          }}
        />
      )}
    </div>
  );
}