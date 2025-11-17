// src/Knive/Wishlist.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const Wishlist = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist();

  const handleAddToCart = (item) => {
    if (item.stock === 0) {
      toast.error("Product out of stock!");
      return;
    }

    addToCart({
      id: item.id || item._id,
      name: item.name || item.title,
      price: item.price,
      image: item.image,
      quantity: 1
    });
    
    toast.success(`${item.name || item.title} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              My Favorites <Heart className="text-red-500" fill="red" />
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"} in your wishlist
            </p>
          </div>
          
          {/* Clear All Button */}
          {wishlist.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to clear your entire wishlist?")) {
                  clearWishlist();
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <Trash2 size={18} />
              Clear All
            </button>
          )}
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start adding products you love!
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold transition"
            >
              Browse Products
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item, index) => {
              // Extract all needed data at the top
              const productId = item.id || item._id;
              const productName = item.name || item.title || "Unknown Product";
              const productPrice = item.price || 0;
              const productImage = item.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

              // Handler function inside map scope
              const handleRemove = (e) => {
                e.stopPropagation();
                console.log("🗑️ Removing item with ID:", productId);
                
                // Pass the complete item object with proper structure
                toggleWishlist({
                  ...item,
                  id: productId,
                  _id: productId
                });
              };

              return (
                <div
                  key={`wishlist-${productId}-${index}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 relative group"
                >
                  {/* Image Section */}
                  <div
                    onClick={() => navigate(`/product/${productId}`)}
                    className="cursor-pointer relative overflow-hidden bg-gray-100 dark:bg-gray-700"
                  >
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />

                    {/* Remove Button */}
                    <button
                      onClick={handleRemove}
                      className="absolute top-3 right-3 bg-white dark:bg-gray-800 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-lg z-10"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={20} />
                    </button>

                    {/* Out of Stock Badge */}
                    {item.stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">OUT OF STOCK</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3
                      onClick={() => navigate(`/product/${productId}`)}
                      className="text-lg font-semibold text-gray-800 dark:text-white mb-2 cursor-pointer hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors line-clamp-2 min-h-[3.5rem]"
                    >
                      {productName}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                        Rs. {productPrice.toFixed(2)}
                      </span>
                      {item.oldPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          Rs. {item.oldPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Category Badge */}
                    {item.category && (
                      <div className="mb-3">
                        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-semibold uppercase">
                          {item.category}
                        </span>
                      </div>
                    )}

                    {/* Stock Info */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Stock: {item.stock > 0 ? (
                        <span className="text-green-600 font-semibold">{item.stock} available</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Out of stock</span>
                      )}
                    </p>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stock === 0}
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      <ShoppingCart size={20} />
                      {item.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;