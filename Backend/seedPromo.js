import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PromoCode from './models/PromoCode.js';
import connectDB from './config/db.js';

dotenv.config();

const seedPromo = async () => {
    try {
        await connectDB();

        const promoCode = {
            code: 'TEST10',
            discountType: 'percentage',
            discountValue: 10,
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            usageLimit: 100,
            isActive: true
        };

        // Check if exists
        const exists = await PromoCode.findOne({ code: promoCode.code });
        if (exists) {
            console.log('Promo code TEST10 already exists.');
        } else {
            await PromoCode.create(promoCode);
            console.log('✅ Promo code TEST10 created successfully!');
        }

        process.exit();
    } catch (error) {
        console.error('Error seeding promo:', error);
        process.exit(1);
    }
};

seedPromo();
