import React from 'react';
import { Edit2, Trash2, Eye, Star } from 'lucide-react';

export default function ProductsTable({ products, onEdit, onDelete }) {
  
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 text-lg">No products found</p>
        <p className="text-gray-400 text-sm mt-2">Click "Add Product" to create your first product</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => {
              const imageUrl = product.images?.length > 0 
                ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
                : 'https://via.placeholder.com/100';

              return (
                <tr key={product._id} className="hover:bg-gray-50 transition">
                  {/* Image */}
                  <td className="px-6 py-4">
                    <div className="relative w-16 h-16">
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100';
                        }}
                      />
                      {product.featured && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                          <Star size={12} fill="white" stroke="white" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {product.title}
                      </span>
                      {product.slug && (
                        <span className="text-xs text-gray-500 mt-1">
                          /{product.slug}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-900">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold ${
                      product.stock === 0 
                        ? 'text-red-600' 
                        : product.stock < 10 
                          ? 'text-yellow-600' 
                          : 'text-green-600'
                    }`}>
                      {product.stock}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      product.stock > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => window.open(`/product/${product._id}`, '_blank')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Product"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(product)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Edit Product"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(product._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{products.length}</span> product{products.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}