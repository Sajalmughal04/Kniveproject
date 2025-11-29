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

// ⭐ CORS Configuration - PATCH METHOD ADDED
app.use(cors({
  origin: [
    "https://kniveproject.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // ⭐ PATCH ADDED
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Webhook route (before JSON parser)
app.post("/api/payment/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    req.url = '/webhook';
    paymentRoutes(req, res, next);
  }
);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create Default Admin
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) return;

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
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// Connect DB and create admin
connectDB().then(() => {
  createDefaultAdmin();
});

// Vercel Export
export default async (req, res) => {
  await connectDB();
  return app(req, res);
};

// Local Development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}