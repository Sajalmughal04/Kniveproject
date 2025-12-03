import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { useSelector } from "react-redux";
import { selectCartItems, selectCartTotal } from "../Redux/slice/cartSlice";

let stripePromise = null;

// Load Stripe Key from Backend
const getStripePromise = async () => {
  if (!stripePromise) {
    try {
      const response = await fetch("https://kniveproject-ewyu.vercel.app/api/payment/config");
      const { publishableKey } = await response.json();
      stripePromise = loadStripe(publishableKey);
    } catch (error) {
      console.error("Failed to load Stripe:", error);
    }
  }
  return stripePromise;
};

/* ------------------------- CHECKOUT FORM ------------------------- */
function CheckoutForm({ customerInfo, orderTotal, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Payment failed, try again.");
          break;
        default:
          setMessage("Something went wrong.");
      }
    });
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
        receipt_email: customerInfo.email,
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
      return;
    }

    if (paymentIntent.status === "succeeded") {
      setMessage("Payment successful!");
      setIsLoading(false);
      onSuccess(paymentIntent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {message && <p className="text-white">{message}</p>}

      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl"
      >
        {isLoading ? "⏳ Processing..." : `💳 Pay $${orderTotal.toFixed(2)}`}
      </button>
    </form>
  );
}

/* ------------------------- STRIPE CHECKOUT MAIN ------------------------- */
export default function StripeCheckout({ customerInfo, onSuccess }) {
  const items = useSelector(selectCartItems);      // 🔥 Redux Cart Items
  const orderTotal = useSelector(selectCartTotal); // 🔥 Redux Total

  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "https://kniveproject-ewyu.vercel.app/api/payment/create-payment-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
            })),
            customerInfo,
            shippingCost: 200,
            tax: orderTotal * 0.05,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setClientSecret(data.clientSecret);
        setOrderId(data.orderId);
        setOrderNumber(data.orderNumber);
      }
    } catch (err) {
      console.error("Payment Intent Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (paymentIntent) => {
    if (onSuccess) {
      onSuccess({
        paymentIntentId: paymentIntent.id,
        orderId,
        orderNumber,
      });
    }
  };

  if (loading)
    return (
      <div className="p-8 bg-white/5 rounded-xl text-white">
        Loading payment...
      </div>
    );

  return (
    <div className="p-8 bg-white/5 text-white rounded-xl">
      <h2 className="text-3xl font-bold mb-2">Payment Details</h2>
      <p className="text-gray-300 mb-6">Order: {orderNumber}</p>

      {clientSecret && (
        <Elements
          stripe={getStripePromise()}
          options={{
            clientSecret,
            appearance: { theme: "night" },
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
