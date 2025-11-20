import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useDispatch } from "react-redux"; // ✅ Redux
import { addToCart } from "../Redux/slice/cartSlice"; // ✅ Redux Action
import { useWishlist } from "./WishlistContext";
import { Heart } from "lucide-react";
import SkeletonCard from "./SkeletonCard";
import SkeletonImage from "./SkeletonImage";

const API_URL = "http://localhost:3000/api";

const AllProducts = ({ searchTerm = "" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // ✅ Redux Dispatch
  const { toggleWishlist, isInWishlist } = useWishlist();
  const hasFetched = useRef(false);

  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  // ✅ ENHANCED - Fetch products with full debugging
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('🔄 Fetching products from:', `${API_URL}/products`);
        
        const response = await axios.get(`${API_URL}/products`, {
          params: { limit: 100 }
        });
        
        console.log('📦 Full Response:', response);
        console.log('📦 Response Data:', response.data);
        console.log('📦 Products Array:', response.data.products);
        console.log('📦 Products Count:', response.data.products?.length);
        
        // ✅ Validate products data
        const validProducts = (response.data.products || []).filter(
          product => {
            const isValid = product && product._id && product.title && product.price != null;
            if (!isValid) {
              console.warn('⚠️ Invalid product found:', product);
            }
            return isValid;
          }
        );
        
        console.log('✅ Valid Products:', validProducts);
        console.log('✅ Valid Products Count:', validProducts.length);
        
        setProducts(validProducts);
        
        if (validProducts.length === 0) {
          console.warn('⚠️ No valid products found!');
        }
        
        if (validProducts.length < (response.data.products || []).length) {
          console.warn('⚠️ Some products filtered due to invalid data');
        }
      } catch (err) {
        console.error("❌ Full Error:", err);
        console.error("❌ Error Message:", err.message);
        console.error("❌ Error Response:", err.response);
        console.error("❌ Error Response Data:", err.response?.data);
        console.error("❌ Error Response Status:", err.response?.status);
        setError(`Failed to load products: ${err.message}`);
      } finally {
        setLoading(false);
        console.log('🏁 Loading finished');
      }
    };

    fetchProducts();
  }, []);

  // Filter + sort
  const filteredProducts = useMemo(() => {
    console.log('🔍 Filtering products. Total:', products.length);
    
    let result = products.filter((product) => {
      const matchCategory =
        activeCategory === "all" || product.category === activeCategory;
      const matchSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });

    console.log('🔍 After filter:', result.length, 'products');

    if (sortOrder === "lowToHigh")
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortOrder === "highToLow")
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    
    return result;
  }, [products, activeCategory, sortOrder, searchTerm]);

  // ✅ Add to cart - NOW USING REDUX
  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    
    if (!product || !product._id || !product.price) {
      console.error("❌ Invalid product data for cart:", product);
      return;
    }
    
    console.log('🛒 Adding to cart:', product.title);
    
    dispatch(addToCart({ 
      id: product._id,
      name: product.title,
      price: product.price,
      image: product.images && product.images[0]?.url 
        ? product.images[0].url 
        : "https://via.placeholder.com/400",
      quantity: 1 
    }));
  };

  // Toggle wishlist
  const handleToggleWishlist = (product, e) => {
    e.stopPropagation();
    
    if (!product || !product._id) {
      console.error("❌ Invalid product data for wishlist:", product);
      return;
    }
    
    console.log('❤️ Toggling wishlist for:', product.title);
    
    const wishlistItem = {
      id: product._id,
      _id: product._id,
      name: product.title,
      title: product.title,
      price: product.price,
      image: product.images && product.images.length > 0 
        ? product.images[0].url 
        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E",
      category: product.category,
      stock: product.stock,
      description: product.description
    };
    
    toggleWishlist(wishlistItem);
  };

  const categories = [
    { id: "all", label: "All Products" },
    { id: "kitchen", label: "Kitchen" },
    { id: "swords", label: "Swords" },
    { id: "axes", label: "Axes" },
  ];

  console.log('🎨 Rendering AllProducts. Loading:', loading, 'Products:', products.length, 'Filtered:', filteredProducts.length);

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-500">
      {/* Minimal Header */}
      <div className="pt-28 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-black dark:text-white mb-3 tracking-tight">
              Our Collection
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {filteredProducts.length} products available
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Minimal Controls */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-12">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2 font-semibold text-sm tracking-wide transition-all duration-300 border-b-2 ${
                  activeCategory === cat.id
                    ? "border-black dark:border-white text-black dark:text-white"
                    : "border-transparent text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* View Mode */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition ${
                  viewMode === "grid"
                    ? "text-black dark:text-white"
                    : "text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition ${
                  viewMode === "list"
                    ? "text-black dark:text-white"
                    : "text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            {/* Sort */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-transparent border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition cursor-pointer"
            >
              <option value="">Sort by Price</option>
              <option value="lowToHigh">Low to High</option>
              <option value="highToLow">High to Low</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 p-6 mb-8 flex items-center justify-between"
            >
              <div>
                <p className="text-red-800 dark:text-red-200 font-medium mb-2">{error}</p>
                <p className="text-red-600 dark:text-red-400 text-sm">
                  Check console (F12) for detailed error information
                </p>
              </div>
              <button 
                onClick={() => {
                  hasFetched.current = false;
                  window.location.reload();
                }} 
                className="bg-black dark:bg-white text-white dark:text-black font-semibold px-6 py-2 hover:opacity-80 transition"
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State Debug Info */}
        {loading && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900">
            <p className="text-blue-800 dark:text-blue-200 font-medium">
              🔄 Loading products... Check console for details
            </p>
          </div>
        )}

        {/* Product Grid/List */}
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          : "flex flex-col gap-6"
        }>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : filteredProducts.map((product, index) => {
                if (!product || !product._id || !product.title || product.price == null) {
                  console.warn('⚠️ Skipping invalid product in render:', product);
                  return null;
                }
                
                const inWishlist = isInWishlist(product._id);

                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                    className={`bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer group ${
                      viewMode === "list" ? "flex flex-row" : ""
                    }`}
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-900 ${viewMode === "list" ? "w-64 flex-shrink-0" : ""}`}>
                      <SkeletonImage
                        src={product.images && product.images.length > 0
                          ? product.images[0].url
                          : "https://via.placeholder.com/400"}
                        alt={product.title || "Product"}
                        className={`object-cover transform transition-transform duration-700 group-hover:scale-105 ${
                          viewMode === "list" ? "w-full h-full" : "w-full h-80"
                        }`}
                      />
                      
                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => handleToggleWishlist(product, e)}
                        className="absolute top-4 right-4 bg-white dark:bg-black p-2 rounded-full hover:scale-110 transition shadow-lg"
                      >
                        <Heart
                          size={20}
                          fill={inWishlist ? "red" : "none"}
                          className={inWishlist ? "text-red-500" : "text-gray-400 dark:text-gray-600"}
                          strokeWidth={2}
                        />
                      </button>
                      
                      {/* Stock Badge */}
                      {product.stock < 5 && product.stock > 0 && (
                        <div className="absolute top-4 left-4 bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-xs font-semibold">
                          ONLY {product.stock} LEFT
                        </div>
                      )}
                      
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-white/90 dark:bg-black/90 flex items-center justify-center">
                          <span className="text-black dark:text-white font-bold text-lg tracking-wider">OUT OF STOCK</span>
                        </div>
                      )}
                    </div>

                    <div className={`p-6 flex flex-col ${viewMode === "list" ? "flex-1 justify-between" : ""}`}>
                      <div>
                        <h2 className="text-xl font-semibold text-black dark:text-white mb-2 line-clamp-2">
                          {product.title}
                        </h2>
                        
                        <p className="text-gray-500 dark:text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
                          {product.description || "No description available"}
                        </p>
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-2xl font-bold text-black dark:text-white">
                            ${(product.price || 0).toFixed(2)}
                          </p>
                          
                          {product.stock > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                              In Stock: {product.stock}
                            </p>
                          )}
                        </div>
                        
                        {product.stock > 0 ? (
                          <motion.button
                            onClick={(e) => handleAddToCart(product, e)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 px-6 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-300"
                          >
                            ADD TO CART
                          </motion.button>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-gray-200 dark:bg-gray-900 text-gray-400 dark:text-gray-600 font-semibold py-3 px-6 cursor-not-allowed"
                          >
                            OUT OF STOCK
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
        </div>

        {/* No Products Found */}
        {!loading && filteredProducts.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="border-2 border-gray-300 dark:border-gray-800 p-16 max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold text-black dark:text-white mb-4">
                No Products Found
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-4">
                Try adjusting your filters or search criteria
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-600 mb-8">
                Total products loaded: {products.length}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setActiveCategory("all")}
                  className="bg-black dark:bg-white text-white dark:text-black font-semibold px-8 py-3 hover:opacity-80 transition"
                >
                  VIEW ALL
                </button>
                <button
                  onClick={() => setSortOrder("")}
                  className="border border-black dark:border-white text-black dark:text-white font-semibold px-8 py-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition"
                >
                  CLEAR FILTERS
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AllProducts;