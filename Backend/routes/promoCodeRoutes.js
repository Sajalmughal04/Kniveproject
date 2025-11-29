import express from 'express';
import {
    createPromoCode,
    validatePromoCode,
    getAllPromoCodes,
    updatePromoCode,
    deletePromoCode,
} from '../controllers/promoCodeController.js';
import { protectAdmin } from '../Middleware/authMiddleware.js';

const router = express.Router();

router.post('/validate', validatePromoCode);
router.post('/create', protectAdmin, createPromoCode);
router.get('/', protectAdmin, getAllPromoCodes);
router.put('/:id', protectAdmin, updatePromoCode);
router.delete('/:id', protectAdmin, deletePromoCode);

export default router;
