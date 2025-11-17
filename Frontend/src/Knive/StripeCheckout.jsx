import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useCart } from './CartContext';

// Initialize Stripe (we'll fetch the key from backend)
let stripePromise = null;

const getStripePromise = async () => {
  if (!stripePromise) {
    try {
      const response = await fetch('http://localhost:3000/api/payment/config');
      const { publishableKey } = await response.json();
      stripePromise = loadStripe(publishableKey);
    } catch (error) {
      console.error('Failed to load Stripe:', error);
    }
  }
  return stripePromise;
};

// Payment Form Component
function CheckoutForm({ customerInfo, orderTotal, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
        receipt_email: customerInfo.email,
      },
      redirect: 'if_required'
    });

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage('Payment successful! 🎉');
      setIsLoading(false);
      if (onSuccess) {
        onSuccess(paymentIntent);
      }
    } else {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <PaymentElement 
          options={{
            layout: 'tabs',
            style: {
              base: {
                color: '#fff',
                fontSize: '16px',
                '::placeholder': {
                  color: '#9CA3AF'
                }
              }
            }
          }}
        />
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${
          message.includes('successful') || message.includes('succeeded')
            ? 'bg-green-500/20 border border-green-500/50 text-green-300'
            : 'bg-red-500/20 border border-red-500/50 text-red-300'
        }`}>
          {message}
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/50"
      >
        {isLoading ? '⏳ Processing...' : `💳 Pay Rs. ${orderTotal.toFixed(2)}`}
      </button>
    </form>
  );
}

// Main Stripe Checkout Component
export default function StripeCheckout({ customerInfo, items, orderTotal, onSuccess }) {
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3000/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.id || item._id,
            quantity: item.quantity
          })),
          customerInfo: customerInfo,
          shippingCost: 200,
          tax: orderTotal * 0.05
        })
      });

      const data = await response.json();

      if (data.success) {
        setClientSecret(data.clientSecret);
        setOrderId(data.orderId);
        setOrderNumber(data.orderNumber);
      } else {
        setError(data.message || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error('Payment Intent Error:', err);
      setError('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (paymentIntent) => {
    if (onSuccess) {
      onSuccess({
        paymentIntentId: paymentIntent.id,
        orderId,
        orderNumber
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mb-4"></div>
          <p className="text-white text-lg">Initializing payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Error</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={createPaymentIntent}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Payment Details</h2>
        <p className="text-gray-400">Order: {orderNumber}</p>
      </div>

      {clientSecret && (
        <Elements 
          stripe={getStripePromise()} 
          options={{
            clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#F59E0B',
                colorBackground: '#1F2937',
                colorText: '#FFFFFF',
                colorDanger: '#EF4444',
              },
            },
          }}
        >
          <CheckoutForm 
            customerInfo={customerInfo} 
            orderTotal={orderTotal}
            onSuccess={handleSuccess}
          />
        </Elements>
      )}
    </div>
  );
}