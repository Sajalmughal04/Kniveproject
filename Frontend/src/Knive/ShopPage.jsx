// ShopPage.jsx - COMPLETE FIXED CODE
import React, { useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "./Hero";
import AllProducts from "./AllProducts";

const ShopPage = ({ searchTerm }) => {
  const productsRef = useRef(null);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (searchTerm && productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchTerm]);

  return (
    <>
      {/* Hero sirf Home page pe show karo */}
      {isHomePage && (
        <Hero
          scrollToProducts={() =>
            productsRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        />
      )}

      <div
        id="products-section"
        ref={productsRef}
        className={`bg-gray-50 dark:bg-gray-900 transition-colors duration-500 py-12 px-6 ${
          !isHomePage ? "pt-24" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white capitalize">
              {isHomePage ? "Featured Products" : "All Products"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Explore our premium collection of handcrafted knives.
            </p>
          </div>

          {/* ✅ No addToCart prop - AllProducts will use useCart() hook */}
          <AllProducts searchTerm={searchTerm} />
        </div>
      </div>
    </>
  );
};

export default ShopPage;