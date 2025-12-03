import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const paymentIntentId = searchParams.get('payment_intent');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paymentIntentId) {
      fetchPaymentStatus();
    } else {
      setLoading(false);
    }
  }, [paymentIntentId]);

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(
        `https://kniveproject-ewyu.vercel.app/api/payment/payment-status/${paymentIntentId}`
      );
      const data = await response.json();

      if (data.success) {
        setOrderDetails(data.order);
      }
    } catch (error) {
      console.error('Failed to fetch payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-gray-900 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg
              className="w-12 h-12 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Payment Successful!
          </h1>
          <p className="text-green-300 text-xl mb-8">
            Thank you for your purchase!
          </p>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-white/5 rounded-2xl p-6 mb-8 text-left">
              <h2 className="text-2xl font-bold text-white mb-4">Order Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Order Number:</span>
                  <span className="font-semibold text-white">
                    {orderDetails.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Status:</span>
                  <span className="font-semibold text-green-400">
                    {orderDetails.status}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Payment Status:</span>
                  <span className="font-semibold text-green-400">
                    {orderDetails.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300 border-t border-white/20 pt-3">
                  <span className="text-lg">Total Amount:</span>
                  <span className="font-bold text-yellow-400 text-lg">
                    Rs. {orderDetails.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {orderNumber && !orderDetails && (
            <div className="bg-white/5 rounded-2xl p-6 mb-8">
              <p className="text-white">
                Order Number: <span className="font-bold text-yellow-400">{orderNumber}</span>
              </p>
            </div>
          )}

          {/* Email Notice */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
            <p className="text-blue-300 text-sm">
              📧 A confirmation email has been sent to your email address with order details.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold px-8 py-3 rounded-xl transition shadow-lg shadow-yellow-500/50"
            >
              Continue Shopping
            </button>

            {orderDetails && (
              <button
                onClick={() => window.location.href = `/orders/${orderDetails.orderNumber}`}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-xl transition border border-white/20"
              >
                View Order
              </button>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Need help? Contact us at{' '}
            <a href="mailto:support@knives.com" className="text-yellow-400 hover:underline">
              support@knives.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}