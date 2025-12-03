import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      // ✅ FIXED - Ab ye ProductModal ke categories match karenge
      enum: [
        "kitchen knives",
        "swords",
        "axes",
        "hunting knives",
        "folding knives",
        "raw materials"
      ],
      lowercase: true,  // Ye automatically lowercase kar dega
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    images: [
      {
        url: {
          type: String,
        },
        alt: {
          type: String,
          default: "",
        },
      },
    ],
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    
    // ⭐⭐⭐ DISCOUNT FIELDS ⭐⭐⭐
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'none'],
      default: 'none',
      lowercase: true,
      trim: true,
    },
    discountValue: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: function(value) {
          if (this.discountType === 'none') return true;
          if (this.discountType === 'percentage' && value > 100) {
            return false;
          }
          if (this.discountType === 'fixed' && value > this.price) {
            return false;
          }
          return true;
        },
        message: 'Invalid discount value for the selected discount type'
      }
    },
    discountedPrice: {
      type: Number,
      default: 0,
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ⭐ Pre-save hook
ProductSchema.pre("save", function (next) {
  console.log('🔄 PRE-SAVE HOOK TRIGGERED for product:', this.title);
  console.log('📊 Category:', this.category);
  console.log('📊 Discount data:', {
    type: this.discountType,
    value: this.discountValue,
    price: this.price
  });
  
  // Generate slug if title is modified
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    console.log('🔤 Generated slug:', this.slug);
  }
  
  // Calculate discounted price
  if (this.isModified("price") || this.isModified("discountValue") || this.isModified("discountType")) {
    console.log('💰 Recalculating discounted price...');
    
    if (!['percentage', 'fixed', 'none'].includes(this.discountType)) {
      this.discountType = 'none';
      this.discountValue = 0;
    }
    
    if (isNaN(this.discountValue) || this.discountValue < 0) {
      this.discountValue = 0;
    }
    
    if (this.discountType === 'percentage' && this.discountValue > 0) {
      this.discountedPrice = this.price - (this.price * this.discountValue / 100);
      console.log(`   Percentage: ${this.discountValue}% off → Rs. ${this.discountedPrice}`);
    } else if (this.discountType === 'fixed' && this.discountValue > 0) {
      this.discountedPrice = Math.max(0, this.price - this.discountValue);
      console.log(`   Fixed: Rs. ${this.discountValue} off → Rs. ${this.discountedPrice}`);
    } else {
      this.discountedPrice = this.price;
      console.log(`   No discount → Rs. ${this.discountedPrice}`);
    }
  }
  
  console.log('✅ Pre-save hook completed');
  next();
});

// Virtuals remain same
ProductSchema.virtual('finalPrice').get(function() {
  if (this.discountType === 'percentage' && this.discountValue > 0) {
    return this.price - (this.price * this.discountValue / 100);
  } else if (this.discountType === 'fixed' && this.discountValue > 0) {
    return Math.max(0, this.price - this.discountValue);
  }
  return this.price;
});

ProductSchema.virtual('hasDiscount').get(function() {
  return this.discountValue > 0 && this.discountType !== 'none';
});

ProductSchema.virtual('savings').get(function() {
  if (this.hasDiscount) {
    return this.price - this.finalPrice;
  }
  return 0;
});

ProductSchema.methods.applyDiscount = function(type, value) {
  console.log(`🏷️ Applying discount: ${type} - ${value}`);
  this.discountType = type;
  this.discountValue = value;
  return this.save();
};

ProductSchema.methods.removeDiscount = function() {
  console.log('🚫 Removing discount');
  this.discountType = 'none';
  this.discountValue = 0;
  this.discountedPrice = this.price;
  return this.save();
};

export default mongoose.model("Product", ProductSchema);