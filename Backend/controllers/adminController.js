import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// ✅ Create JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ✅ Register Admin
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Create new admin (password will be hashed automatically by pre-save hook)
    const admin = await Admin.create({ 
      name: name || "Admin", 
      email, 
      password 
    });

    // Generate token
    const token = createToken(admin._id);

    res.status(201).json({
      success: true,
      admin: { 
        id: admin._id, 
        email: admin.email, 
        name: admin.name 
      },
      token,
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    next(err);
  }
};

// ✅ Login Admin
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log("📧 Login attempt:", email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      console.log("❌ Admin not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("✅ Admin found:", admin.email);

    // Compare password
    const isPasswordMatch = await admin.comparePassword(password);

    if (!isPasswordMatch) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("✅ Login successful");

    // Generate token
    const token = createToken(admin._id);

    res.status(200).json({
      success: true,
      admin: { 
        id: admin._id, 
        email: admin.email, 
        name: admin.name 
      },
      token,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    next(err);
  }
};

// ✅ Get Admin Profile (Protected)
export const getProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      admin,
    });
  } catch (err) {
    console.error("❌ Get profile error:", err);
    next(err);
  }
};