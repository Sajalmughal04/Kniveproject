import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Admin from "../Backend/models/Admin.js";
import productRoutes from "../Backend/routes/productRoutes.js";
import adminRoutes from "../Backend/routes/adminRoutes.js";
import orderRoutes from "../Backend/routes/orderRoutes.js";
import authRoutes from "../Backend/routes/authRoutes.js";
import contactRoutes from "../Backend/routes/contactRoutes.js";
import paymentRoutes from "../Backend/routes/paymentRoutes.js";
import categoryRoutes from "../Backend/routes/categoryRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS Configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || "https://kniveproject-yo2q.vercel.app/"] 
    : ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ FIX: Webhook route with raw body parser (SPECIFIC PATH)
app.post("/api/payment/webhook", 
  express.raw({ type: "application/json" }), 
  (req, res, next) => {
    // Forward to payment routes handler
    req.url = '/webhook';
    paymentRoutes(req, res, next);
  }
);

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger Middleware (Only in Development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      body: req.body,
      headers: req.headers.authorization ? 'Token present' : 'No token'
    });
    next();
  });
}

// Static Files for Uploads (Local development only)
// ⚠️ WARNING: Vercel pe files persist nahi hongi, cloud storage use karo
if (process.env.USE_LOCAL_STORAGE === "true" && process.env.NODE_ENV !== 'production') {
  app.use("/uploads", express.static(path.join(__dirname, "..", process.env.UPLOADS_DIR || "uploads")));
}

// Create Default Admin
const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@knives.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      console.log("\n📝 Creating default admin...");
      const admin = await Admin.create({ 
        name: "Default Admin", 
        email: adminEmail, 
        password: adminPassword 
      });
      console.log("✅ Default admin created:", admin.email);
      const testMatch = await admin.comparePassword(adminPassword);
      console.log("🔍 Password test:", testMatch ? "✅ PASS" : "❌ FAIL");
    } else {
      console.log("✅ Admin already exists:", existingAdmin.email);
    }
  } catch (error) {
    console.error("❌ Error creating default admin:", error.message);
  }
};

// Helper function to log endpoints (only in development)
const logEndpoints = () => {
  if (process.env.NODE_ENV === 'development' && process.env.SHOW_ENDPOINTS === 'true') {
    console.log(`\n📦 Available Endpoints:`);
    console.log(`   - Products: /api/products`);
    console.log(`   - Categories: /api/categories`);
    console.log(`   - Admin: /api/admin`);
    console.log(`   - Orders: /api/orders`);
    console.log(`   - Auth: /api/auth`);
    console.log(`   - Contact: /api/contact`);
    console.log(`   - Payment: /api/payment\n`);
    console.log(`🔐 Authentication Routes:`);
    console.log(`   - POST /api/auth/register - Register new user`);
    console.log(`   - POST /api/auth/login - Login user`);
    console.log(`   - GET /api/auth/me - Get current user (Protected)`);
    console.log(`   - PUT /api/auth/update - Update profile (Protected)`);
    console.log(`   - PUT /api/auth/change-password - Change password (Protected)`);
    console.log(`   - POST /api/auth/logout - Logout user (Protected)`);
    console.log(`   - DELETE /api/auth/delete-account - Delete account (Protected)\n`);
    console.log(`📂 Category Routes:`);
    console.log(`   - GET /api/categories - Get all categories`);
    console.log(`   - GET /api/categories/:slug - Get category by slug`);
    console.log(`   - POST /api/categories - Create category (Admin)`);
    console.log(`   - PUT /api/categories/:id - Update category (Admin)`);
    console.log(`   - DELETE /api/categories/:id - Delete category (Admin)\n`);
    console.log(`💳 Payment Routes:`);
    console.log(`   - POST /api/payment/create-payment-intent - Create payment`);
    console.log(`   - POST /api/payment/webhook - Stripe webhook`);
    console.log(`   - GET /api/payment/payment-status/:id - Check payment status`);
    console.log(`   - POST /api/payment/refund - Refund payment`);
    console.log(`   - GET /api/payment/config - Get publishable key\n`);
  }
};

// Root Route
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 Server is running!", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: { 
      products: "/api/products",
      categories: "/api/categories",
      admin: "/api/admin", 
      orders: "/api/orders",
      auth: "/api/auth",
      contact: "/api/contact",
      payment: "/api/payment"
    }
  });
});

// ✅ API Routes (Body parser KE BAAD, sahi order mein)
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payment", paymentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.path} not found` 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || "Internal Server Error" 
  });
});

// ✅ MongoDB Connection for Serverless (Connection Pooling)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }
  
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    await mongoose.connect(process.env.MONGO_URI, options);
    isConnected = true;
    console.log("✅ MongoDB connected");
    
    // Create default admin only once
    await createDefaultAdmin();
    
    // Log endpoints in development
    if (process.env.NODE_ENV === 'development') {
      logEndpoints();
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    isConnected = false;
    throw error;
  }
};

// Handle MongoDB connection for serverless
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
  isConnected = false;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
  isConnected = false;
});

// Connect to database
connectDB().catch(err => {
  console.error("Failed to connect to MongoDB:", err);
});

// ✅ FOR LOCAL DEVELOPMENT: Start server if not in Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}\n`);
  });
}

// ✅ Export app for Vercel serverless functions
export default app;