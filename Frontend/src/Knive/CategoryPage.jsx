import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useCart } from "./CartContext";
import SkeletonCard from "./SkeletonCard";
import SkeletonImage from "./SkeletonImage";

const API_URL = "http://localhost:3000/api";

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("");
  const [wishlist, setWishlist] = useState(
    JSON.parse(localStorage.getItem("wishlist")) || []
  );

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/categories/${slug}`);
        setCategory(response.data.category);
        setProducts(response.data.products || []);
      } catch (err) {
        console.error("Category fetch error:", err);
        setError("Category not found or failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOrder === "lowToHigh") return a.price - b.price;
    if (sortOrder === "highToLow") return b.price - a.price;
    return 0;
  });

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart({
      id: product._id,
      name: product.title,
      price: product.price,
      image: product.images[0]?.url || "https://via.placeholder.com/400",
      quantity: 1,
    });
  };

  const toggleWishlist = (id, e) => {
    e.stopPropagation();
    const updated = wishlist.includes(id)
      ? wishlist.filter((i) => i !== id)
      : [...wishlist, id];
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-black min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-12 bg-gray-200 dark:bg-gray-800 w-64 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="bg-white dark:bg-black min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-black dark:text-white mb-4">
            Category Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 font-semibold hover:opacity-80 transition"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-500">
      {/* Hero Section */}
      <div className="pt-28 pb-12 px-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="text-6xl mb-4 block">{category.icon}</span>
            <h1 className="text-5xl md:text-6xl font-bold text-black dark:text-white mb-4 tracking-tight">
              {category.name}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
              {category.description}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {sortedProducts.length} products available
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Controls */}
        <div className="flex justify-between items-center mb-12">
          <button
            onClick={() => navigate("/shop")}
            className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition font-medium"
          >
            ← Back to All Products
          </button>

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

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sortedProducts.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="border-2 border-gray-300 dark:border-gray-800 p-16 max-w-2xl mx-auto">
                <h3 className="text-3xl font-bold text-black dark:text-white mb-4">
                  No Products Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-500 mb-8">
                  Products will be added to this category soon
                </p>
                <button
                  onClick={() => navigate("/shop")}
                  className="bg-black dark:bg-white text-white dark:text-black font-semibold px-8 py-3 hover:opacity-80 transition"
                >
                  VIEW ALL PRODUCTS
                </button>
              </div>
            </div>
          ) : (
            sortedProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                  <SkeletonImage
                    src={
                      product.images && product.images.length > 0
                        ? product.images[0].url
                        : "https://via.placeholder.com/400"
                    }
                    alt={product.title}
                    className="w-full h-80 object-cover transform transition-transform duration-700 group-hover:scale-105"
                  />

                  <button
                    onClick={(e) => toggleWishlist(product._id, e)}
                    className="absolute top-4 right-4 bg-white dark:bg-black p-2 hover:scale-110 transition"
                  >
                    {wishlist.includes(product._id) ? (
                      <span className="text-xl">❤️</span>
                    ) : (
                      <span className="text-xl text-gray-400">🤍</span>
                    )}
                  </button>

                  {product.stock < 5 && product.stock > 0 && (
                    <div className="absolute top-4 left-4 bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-xs font-semibold">
                      ONLY {product.stock} LEFT
                    </div>
                  )}

                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/90 dark:bg-black/90 flex items-center justify-center">
                      <span className="text-black dark:text-white font-bold text-lg tracking-wider">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col">
                  <h2 className="text-xl font-semibold text-black dark:text-white mb-2 line-clamp-2">
                    {product.title}
                  </h2>

                  <p className="text-gray-500 dark:text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
                    {product.description}
                  </p>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-2xl font-bold text-black dark:text-white">
                        ${product.price.toFixed(2)}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;