import PromoCode from '../models/PromoCode.js';

// @desc    Create a new promo code
// @route   POST /api/promocodes/create
// @access  Private/Admin
export const createPromoCode = async (req, res) => {
    try {
        const { code, discountType, discountValue, expirationDate, usageLimit } = req.body;

        const promoCodeExists = await PromoCode.findOne({ code });

        if (promoCodeExists) {
            return res.status(400).json({ success: false, message: 'Promo code already exists' });
        }

        const promoCode = await PromoCode.create({
            code,
            discountType,
            discountValue,
            expirationDate,
            usageLimit,
        });

        res.status(201).json({
            success: true,
            data: promoCode,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Validate a promo code
// @route   POST /api/promocodes/validate
// @access  Public
export const validatePromoCode = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, message: 'Please provide a promo code' });
        }

        const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });

        if (!promo) {
            return res.status(404).json({ success: false, message: 'Invalid or inactive promo code' });
        }

        // Check expiration
        if (new Date() > new Date(promo.expirationDate)) {
            return res.status(400).json({ success: false, message: 'Promo code has expired' });
        }

        // Check usage limit
        if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
            return res.status(400).json({ success: false, message: 'Promo code usage limit reached' });
        }

        res.status(200).json({
            success: true,
            data: {
                code: promo.code,
                discountType: promo.discountType,
                discountValue: promo.discountValue,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all promo codes
// @route   GET /api/promocodes
// @access  Private/Admin
export const getAllPromoCodes = async (req, res) => {
    try {
        const promoCodes = await PromoCode.find({});
        res.status(200).json({ success: true, data: promoCodes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a promo code
// @route   PUT /api/promocodes/:id
// @access  Private/Admin
export const updatePromoCode = async (req, res) => {
    try {
        const { code, discountType, discountValue, expirationDate, usageLimit, isActive } = req.body;

        const promoCode = await PromoCode.findById(req.params.id);

        if (!promoCode) {
            return res.status(404).json({ success: false, message: 'Promo code not found' });
        }

        // Check if code is being changed and if new code already exists
        if (code && code !== promoCode.code) {
            const codeExists = await PromoCode.findOne({ code });
            if (codeExists) {
                return res.status(400).json({ success: false, message: 'Promo code already exists' });
            }
        }

        promoCode.code = code || promoCode.code;
        promoCode.discountType = discountType || promoCode.discountType;
        promoCode.discountValue = discountValue !== undefined ? discountValue : promoCode.discountValue;
        promoCode.expirationDate = expirationDate || promoCode.expirationDate;
        promoCode.usageLimit = usageLimit !== undefined ? usageLimit : promoCode.usageLimit;
        promoCode.isActive = isActive !== undefined ? isActive : promoCode.isActive;

        const updatedPromoCode = await promoCode.save();

        res.status(200).json({
            success: true,
            data: updatedPromoCode,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a promo code
// @route   DELETE /api/promocodes/:id
// @access  Private/Admin
export const deletePromoCode = async (req, res) => {
    try {
        const promoCode = await PromoCode.findById(req.params.id);

        if (!promoCode) {
            return res.status(404).json({ success: false, message: 'Promo code not found' });
        }

        await promoCode.deleteOne();
        res.status(200).json({ success: true, message: 'Promo code removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
