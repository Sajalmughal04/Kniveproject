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

// ---------------------- CORS CONFIG ----------------------
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL || "https://kniveproject-yo2q.vercel.app"]
        : [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
          ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---------------------- WEBHOOK (RAW BODY) ----------------------
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    req.url = "/webhook";
    paymentRoutes(req, res, next);
  }
);

// ---------------------- BODY PARSERS ----------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------- LOGGER (DEV ONLY) ----------------------
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ---------------------- LOCAL STATIC FILES ----------------------
if (
  process.env.USE_LOCAL_STORAGE === "true" &&
  process.env.NODE_ENV !== "production"
) {
  app.use(
    "/uploads",
    express.static(path.join(__dirname, "..", process.env.UPLOADS_DIR || "uploads"))
  );
}

// ---------------------- DEFAULT ADMIN ----------------------
const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@knives.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (!existingAdmin) {
      console.log("📝 Creating default admin...");
      await Admin.create({
        name: "Default Admin",
        email: adminEmail,
        password: adminPassword,
      });
      console.log("✅ Default admin created.");
    } else {
      console.log("ℹ️ Admin already exists");
    }
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  }
};

// ---------------------- ROOT ROUTE ----------------------
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Server is running!",
    timestamp: new Date().toISOString(),
  });
});

// ---------------------- ROUTES ----------------------
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payment", paymentRoutes);

// ---------------------- 404 HANDLER ----------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ---------------------- ERROR HANDLER ----------------------
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ---------------------- MONGODB CONNECTION (SERVERLESS SAFE) ----------------------
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB Connected");
    isConnected = true;

    await createDefaultAdmin();
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    isConnected = false;
  }
};

connectDB();

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB Disconnected");
  isConnected = false;
});

// ---------------------- LOCAL ONLY SERVER ----------------------
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Local server running at http://localhost:${PORT}`)
  );
}

// ---------------------- EXPORT FOR VERCEL ----------------------
export default app;
