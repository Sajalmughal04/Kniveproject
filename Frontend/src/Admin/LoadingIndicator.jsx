// src/components/admin/LoadingIndicator.jsx
import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function LoadingIndicator({ loading }) {
  if (!loading) return null;
  
  return (
    <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center z-50 animate-fade-in">
      <RefreshCw className="animate-spin mr-2" size={16} />
      <span className="font-medium">Loading...</span>
    </div>
  );
}