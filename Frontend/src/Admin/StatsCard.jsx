// src/components/admin/dashboard/StatsCard.jsx
import React from 'react';

export default function StatsCard({ label, value, icon: Icon, gradient, textColor, customIcon }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} p-6 rounded-lg shadow-lg text-white transform hover:scale-105 transition-transform duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${textColor} text-sm font-medium uppercase tracking-wide`}>
            {label}
          </p>
          <p className="text-3xl font-bold mt-2">
            {value}
          </p>
        </div>
        <div className="opacity-80">
          {Icon ? (
            <Icon size={48} />
          ) : (
            <div className="text-5xl">{customIcon}</div>
          )}
        </div>
      </div>
    </div>
  );
}