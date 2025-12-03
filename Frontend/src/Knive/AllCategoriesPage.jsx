import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const API_URL = "https://kniveproject-ewyu.vercel.app/api";

const AllCategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/categories`);
        setCategories(response.data.categories || []);
      } catch (err) {
        console.error("Categories fetch error:", err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-black min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-16 bg-gray-200 dark:bg-gray-800 w-96 mb-12 animate-pulse mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-black min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-black dark:text-white mb-4">
            Failed to Load Categories
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 font-semibold hover:opacity-80 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
              All Categories
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Explore our collection by category
            </p>
          </motion.div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="border-2 border-gray-300 dark:border-gray-800 p-16 max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold text-black dark:text-white mb-4">
                No Categories Available
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-8">
                Categories will be added soon
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => navigate(`/category/${category.slug}`)}
                className="group relative overflow-hidden bg-white dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={category.image?.url || "https://via.placeholder.com/600"}
                    alt={category.name}
                    className="w-full h-full object-cover opacity-20 dark:opacity-10 group-hover:opacity-30 dark:group-hover:opacity-20 transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent dark:from-black/80"></div>
                </div>

                {/* Content */}
                <div className="relative p-8 h-64 flex flex-col justify-end">
                  <span className="text-6xl mb-4 block transform group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </span>

                  <h2 className="text-3xl font-bold text-black dark:text-white mb-2 group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors">
                    {category.name}
                  </h2>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-500">
                      {category.productCount || 0} Products
                    </span>

                    {category.featured && (
                      <span className="bg-yellow-500 text-black px-2 py-1 text-xs font-bold">
                        FEATURED
                      </span>
                    )}
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCategoriesPage;