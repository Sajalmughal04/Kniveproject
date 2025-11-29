import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Promo code is required'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: [true, 'Discount type is required'],
    },
    discountValue: {
        type: Number,
        required: [true, 'Discount value is required'],
    },
    expirationDate: {
        type: Date,
        required: [true, 'Expiration date is required'],
    },
    usageLimit: {
        type: Number,
        default: null, // null means unlimited
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

export default PromoCode;
