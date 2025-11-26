import Stripe from "stripe";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get Stripe publishable key
export const getStripeConfig = (req, res) => {
  res.json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
};

// Create Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { items, customerInfo, shippingCost = 0, tax = 0 } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart items are required"
      });
    }

    if (!customerInfo || !customerInfo.email || !customerInfo.name) {
      return res.status(400).json({
        success: false,
        message: "Customer information is required"
      });
    }

    // Calculate total and verify products
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title || product.name}. Available: ${product.stock}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        productName: product.title || product.name,
        productImage: product.images?.[0] || product.image || "",
        quantity: item.quantity,
        price: product.price
      });
    }

    const totalAmount = subtotal + shippingCost + tax;

    // Create order
    const order = await Order.create({
      customerInfo,
      items: orderItems,
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      paymentMethod: "card",
      paymentStatus: "pending",
      status: "pending"
    });

    // Deduct stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerEmail: customerInfo.email
      },
      description: `Order ${order.orderNumber}`,
      receipt_email: customerInfo.email
    });

    // Update order with payment intent ID
    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    console.log(`✅ Payment Intent created for Order ${order.orderNumber}`);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
      orderNumber: order.orderNumber,
      amount: totalAmount
    });

  } catch (error) {
    console.error("❌ Payment Intent Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment intent",
      error: error.message
    });
  }
};

// Check Payment Status
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId })
      .populate('items.product');

    res.json({
      success: true,
      status: paymentIntent.status,
      order: order ? {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        items: order.items
      } : null
    });

  } catch (error) {
    console.error("❌ Payment Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payment status",
      error: error.message
    });
  }
};

// Process Refund (Admin only)
export const processRefund = async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Payment Intent ID is required"
      });
    }

    const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason || "requested_by_customer"
    });

    // Update order status
    order.paymentStatus = "refunded";
    order.status = "cancelled";
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    console.log(`✅ Refund processed for Order ${order.orderNumber}`);

    res.json({
      success: true,
      message: "Refund processed successfully",
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });

  } catch (error) {
    console.error("❌ Refund Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process refund",
      error: error.message
    });
  }
};

// Test Stripe Connection
export const testStripeConnection = async (req, res) => {
  try {
    const balance = await stripe.balance.retrieve();
    res.json({
      success: true,
      message: "Stripe connection successful",
      currency: balance.available[0]?.currency || "usd",
      mode: process.env.STRIPE_SECRET_KEY.includes('_test_') ? 'test' : 'live'
    });
  } catch (error) {
    console.error("❌ Stripe connection test failed:", error);
    res.status(500).json({
      success: false,
      message: "Stripe connection failed",
      error: error.message
    });
  }
};