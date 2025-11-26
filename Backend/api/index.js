// api/index.js   ← यही file Vercel deploy करेगा

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

import productRoutes from "../routes/productRoutes.js";
import adminRoutes from "../routes/adminRoutes.js";
import orderRoutes from "../routes/orderRoutes.js";
import authRoutes from "../routes/authRoutes.js";
import contactRoutes from "../routes/contactRoutes.js";
import paymentRoutes from "../routes/paymentRoutes.js";
import categoryRoutes from "../routes/categoryRoutes.js";

dotenv.config();
const app = express();

// =============== MongoDB Connection (Vercel Safe) ===============
let conn = null;
async function connectDB() {
  if (conn) return conn;
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing");

  conn = await mongoose.connect(process.env.MONGO_URI, {
    bufferCommands: false,
  });
  console.log("MongoDB Connected");
  return conn;
}

// =============== Create Default Admin ===============
async function ensureAdmin() {
  try {
    await connectDB();
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      const hash = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin",
        email: "admin@knives.com",
        password: hash,
        role: "admin",
        phone: "1234567890",
      });
      console.log("Default admin created");
    }
  } catch (e) {
    console.log("Admin check skipped:", e.message);
  }
}

// =============== Middleware ===============
app.use(cors({
  origin: ["https://kniveproject.vercel.app", "http://localhost:3000", "http://localhost:5173"],
  credentials: true,
}));

// Webhook (raw body)
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), (req, res) => {
  paymentRoutes(req, res);
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Knives API is LIVE on Vercel!", time: new Date() });
});

// 404 & Error
app.use("*", (req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server Error" });
});

// =============== Vercel Handler ===============
export default async function handler(req, res) {
  await ensureAdmin(); // सिर्फ पहली बार admin बनाएगा
  return app(req, res);
}

// Local dev
if (process.env.NODE_ENV !== "production") {
  const PORT = 5000;
  connectDB().then(() => ensureAdmin()).then(() => {
    app.listen(PORT, () => console.log(`Local server: http://localhost:${PORT}`));
  });
}