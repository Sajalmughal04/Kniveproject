import express from 'express';
import { sendContactEmail } from '../controllers/contactController.js';

const router = express.Router();

// POST - Send Contact Form Email
router.post('/', sendContactEmail);

// Health Check
router.get('/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK',
    message: 'Contact API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;