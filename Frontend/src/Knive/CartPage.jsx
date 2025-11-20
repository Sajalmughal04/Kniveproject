import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartTotal,
  selectCartCount,
} from "../Redux/slice/cartSlice.js";

export default function CartPage({ user }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const cart = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const cartCount = useSelector(selectCartCount);

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
    } else {
      navigate("/checkout");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-black py-24 px-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 border-2 border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-black dark:text-white mb-3">
            Your cart is empty
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
            Start adding items to your cart
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-medium px-8 py-3 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-12 pb-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">
            Shopping Cart
          </h1>
          <button
            onClick={() => dispatch(clearCart())}
            className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium text-sm transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-6">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 flex gap-6 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-28 h-28 object-cover bg-gray-100 dark:bg-gray-900"
              />

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-1">
                  {item.name}
                </h3>

                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {item.price.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </p>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center border border-gray-300 dark:border-gray-700">
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                      className="w-10 h-10 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-12 h-10 flex items-center justify-center text-black dark:text-white font-medium border-x border-gray-300 dark:border-gray-700">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                      className="w-10 h-10 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => dispatch(removeFromCart(item.id))}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-1 uppercase tracking-wide">Subtotal</p>
                <p className="text-xl font-semibold text-black dark:text-white">
                  {(item.price * item.quantity).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
          <div className="max-w-md ml-auto space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Items ({cartCount})
              </span>
              <span className="text-black dark:text-white font-medium">
                {cartTotal.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </span>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-800">
              <span className="text-lg font-semibold text-black dark:text-white">
                Total
              </span>
              <span className="text-2xl font-bold text-black dark:text-white">
                {cartTotal.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </span>
            </div>

            {!user && (
              <div className="py-3 px-4 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  Please log in to proceed with checkout
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate("/shop")}
                className="flex-1 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-black dark:text-white font-medium py-3 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={handleCheckout}
                className={`flex-1 font-medium py-3 transition-colors ${
                  user
                    ? "bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
                    : "bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                }`}
                disabled={!user}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}