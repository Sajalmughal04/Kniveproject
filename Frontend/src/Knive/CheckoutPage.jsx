import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectCartItems, 
  selectCartTotal, 
  clearCart,
  showToast 
} from '../Redux/slice/cartSlice';
import StripeCheckout from './StripeCheckout';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const cart = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    customerNotes: '',
    paymentMethod: 'cash_on_delivery'
  });

  const API_URL = 'http://localhost:3000/api';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Cash on Delivery / Bank Transfer
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.street || !formData.city || !formData.state || !formData.zipCode) {
      dispatch(showToast('⚠️ Please fill in all required fields'));
      return;
    }

    // If card payment, show Stripe checkout
    if (formData.paymentMethod === 'card') {
      setShowPayment(true);
      return;
    }

    // For COD and Bank Transfer
    setLoading(true);

    try {
      const subtotal = cartTotal;
      const shipping = 200;
      const tax = subtotal * 0.05;
      
      const orderData = {
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: 'Pakistan'
          }
        },
        items: cart.map(item => ({
          product: item.id || item._id,
          productName: item.name,
          productImage: item.image,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: subtotal,
        shippingCost: shipping,
        tax: tax,
        totalAmount: subtotal + shipping + tax,
        paymentMethod: formData.paymentMethod,
        customerNotes: formData.customerNotes
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (data.success) {
        // Store order details for receipt
        setOrderDetails({
          orderNumber: data.order?.orderNumber || Math.floor(100000 + Math.random() * 900000),
          date: new Date().toLocaleString('en-PK', { 
            dateStyle: 'medium', 
            timeStyle: 'short' 
          }),
          customerInfo: formData,
          items: cart,
          subtotal: subtotal,
          shipping: shipping,
          tax: tax,
          total: subtotal + shipping + tax,
          paymentMethod: formData.paymentMethod
        });

        setSuccess(true);
        setShowReceipt(true); // Show receipt modal
        dispatch(clearCart());
        dispatch(showToast('✅ Order placed successfully!'));
      } else {
        dispatch(showToast('❌ Failed to place order: ' + data.message));
      }
    } catch (error) {
      console.error('Order creation error:', error);
      dispatch(showToast('❌ Failed to place order. Please try again.'));
    }

    setLoading(false);
  };

  // Handle Stripe Payment Success
  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    
    const subtotal = cartTotal;
    const shipping = 200;
    const tax = subtotal * 0.05;

    // Store order details for receipt
    setOrderDetails({
      orderNumber: paymentData.orderNumber || Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleString('en-PK', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      }),
      customerInfo: formData,
      items: cart,
      subtotal: subtotal,
      shipping: shipping,
      tax: tax,
      total: subtotal + shipping + tax,
      paymentMethod: 'card'
    });

    setSuccess(true);
    setShowReceipt(true); // Show receipt modal
    dispatch(clearCart());
    dispatch(showToast('✅ Payment successful!'));
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  const printReceipt = () => {
    window.print();
  };

  if (cart.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-4xl font-bold text-white mb-4">Your Cart is Empty</h1>
          <p className="text-gray-400 mb-6">Add some products to get started!</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cartTotal;
  const shipping = 200;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  // Customer info for Stripe
  const customerInfo = {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    address: {
      street: formData.street,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: 'Pakistan'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-12 text-center bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {!showPayment ? (
              <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
                <h2 className="text-3xl font-bold text-white mb-8">Shipping Information</h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-white font-semibold mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="+92 300 1234567"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="House #, Street Name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-semibold mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="Lahore"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-2">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="Punjab"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Zip Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="54000"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Payment Method *</label>

                    <div className="space-y-3">
                      {/* Cash on Delivery */}
                      <label
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition 
                        ${formData.paymentMethod === "cash_on_delivery"
                          ? "bg-yellow-500/20 border border-yellow-500"
                          : "bg-white/10 border border-white/20 hover:bg-white/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash_on_delivery"
                          checked={formData.paymentMethod === "cash_on_delivery"}
                          onChange={handleChange}
                          className="accent-yellow-500 w-5 h-5"
                        />
                        <span className="text-white text-lg">💵 Cash on Delivery</span>
                      </label>

                      {/* Card Payment */}
                      <label
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition 
                        ${formData.paymentMethod === "card"
                          ? "bg-yellow-500/20 border border-yellow-500"
                          : "bg-white/10 border border-white/20 hover:bg-white/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={formData.paymentMethod === "card"}
                          onChange={handleChange}
                          className="accent-yellow-500 w-5 h-5"
                        />
                        <span className="text-white text-lg">💳 Credit / Debit Card (Stripe)</span>
                      </label>

                      {/* Bank Transfer */}
                      <label
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition 
                        ${formData.paymentMethod === "bank_transfer"
                          ? "bg-yellow-500/20 border border-yellow-500"
                          : "bg-white/10 border border-white/20 hover:bg-white/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank_transfer"
                          checked={formData.paymentMethod === "bank_transfer"}
                          onChange={handleChange}
                          className="accent-yellow-500 w-5 h-5"
                        />
                        <span className="text-white text-lg">🏦 Bank Transfer</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Order Notes (Optional)</label>
                    <textarea
                      name="customerNotes"
                      value={formData.customerNotes}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Any special instructions?"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/50"
                  >
                    {loading ? '⏳ Processing...' : 
                     formData.paymentMethod === 'card' ? '💳 Proceed to Payment' : 
                     `🛍️ Place Order - ${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex items-center gap-2 text-white hover:text-yellow-400 transition mb-4"
                >
                  <span>←</span> Back to Shipping Info
                </button>
                
                <StripeCheckout
                  customerInfo={customerInfo}
                  items={cart}
                  orderTotal={total}
                  onSuccess={handlePaymentSuccess}
                />
              </>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 sticky top-8">
              <h2 className="text-3xl font-bold text-white mb-8">Order Summary</h2>

              <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4 bg-white/5 p-4 rounded-xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-400">
                        Qty: {item.quantity} × Rs. {item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-bold text-yellow-400">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/20 pt-6 space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping:</span>
                  <span className="font-semibold">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax (5%):</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-white border-t border-white/20 pt-4">
                  <span>Total:</span>
                  <span className="text-yellow-400">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-sm text-blue-300">
                  💡 <span className="font-semibold">Note:</span> {
                    formData.paymentMethod === 'card' 
                      ? 'Secure payment powered by Stripe'
                      : 'Orders will appear in the admin panel immediately!'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && orderDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Receipt Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-4xl font-bold mb-2">Order Confirmed!</h2>
              <p className="text-green-100 text-lg">Thank you for your purchase</p>
            </div>

            {/* Receipt Body */}
            <div className="p-8">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Order Number</p>
                    <p className="text-2xl font-bold text-gray-800">#{orderDetails.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm mb-1">Date & Time</p>
                    <p className="font-semibold text-gray-800">{orderDetails.date}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>👤</span> Customer Details
                </h3>
                <div className="bg-gray-50 rounded-xl p-6 space-y-2">
                  <p className="text-gray-800"><span className="font-semibold">Name:</span> {orderDetails.customerInfo.name}</p>
                  <p className="text-gray-800"><span className="font-semibold">Email:</span> {orderDetails.customerInfo.email}</p>
                  <p className="text-gray-800"><span className="font-semibold">Phone:</span> {orderDetails.customerInfo.phone}</p>
                  <p className="text-gray-800"><span className="font-semibold">Address:</span> {orderDetails.customerInfo.street}, {orderDetails.customerInfo.city}, {orderDetails.customerInfo.state} - {orderDetails.customerInfo.zipCode}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>🛍️</span> Order Items
                </h3>
                <div className="space-y-3">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-bold text-gray-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-t-2 border-gray-200 pt-6 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${orderDetails.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping:</span>
                    <span className="font-semibold">${orderDetails.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (5%):</span>
                    <span className="font-semibold">${orderDetails.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-bold text-gray-900 border-t-2 border-gray-300 pt-3">
                    <span>Total Paid:</span>
                    <span className="text-green-600">${orderDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-gray-800">
                  <span className="font-semibold">Payment Method:</span>{' '}
                  {orderDetails.paymentMethod === 'cash_on_delivery' && '💵 Cash on Delivery'}
                  {orderDetails.paymentMethod === 'card' && '💳 Credit/Debit Card'}
                  {orderDetails.paymentMethod === 'bank_transfer' && '🏦 Bank Transfer'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={printReceipt}
                  className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <span>🖨️</span> Print Receipt
                </button>
                <button
                  onClick={closeReceipt}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl transition"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Footer Note */}
              <div className="mt-6 text-center text-gray-600 text-sm">
                <p>Thank you for shopping with us! 💝</p>
                <p className="mt-1">A confirmation email has been sent to {orderDetails.customerInfo.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}