import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCartItems,
  selectCartTotal,
  clearCart,
  showToast
} from '../Redux/slice/cartSlice';
import StripeCheckout from './StripeCheckout';
import { API_BASE_URL } from '../api';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const cart = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

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

  const API_URL = API_BASE_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Promo Code Application
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    setPromoError('');

    try {
      const response = await fetch(`${API_URL}/promocodes/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode })
      });

      const data = await response.json();

      if (data.success) {
        const promo = data.data;

        // Calculate Discount Logic
        // CRITICAL: Only apply discount to items that DO NOT have an existing discount
        let eligibleTotal = 0;
        let hasEligibleItems = false;

        cart.forEach(item => {
          if (!item.hasDiscount) {
            eligibleTotal += (item.price * item.quantity);
            hasEligibleItems = true;
          }
        });

        if (!hasEligibleItems) {
          setPromoError('Promo code cannot be applied to already discounted items.');
          setPromoLoading(false);
          return;
        }

        let calculatedDiscount = 0;
        if (promo.discountType === 'percentage') {
          calculatedDiscount = (eligibleTotal * promo.discountValue) / 100;
        } else {
          // Fixed amount, but don't exceed eligible total
          calculatedDiscount = Math.min(promo.discountValue, eligibleTotal);
        }

        setAppliedPromo(promo);
        setDiscountAmount(calculatedDiscount);
        dispatch(showToast(`✅ Promo code applied! You saved $${calculatedDiscount.toFixed(2)}`));
      } else {
        setPromoError(data.message || 'Invalid promo code');
        setAppliedPromo(null);
        setDiscountAmount(0);
      }
    } catch (error) {
      console.error('Promo validation error:', error);
      setPromoError('Failed to validate promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoCode('');
    setPromoError('');
    dispatch(showToast('Promo code removed'));
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
      // Scroll to top when showing payment section
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // For COD and Bank Transfer
    setLoading(true);

    try {
      const subtotal = cartTotal;
      const shipping = 200;
      const tax = subtotal * 0.05;
      const totalAmount = subtotal + shipping + tax - discountAmount;

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
        discount: discountAmount,
        promoCode: appliedPromo ? appliedPromo.code : null,
        totalAmount: totalAmount,
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
          discount: discountAmount,
          total: totalAmount,
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
    const totalAmount = subtotal + shipping + tax - discountAmount;

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
      discount: discountAmount,
      total: totalAmount,
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
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4 text-gray-300">🛒</div>
          <h1 className="text-3xl font-bold text-black mb-4">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8">Add some products to get started.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-black text-white hover:bg-gray-800 font-medium px-8 py-3 rounded-full transition duration-300"
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
  const total = subtotal + shipping + tax - discountAmount;

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
    <div className="min-h-screen bg-white text-black py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-12 text-center tracking-tight">
          CHECKOUT
        </h1>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-7 space-y-8">
            {!showPayment ? (
              <div className="bg-white">
                <h2 className="text-2xl font-bold text-black mb-6 border-b border-gray-200 pb-4">
                  Shipping Details
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-none border border-gray-300 focus:border-black focus:ring-0 transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-none border border-gray-300 focus:border-black focus:ring-0 transition-colors"
                        placeholder="+92 300 1234567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-none border border-gray-300 focus:border-black focus:ring-0 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-none border border-gray-300 focus:border-black focus:ring-0 transition-colors"
                      placeholder="House #, Street Name"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-none border border-gray-300 focus:border-black focus:ring-0 transition-colors"
                        placeholder="Lahore"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-none border border-gray-300 focus:border-black focus:ring-0 transition-colors"
                        placeholder="Punjab"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-none border border-gray-300 focus:border-black focus:ring-0 transition-colors"
                        placeholder="54000"
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <h3 className="text-lg font-bold text-black mb-4">Payment Method</h3>
                    <div className="space-y-3">
                      {['cash_on_delivery', 'card', 'bank_transfer'].map((method) => (
                        <label
                          key={method}
                          className={`flex items-center gap-4 p-4 border cursor-pointer transition-all duration-200 ${formData.paymentMethod === method
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-400"
                            }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method}
                            checked={formData.paymentMethod === method}
                            onChange={handleChange}
                            className="w-5 h-5 text-black border-gray-300 focus:ring-black"
                          />
                          <span className="text-base font-medium capitalize">
                            {method.replace(/_/g, ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes (Optional)</label>
                    <textarea
                      name="customerNotes"
                      value={formData.customerNotes}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-3 rounded-none border border-gray-300 focus:border-black focus:ring-0 transition-colors"
                      placeholder="Special instructions for delivery..."
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-black text-white hover:bg-gray-800 font-bold py-4 rounded-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-8 text-lg tracking-wide"
                  >
                    {loading ? 'PROCESSING...' :
                      formData.paymentMethod === 'card' ? 'PROCEED TO PAYMENT' :
                        `PLACE ORDER • $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white">
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex items-center gap-2 text-gray-600 hover:text-black transition mb-6 font-medium"
                >
                  <span>←</span> Back to Details
                </button>

                <div className="border border-gray-200 p-8 rounded-none">
                  <StripeCheckout
                    customerInfo={customerInfo}
                    items={cart}
                    orderTotal={total}
                    onSuccess={handlePaymentSuccess}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-gray-50 p-8 sticky top-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-black mb-6">Order Summary</h2>

              <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="w-20 h-20 bg-white border border-gray-200 flex-shrink-0 overflow-hidden relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {item.hasDiscount && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1 font-bold">
                          SALE
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-black text-sm truncate">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Qty: {item.quantity}
                      </p>
                      {item.hasDiscount && (
                        <p className="text-xs text-red-500 mt-1">
                          Discount applied
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-black text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.hasDiscount && (
                        <p className="text-xs text-gray-400 line-through">
                          ${(item.originalPrice * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    disabled={!!appliedPromo}
                    className="flex-1 px-4 py-2 rounded-none border border-gray-300 focus:border-black focus:ring-0 uppercase placeholder-gray-400"
                  />
                  {appliedPromo ? (
                    <button
                      onClick={handleRemovePromo}
                      className="bg-red-500 text-white px-4 py-2 font-bold hover:bg-red-600 transition"
                    >
                      REMOVE
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoCode}
                      className="bg-black text-white px-4 py-2 font-bold hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      {promoLoading ? '...' : 'APPLY'}
                    </button>
                  )}
                </div>
                {promoError && (
                  <p className="text-red-500 text-sm mt-2">{promoError}</p>
                )}
                {appliedPromo && (
                  <p className="text-green-600 text-sm mt-2">
                    Code <b>{appliedPromo.code}</b> applied successfully!
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (5%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-xl font-bold text-black border-t border-black pt-4 mt-4">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 text-xs text-gray-400 text-center">
                <p>Secure Checkout • 256-bit SSL Encryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimalist Receipt Modal */}
      {showReceipt && orderDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
            <div className="p-8 border-b-4 border-black">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  ✓
                </div>
                <h2 className="text-2xl font-bold text-black uppercase tracking-wider">Order Confirmed</h2>
                <p className="text-gray-500 mt-2">Order #{orderDetails.orderNumber}</p>
                <p className="text-sm text-gray-400">{orderDetails.date}</p>
              </div>

              <div className="space-y-6 font-mono text-sm">
                <div className="border-t border-dashed border-gray-300 pt-4">
                  <p className="font-bold mb-2">Customer:</p>
                  <p>{orderDetails.customerInfo.name}</p>
                  <p>{orderDetails.customerInfo.email}</p>
                  <p>{orderDetails.customerInfo.phone}</p>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-4">
                  <p className="font-bold mb-2">Items:</p>
                  {orderDetails.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between mb-1">
                      <span>{item.quantity}x {item.name.substring(0, 20)}...</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-gray-300 pt-4 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${orderDetails.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${orderDetails.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${orderDetails.tax.toFixed(2)}</span>
                  </div>

                  {orderDetails.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${orderDetails.discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-black mt-2">
                    <span>TOTAL</span>
                    <span>${orderDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  onClick={printReceipt}
                  className="w-full border border-black text-black font-bold py-3 hover:bg-gray-50 transition uppercase tracking-wide text-sm"
                >
                  Print Receipt
                </button>
                <button
                  onClick={closeReceipt}
                  className="w-full bg-black text-white font-bold py-3 hover:bg-gray-800 transition uppercase tracking-wide text-sm"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
            <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100">
              Thank you for your business.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}