// src/components/admin/dashboard/StatsCard.jsx
import React from 'react';

export default function StatsCard({ label, value, icon: Icon, gradient, textColor, customIcon }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="text-3xl font-bold mt-2 text-gray-900">
            {value}
          </p>
        </div>
        <div className="bg-gray-100 p-3 rounded-lg">
          {Icon ? (
            <Icon size={28} className="text-gray-600" />
          ) : (
            <div className="text-3xl">{customIcon}</div>
          )}
        </div>
      </div>
    </div>
  );
}