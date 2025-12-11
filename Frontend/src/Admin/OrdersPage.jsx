import React, { useState } from 'react';
import { RefreshCw, ShoppingCart, Eye, Trash2, Package } from 'lucide-react';
import axios from 'axios';
import { formatUSD } from '../utils/currency';

export default function OrdersPage({ orders, fetchOrders, setLoading, API_URL }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}/orders/${orderId}`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        alert('✅ Order status updated!');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('❌ Failed to update order status!');
    }
    setLoading(false);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `${API_URL}/orders/${orderId}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        alert('✅ Order deleted successfully!');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('❌ Failed to delete order!');
    }
    setLoading(false);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-gray-800 text-white';
      case 'shipped':
        return 'bg-gray-600 text-white';
      case 'confirmed':
      case 'processing':
        return 'bg-gray-400 text-black';
      case 'cancelled':
        return 'bg-black text-white';
      default:
        return 'bg-gray-200 text-black';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Orders Management</h2>
          <p className="text-gray-600 mt-1">Total Orders: {orders.length}</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition border border-gray-700">
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {order.orderNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.paymentMethod === 'cash_on_delivery' ? 'COD' : order.paymentMethod.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{order.customerInfo?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{order.customerInfo?.email || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{order.customerInfo?.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-gray-400" />
                      <span className="font-semibold">{order.items?.length || 0} items</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {formatUSD(order.totalAmount || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                    <div className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold border-0 cursor-pointer ${getStatusBadgeClass(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition border border-gray-300"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="p-2 text-black hover:bg-gray-100 rounded-lg transition border border-gray-300"
                        title="Delete Order"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold">No orders found</p>
            <p className="text-sm">Orders will appear here once customers place them</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold">Order Details</h3>
                  <p className="text-gray-500">Order #{selectedOrder.orderNumber}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-bold text-lg mb-3">Customer Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-semibold">Name:</span> {selectedOrder.customerInfo?.name}</p>
                  <p><span className="font-semibold">Email:</span> {selectedOrder.customerInfo?.email}</p>
                  <p><span className="font-semibold">Phone:</span> {selectedOrder.customerInfo?.phone}</p>
                  <p>
                    <span className="font-semibold">Address:</span>{' '}
                    {selectedOrder.customerInfo?.address?.street}, {selectedOrder.customerInfo?.address?.city},{' '}
                    {selectedOrder.customerInfo?.address?.state} - {selectedOrder.customerInfo?.address?.zipCode}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-bold text-lg mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex gap-4 bg-gray-50 p-4 rounded-lg">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h5 className="font-semibold">{item.productName}</h5>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price: {formatUSD(item.price || 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatUSD((item.price || 0) * (item.quantity || 0))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatUSD(selectedOrder.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{formatUSD(selectedOrder.shippingCost || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatUSD(selectedOrder.tax || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-gray-900">{formatUSD(selectedOrder.totalAmount || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.customerNotes && (
                <div>
                  <h4 className="font-bold text-lg mb-2">Customer Notes</h4>
                  <p className="bg-gray-50 p-4 rounded-lg">{selectedOrder.customerNotes}</p>
                </div>
              )}

              {/* Order Info */}
              <div className="bg-gray-100 p-4 rounded-lg space-y-1 text-sm border border-gray-300">
                <p><span className="font-semibold">Status:</span> {selectedOrder.status}</p>
                <p><span className="font-semibold">Payment Method:</span> {selectedOrder.paymentMethod}</p>
                <p><span className="font-semibold">Order Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}