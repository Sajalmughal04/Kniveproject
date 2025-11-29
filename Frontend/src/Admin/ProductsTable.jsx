import React from 'react';
import { Edit2, Trash2, Tag, TrendingDown } from 'lucide-react';

export default function ProductsTable({ products, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => {
              const hasDiscount = product.hasDiscount || (product.discountValue > 0 && product.discountType !== 'none');
              const finalPrice = hasDiscount ? product.finalPrice : product.price;
              const savings = hasDiscount ? product.price - finalPrice : 0;

              return (
                <tr key={product._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <img
                      src={product.images?.[0]?.url || 'https://via.placeholder.com/80'}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {product.title}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {product.description}
                      </p>
                      {product.featured && (
                        <span className="inline-block mt-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {hasDiscount ? (
                        <>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-bold text-green-600">
                              Rs. {finalPrice?.toLocaleString() || '0'}
                            </p>
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                              {product.discountType === 'percentage' 
                                ? `-${product.discountValue}%`
                                : `-Rs. ${product.discountValue}`
                              }
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 line-through">
                            Rs. {product.price?.toLocaleString() || '0'}
                          </p>
                          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <TrendingDown size={12} />
                            Save Rs. {savings.toLocaleString()}
                          </p>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-gray-900">
                          Rs. {product.price?.toLocaleString() || '0'}
                        </p>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        product.stock === 0 
                          ? 'bg-red-100 text-red-800'
                          : product.stock < 5 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stock}
                      </span>
                      {product.stock < 5 && product.stock > 0 && (
                        <span className="text-xs text-yellow-600 font-medium">Low</span>
                      )}
                      {product.stock === 0 && (
                        <span className="text-xs text-red-600 font-medium">Out</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                      {product.category}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {hasDiscount && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded">
                          <Tag size={12} />
                          On Sale
                        </div>
                      )}
                      <div className={`text-xs font-medium px-2 py-1 rounded ${
                        product.stock > 0 
                          ? 'text-green-700 bg-green-50'
                          : 'text-red-700 bg-red-50'
                      }`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(product)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                        title="Edit Product"
                      >
                        <Edit2 size={18} />
                      </button>
                      
                      <button
                        onClick={() => onDelete(product._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
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
      
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      )}
    </div>
  );
}