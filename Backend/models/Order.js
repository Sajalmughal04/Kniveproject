import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    customerInfo: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, default: 'Pakistan' }
      }
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        productImage: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 }
      }
    ],
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['cash_on_delivery', 'card', 'bank_transfer'],
      default: 'cash_on_delivery'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    // Stripe Integration Fields
    stripePaymentIntentId: { 
      type: String, 
      default: null,
      index: true,
      sparse: true // ✅ Allows multiple null values
    },
    stripeCustomerId: { 
      type: String, 
      default: null 
    },
    stripeChargeId: { 
      type: String, 
      default: null 
    },
    // Order Details
    orderNumber: { 
      type: String, 
      unique: true, 
      sparse: true // ✅ Will be set by pre-save hook
    },
    trackingNumber: { type: String, default: null },
    customerNotes: { type: String, maxlength: 500 },
    adminNotes: { type: String, maxlength: 1000 },
    // Timestamps for status changes
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String
      }
    ]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ✅ Generate order number before saving (ONLY if not already set)
orderSchema.pre('save', async function (next) {
  try {
    // Generate order number only if it doesn't exist
    if (!this.orderNumber) {
      const count = await mongoose.model('Order').countDocuments();
      this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
    }
    
    // Add status change to history if status was modified
    if (this.isModified('status')) {
      this.statusHistory.push({
        status: this.status,
        timestamp: new Date(),
        note: this.adminNotes || `Status changed to ${this.status}`
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Indexes for better query performance
orderSchema.index({ 'customerInfo.email': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentMethod: 1 });

// Virtual for formatted order date
orderSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for order age in days
orderSchema.virtual('daysOld').get(function() {
  const now = new Date();
  const orderDate = new Date(this.createdAt);
  const diffTime = Math.abs(now - orderDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

// Method to check if order can be refunded
orderSchema.methods.canBeRefunded = function() {
  return this.paymentStatus === 'paid' && 
         ['confirmed', 'processing', 'shipped'].includes(this.status);
};

// Method to check if payment is complete
orderSchema.methods.isPaymentComplete = function() {
  return this.paymentStatus === 'paid' || 
         (this.paymentMethod === 'cash_on_delivery' && this.status === 'delivered');
};

// Static method to get order statistics
orderSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byPaymentStatus: [
          { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
        ],
        byPaymentMethod: [
          { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
        ],
        revenue: [
          { 
            $match: { 
              paymentStatus: 'paid',
              status: { $ne: 'cancelled' }
            } 
          },
          { 
            $group: { 
              _id: null, 
              total: { $sum: '$totalAmount' },
              avgOrder: { $avg: '$totalAmount' }
            } 
          }
        ]
      }
    }
  ]);

  return stats[0];
};

export default mongoose.model('Order', orderSchema);