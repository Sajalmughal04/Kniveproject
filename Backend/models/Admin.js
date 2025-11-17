import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const AdminSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      default: "Admin" 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      default: "admin" 
    }
  },
  { timestamps: true }
);

// ✅ Hash password before saving
AdminSchema.pre("save", async function (next) {
  // Agar password modify nahi hua to skip karo
  if (!this.isModified("password")) {
    return next();
  }

  try {
    console.log("🔒 Hashing password with bcryptjs...");
    
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    
    console.log("✅ Password hashed successfully");
    console.log("   Hash format:", this.password.substring(0, 4));
    
    next();
  } catch (error) {
    console.error("❌ Hashing error:", error);
    next(error);
  }
});

// ✅ Method to compare passwords
AdminSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const isMatch = await bcryptjs.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    console.error("❌ Compare error:", error);
    return false;
  }
};

export default mongoose.model("Admin", AdminSchema);