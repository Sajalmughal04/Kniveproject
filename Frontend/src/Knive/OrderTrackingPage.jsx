// src/Knive/OrderTrackingPage.jsx
import React, { useState } from "react";
import { CheckCircle, Package, Truck, Home } from "lucide-react";

const OrderTrackingPage = () => {
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState(null);

  const mockStatuses = ["Order Placed", "Packed", "Shipped", "Delivered"];

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      alert("Please enter a valid Order ID.");
      return;
    }

    // ✅ Mock random order status
    const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    setStatus(randomStatus);
  };

  const statusSteps = [
    { label: "Order Placed", icon: <CheckCircle className="w-6 h-6" /> },
    { label: "Packed", icon: <Package className="w-6 h-6" /> },
    { label: "Shipped", icon: <Truck className="w-6 h-6" /> },
    { label: "Delivered", icon: <Home className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-16 px-6 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Track Your Order
        </h2>

        <form onSubmit={handleTrack} className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Enter your Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-lg transition"
          >
            Track
          </button>
        </form>

        {status && (
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Current Status:{" "}
              <span className="text-yellow-500">{status}</span>
            </h3>

            <div className="flex justify-between items-center relative">
              {statusSteps.map((step, index) => {
                const isActive = mockStatuses.indexOf(status) >= index;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center relative z-10"
                  >
                    <div
                      className={`rounded-full p-3 border-2 ${
                        isActive
                          ? "border-yellow-500 bg-yellow-100 text-yellow-600 dark:bg-yellow-600 dark:text-white"
                          : "border-gray-300 bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <p
                      className={`mt-2 text-sm ${
                        isActive
                          ? "text-yellow-600 dark:text-yellow-400 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
              <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-300 dark:bg-gray-600 -z-10"></div>
              <div
                className="absolute top-5 left-0 h-[2px] bg-yellow-500 -z-10 transition-all duration-500"
                style={{
                  width: `${
                    ((mockStatuses.indexOf(status) + 1) / mockStatuses.length) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
