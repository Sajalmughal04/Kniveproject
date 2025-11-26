import express from "express";
import Stripe from "stripe";
import { 
  getStripeConfig,
  createPaymentIntent,
  getPaymentStatus,
  processRefund,
  testStripeConnection 
} from "../controllers/paymentController.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { protectAdmin } from "../Middleware/authMiddleware.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// ⚠️ Webhook MUST be first (before JSON parsing)
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("✅ Payment succeeded:", paymentIntent.id);
      
      const successOrder = await Order.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { 
          paymentStatus: "paid",
          status: "confirmed"
        },
        { new: true }
      );

      if (successOrder) {
        console.log(`✅ Order ${successOrder.orderNumber} confirmed`);
      }
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      console.log("❌ Payment failed:", failedPayment.id);
      
      const failedOrder = await Order.findOneAndUpdate(
        { stripePaymentIntentId: failedPayment.id },
        { 
          paymentStatus: "failed",
          status: "cancelled"
        },
        { new: true }
      );

      // Restore stock
      if (failedOrder) {
        for (const item of failedOrder.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity } }
          );
        }
        console.log(`❌ Order ${failedOrder.orderNumber} cancelled and stock restored`);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Public routes
router.get("/config", getStripeConfig);
router.post("/create-payment-intent", createPaymentIntent);
router.get("/payment-status/:paymentIntentId", getPaymentStatus);
router.get("/test-connection", testStripeConnection);

// Admin routes
router.post("/refund", protectAdmin, processRefund);

export default router;