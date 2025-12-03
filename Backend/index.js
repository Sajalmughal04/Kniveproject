import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import promoCodeRoutes from "./routes/promoCodeRoutes.js";

dotenv.config();

const app = express();

// ⭐ CORS Configuration
app.use(cors({
  origin: [
    "https://kniveproject.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ⭐ IMPORTANT: Webhook MUST be before body parser
app.use("/api/payment/webhook",
  express.raw({ type: "application/json" }),
  paymentRoutes
);

// Body Parser (after webhook)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create Default Admin
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('✅ Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await User.create({
      name: 'Admin',
      email: 'admin@knives.com',
      password: hashedPassword,
      phone: '1234567890',
      role: 'admin',
      address: 'Admin Office',
      bio: 'System Administrator'
    });

    console.log('✅ Default Admin Created');
  } catch (error) {
    console.error('❌ Admin Creation Failed:', error.message);
  }
};

// Root Route
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Knives Backend API",
    version: "1.0.0",
    status: "active",
    endpoints: {
      products: "/api/products",
      categories: "/api/categories",
      admin: "/api/admin",
      orders: "/api/orders",
      auth: "/api/auth",
      contact: "/api/contact",
      payment: "/api/payment",
      promocodes: "/api/promocodes"
    }
  });
});

// ⭐ Test endpoint to verify routes work
app.get("/api/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "API routes are working!",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/promocodes", promoCodeRoutes);

// 404 Handler
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: [
      "/api/products",
      "/api/categories",
      "/api/orders",
      "/api/auth",
      "/api/contact",
      "/api/payment",
      "/api/admin",
      "/api/promocodes"
    ]
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  console.error("Stack:", err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ⭐⭐⭐ CRITICAL FIX: Single DB connection instance
let isConnected = false;

const connectOnce = async () => {
  if (isConnected) {
    console.log('♻️ Using existing DB connection');
    return;
  }
  
  try {
    await connectDB();
    isConnected = true;
    console.log('✅ Database connected');
    
    // Create admin only once after connection
    await createDefaultAdmin();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

// ⭐⭐⭐ VERCEL SERVERLESS EXPORT
export default async (req, res) => {
  try {
    // Connect to DB once
    await connectOnce();
    
    // Let Express handle the request
    return app(req, res);
    
  } catch (error) {
    console.error('❌ Handler Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server initialization failed',
      error: error.message
    });
  }
};

// Local Development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  
  connectDB()
    .then(() => {
      createDefaultAdmin();
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    })
    .catch((error) => {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    });
}