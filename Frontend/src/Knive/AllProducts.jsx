import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addToCart } from "../Redux/slice/cartSlice";
import { useWishlist } from "./WishlistContext";
import { Heart, Tag } from "lucide-react";
import SkeletonCard from "./SkeletonCard";
import SkeletonImage from "./SkeletonImage";

const API_URL = "https://kniveproject-ewyu.vercel.app/api";

const AllProducts = ({ searchTerm = "" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const hasFetched = useRef(false);

  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

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

        console.log('📦 Response Data:', response.data);

        const validProducts = (response.data.products || []).filter(
          product => product && product._id && product.title && product.price != null
        );

        console.log('✅ Valid Products:', validProducts.length);
        setProducts(validProducts);

      } catch (err) {
        console.error("❌ Error:", err);
        setError(`Failed to load products: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchCategory =
        activeCategory === "all" || product.category === activeCategory;
      const matchSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });

    if (sortOrder === "lowToHigh")
      result.sort((a, b) => (a.finalPrice || a.price) - (b.finalPrice || b.price));
    else if (sortOrder === "highToLow")
      result.sort((a, b) => (b.finalPrice || b.price) - (a.finalPrice || a.price));

    return result;
  }, [products, activeCategory, sortOrder, searchTerm]);

  const handleAddToCart = (product, e) => {
    e.stopPropagation();

    if (!product || !product._id || !product.price) {
      console.error("❌ Invalid product data for cart:", product);
      return;
    }

    const priceToUse = product.hasDiscount ? product.finalPrice : product.price;

    dispatch(addToCart({
      id: product._id,
      name: product.title,
      price: priceToUse,
      image: product.images && product.images[0]?.url
        ? product.images[0].url
        : "https://via.placeholder.com/400",
      quantity: 1
    }));
  };

  const handleToggleWishlist = (product, e) => {
    e.stopPropagation();

    if (!product || !product._id) {
      console.error("❌ Invalid product data for wishlist:", product);
      return;
    }

    const wishlistItem = {
      id: product._id,
      _id: product._id,
      name: product.title,
      title: product.title,
      price: product.hasDiscount ? product.finalPrice : product.price,
      originalPrice: product.price,
      hasDiscount: product.hasDiscount,
      discountType: product.discountType,
      discountValue: product.discountValue,
      image: product.images && product.images.length > 0
        ? product.images[0].url
        : "https://via.placeholder.com/400",
      category: product.category,
      stock: product.stock,
      description: product.description
    };

    toggleWishlist(wishlistItem);
  };


  // ✅ UPDATED - Categories exactly matching Product Model
  const categories = [
    { id: "all", label: "All Products" },
    { id: "kitchen knives", label: "Kitchen Knives" },
    { id: "swords", label: "Swords" },
    { id: "axes", label: "Axes" },
    { id: "hunting knives", label: "Hunting Knives" },
    { id: "folding knives", label: "Folding Knives" },
    { id: "raw materials", label: "Raw Materials" },
  ];

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-500">
      {/* Header */}
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
        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-12">
          {/* ✅ UPDATED Category Filter - Modern Pill Design */}
          <div className="w-full lg:w-auto overflow-x-auto pb-4 lg:pb-0">
            <div className="flex gap-3 justify-center lg:justify-start min-w-max px-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-2.5 rounded-full font-medium text-sm tracking-wide transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md ${activeCategory === cat.id
                    ? "bg-black dark:bg-white text-white dark:text-black transform scale-105"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* View Mode */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition ${viewMode === "grid"
                  ? "text-black dark:text-white"
                  : "text-gray-400 dark:text-gray-600"
                  }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition ${viewMode === "list"
                  ? "text-black dark:text-white"
                  : "text-gray-400 dark:text-gray-600"
                  }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
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
              <p className="text-red-800 dark:text-red-200">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-black dark:bg-white text-white dark:text-black font-semibold px-6 py-2 hover:opacity-80 transition"
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid/List */}
        <div className={viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          : "flex flex-col gap-6"
        }>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : filteredProducts.map((product, index) => {
              if (!product || !product._id) return null;

              const inWishlist = isInWishlist(product._id);
              const hasDiscount = product.hasDiscount && product.discountValue > 0;
              const finalPrice = hasDiscount ? product.finalPrice : product.price;
              const savings = hasDiscount ? product.price - finalPrice : 0;

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  className={`bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer group ${viewMode === "list" ? "flex flex-row" : ""
                    }`}
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-900 ${viewMode === "list" ? "w-64 flex-shrink-0" : ""}`}>
                    <SkeletonImage
                      src={product.images?.[0]?.url || "https://via.placeholder.com/400"}
                      alt={product.title}
                      className={`object-cover transform transition-transform duration-700 group-hover:scale-105 ${viewMode === "list" ? "w-full h-full" : "w-full h-80"
                        }`}
                    />

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => handleToggleWishlist(product, e)}
                      className="absolute top-4 right-4 bg-white dark:bg-black p-2 rounded-full hover:scale-110 transition shadow-lg z-10"
                    >
                      <Heart
                        size={20}
                        fill={inWishlist ? "red" : "none"}
                        className={inWishlist ? "text-red-500" : "text-gray-400"}
                        strokeWidth={2}
                      />
                    </button>

                    {/* 🎯 DISCOUNT BADGE */}
                    {hasDiscount && (
                      <div className="absolute top-4 left-4 z-10">
                        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                          <Tag size={16} />
                          <span className="font-bold text-sm">
                            {product.discountType === 'percentage'
                              ? `-${product.discountValue}%`
                              : `-$${product.discountValue}`
                            }
                          </span>
                        </div>
                      </div>
                    )}

                    {/* ⭐ FEATURED BADGE */}
                    {product.featured && (
                      <div className={`absolute z-10 ${hasDiscount ? 'top-16' : 'top-4'} left-4`}>
                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-lg shadow-lg flex items-center gap-1">
                          <span className="text-xs font-bold uppercase tracking-wider">Featured</span>
                        </div>
                      </div>
                    )}

                    {/* Stock Badge */}
                    {product.stock < 5 && product.stock > 0 && !hasDiscount && !product.featured && (
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
                    </div>

                    <div className="mt-auto">
                      {/* 💰 PRICING WITH DISCOUNT */}
                      <div className="mb-4">
                        {hasDiscount ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <p className="text-2xl font-bold text-green-600">
                                ${finalPrice.toLocaleString()}
                              </p>
                              <p className="text-lg text-gray-400 line-through">
                                ${product.price.toLocaleString()}
                              </p>
                            </div>
                            <p className="text-xs text-green-600 font-semibold">
                              💰 Save ${savings.toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <p className="text-2xl font-bold text-black dark:text-white">
                            ${product.price.toLocaleString()}
                          </p>
                        )}

                        {product.stock > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 font-medium mt-1">
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
              <p className="text-gray-500 dark:text-gray-500 mb-8">
                Try adjusting your filters or search criteria
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