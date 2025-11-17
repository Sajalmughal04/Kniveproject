// src/Knive/SkeletonCard.jsx
import React from "react";

const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse">
      {/* image placeholder */}
      <div className="w-full h-64 bg-gray-300 dark:bg-gray-700" />

      {/* text placeholders */}
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
        <div className="mt-3 h-10 bg-gray-300 dark:bg-gray-700 rounded w-full" />
      </div>
    </div>
  );
};

export default SkeletonCard;
