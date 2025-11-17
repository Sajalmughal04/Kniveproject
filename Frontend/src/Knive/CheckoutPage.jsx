import React, { useState } from 'react';
import { useCart } from './CartContext';
import StripeCheckout from './StripeCheckout';

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

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
    
    // If card payment, show Stripe checkout
    if (formData.paymentMethod === 'card') {
      setShowPayment(true);
      return;
    }

    // For COD and Bank Transfer
    setLoading(true);

    try {
      const subtotal = getCartTotal();
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
        setSuccess(true);
        clearCart();
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        alert('❌ Failed to place order: ' + data.message);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      alert('❌ Failed to place order. Please try again.');
    }

    setLoading(false);
  };

  // Handle Stripe Payment Success
  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    setSuccess(true);
    clearCart();
    setTimeout(() => {
      window.location.href = '/payment-success?order=' + paymentData.orderNumber;
    }, 2000);
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-black flex items-center justify-center p-6">
        <div className="text-center bg-white/10 backdrop-blur-lg p-12 rounded-3xl border border-white/20">
          <div className="text-7xl mb-6">✅</div>
          <h1 className="text-4xl font-bold text-white mb-4">Order Placed Successfully!</h1>
          <p className="text-green-300 text-xl mb-6">Your order has been received and is being processed.</p>
          <p className="text-gray-300">Redirecting...</p>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
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

                <form onSubmit={handleSubmit} className="space-y-5">
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
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="cash_on_delivery">💵 Cash on Delivery</option>
                      <option value="card">💳 Credit/Debit Card (Stripe)</option>
                      <option value="bank_transfer">🏦 Bank Transfer</option>
                    </select>
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
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/50"
                  >
                    {loading ? '⏳ Processing...' : 
                     formData.paymentMethod === 'card' ? '💳 Proceed to Payment' : 
                     `🛍️ Place Order - Rs. ${total.toFixed(2)}`}
                  </button>
                </form>
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
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/20 pt-6 space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span className="font-semibold">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping:</span>
                  <span className="font-semibold">Rs. {shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax (5%):</span>
                  <span className="font-semibold">Rs. {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-white border-t border-white/20 pt-4">
                  <span>Total:</span>
                  <span className="text-yellow-400">Rs. {total.toFixed(2)}</span>
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
    </div>
  );
}