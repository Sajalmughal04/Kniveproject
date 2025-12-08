import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../Redux/slice/cartSlice";
import { useWishlist } from "./WishlistContext";
import { API_BASE_URL } from "../api";

const API_URL = API_BASE_URL;

const ProductDetail = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/products/${id}`);
        const productData = response.data.product || response.data;

        console.log("📦 Full Response:", response.data);
        console.log("📦 Product Data:", productData);
        console.log("💰 Price:", productData.price);
        console.log("🔍 Attributes:", productData.attributes);
        console.log("🔍 Attributes type:", typeof productData.attributes);
        console.log("✅ Product extracted successfully!");

        setProduct(productData);
      } catch (err) {
        console.error("❌ Error fetching product:", err);
        console.error("❌ Error Response:", err.response);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Product Not Found!</h2>
          <button
            onClick={() => navigate("/shop")}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 px-6 rounded-lg"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const productPrice = product?.price || 0;

  console.log("🔍 Final Product Check:");
  console.log("  - Product:", product);
  console.log("  - Price:", product?.price);
  console.log("  - Title:", product?.title);
  console.log("  - productPrice variable:", productPrice);

  const discountType = product?.discountType || 'none';
  const discountValue = product?.discountValue || 0;
  const hasDiscount = product?.hasDiscount || (discountValue > 0 && discountType !== 'none');
  const finalPrice = product?.finalPrice || product?.discountedPrice || productPrice;
  const savings = product?.savings || (hasDiscount ? productPrice - finalPrice : 0);

  if (!product || !product.price || !product.title) {
    console.error("❌ Missing required fields!");
    console.error("Product:", product);
    console.error("Price exists?:", !!product?.price);
    console.error("Title exists?:", !!product?.title);

    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Product Data!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">Missing: {!product?.price ? 'Price' : ''} {!product?.title ? 'Title' : ''}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Check console for details (F12)
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 px-6 rounded-lg"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images.map(img => img.url)
    : ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E"];

  const handleAddToCart = () => {
    if (product.stock > 0) {
      dispatch(addToCart({
        id: product._id,
        name: product.title,
        price: finalPrice,
        image: images[0],
        quantity: parseInt(quantity),
        discountType,
        discountValue,
        finalPrice,
        hasDiscount,
        savings,
        originalPrice: productPrice
      }));

      toast.success(`${product.title} added to cart!`, {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleBuyNow = () => {
    if (product.stock === 0) {
      toast.error("This product is out of stock!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!user) {
      toast.warning("Please login to proceed with purchase!", {
        position: "top-right",
        autoClose: 3000,
      });
      handleAddToCart();
      navigate("/login", { state: { from: '/checkout' } });
      return;
    }

    handleAddToCart();
    navigate("/checkout");
  };

  const handleToggleWishlist = () => {
    if (!product || !product._id) {
      console.error("❌ Product data missing!");
      return;
    }

    const wishlistItem = {
      id: product._id,
      _id: product._id,
      name: product.title,
      title: product.title,
      price: finalPrice,
      originalPrice: productPrice,
      hasDiscount,
      discountType,
      discountValue,
      image: images && images.length > 0 ? images[0] : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E",
      category: product.category,
      stock: product.stock,
      description: product.description
    };

    console.log("🔄 Toggling wishlist for:", wishlistItem);
    toggleWishlist(wishlistItem);
  };

  const inWishlist = isInWishlist(product._id);

  const nextImage = () =>
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevImage = () =>
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  return (
    <div className="max-w-5xl mx-auto px-6 py-24 flex flex-col md:flex-row gap-12 bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition">
      {/* LEFT SIDE - IMAGE SECTION */}
      <div className="md:w-1/2 w-full">
        <div className="relative overflow-hidden rounded-2xl mb-4">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={images[currentImage]}
              alt={product.title || "Product"}
              className="w-full h-[420px] object-cover rounded-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            />
          </AnimatePresence>

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black transition"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">OUT OF STOCK</span>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-3 justify-center">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                onClick={() => setCurrentImage(index)}
                alt=""
                className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 transition-transform duration-200 hover:scale-110 ${index === currentImage
                  ? "border-black dark:border-white"
                  : "border-gray-300 opacity-70"
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* RIGHT SIDE - DETAILS SECTION */}
      <div className="md:w-1/2 w-full">
        <h1 className="text-3xl font-bold mb-2">{product.title}</h1>

        {/* Price Display with Discount */}
        <div className="mb-4">
          {hasDiscount ? (
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-2xl text-yellow-500 font-bold">
                Rs. {finalPrice.toFixed(2)}
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-400 line-through">
                Rs. {productPrice.toFixed(2)}
              </p>
              <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                {discountType === 'percentage' ? `${discountValue}% OFF` : `Rs. ${discountValue} OFF`}
              </span>
            </div>
          ) : (
            <p className="text-2xl text-yellow-500 font-bold">
              Rs. {productPrice.toFixed(2)}
            </p>
          )}
          {hasDiscount && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              You save Rs. {savings.toFixed(2)}!
            </p>
          )}
        </div>

        {product.category && (
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold uppercase">
              {product.category}
            </span>
          </div>
        )}

        <p className="mb-4">
          <span className="font-semibold">Stock:</span>{" "}
          <span className={product.stock > 5 ? "text-green-600" : "text-red-600"}>
            {product.stock > 0 ? `${product.stock} available` : "Out of Stock"}
          </span>
        </p>

        {product.description && (
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">Product Description:</h3>
            <p className="text-gray-700 dark:text-gray-300">{product.description}</p>
          </div>
        )}

        {/* Specifications */}
        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">Specifications:</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
              {Object.entries(product.attributes).map(([key, value]) => (
                <li key={key}>
                  <span className="font-semibold capitalize">{key}:</span> {value}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!user && product.stock > 0 && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-600 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 font-semibold text-center">
              🔒 Login required to purchase this product
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center border border-gray-400 dark:border-gray-600 rounded-full">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={product.stock === 0}
              className="px-3 py-1 text-lg disabled:opacity-50"
            >
              −
            </button>
            <span className="px-3">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              disabled={product.stock === 0}
              className="px-3 py-1 text-lg disabled:opacity-50"
            >
              +
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🛒 ADD TO CART
          </motion.button>

          <button
            onClick={handleToggleWishlist}
            className="border border-gray-400 dark:border-gray-600 rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <Heart
              fill={inWishlist ? "red" : "none"}
              strokeWidth={1.5}
              className={inWishlist ? "text-red-500" : "text-gray-600 dark:text-gray-400"}
            />
          </button>
        </div>

        <button
          onClick={handleBuyNow}
          disabled={product.stock === 0}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-3 rounded-full font-semibold mb-6 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {user ? 'BUY IT NOW' : '🔒 LOGIN TO BUY NOW'}
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;