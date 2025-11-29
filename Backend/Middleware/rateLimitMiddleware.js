// backend/Middleware/rateLimitMiddleware.js
import rateLimit from 'express-rate-limit';

// ✅ Rate limiter for login endpoint
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        console.log('🚫 Rate limit exceeded for login:', req.ip);
        res.status(429).json({
            success: false,
            message: 'Too many login attempts. Please try again after 15 minutes.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

// ✅ Rate limiter for register endpoint
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 registration requests per hour
    message: {
        success: false,
        message: 'Too many accounts created from this IP, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.log('🚫 Rate limit exceeded for registration:', req.ip);
        res.status(429).json({
            success: false,
            message: 'Too many registration attempts. Please try again after 1 hour.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

// ✅ Rate limiter for token refresh endpoint
export const refreshTokenLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 refresh requests per 15 minutes
    message: {
        success: false,
        message: 'Too many token refresh requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.log('🚫 Rate limit exceeded for token refresh:', req.ip);
        res.status(429).json({
            success: false,
            message: 'Too many token refresh attempts. Please try again later.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

// ✅ General API rate limiter (optional, for all routes)
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});
