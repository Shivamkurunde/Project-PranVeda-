/**
 * Authentication Routes
 * API endpoints for user authentication and profile management
 */

import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware.js';
import { authRateLimit, strictRateLimit } from '../../../middleware/rateLimiter.js';
import { validateRequest, authSchemas } from '../../../middleware/validator.js';
import { asyncHandler } from '../../../middleware/errorHandler.js';
import { z } from 'zod';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Create user profile after Firebase signup
 * @access  Private (requires Firebase token)
 */
router.post(
  '/register',
  authRateLimit,
  authenticateToken,
  validateRequest({ body: authSchemas.register.omit({ email: true, password: true }) }),
  asyncHandler(authController.register)
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user information
 * @access  Private (requires Firebase token)
 */
router.get(
  '/me',
  authenticateToken,
  asyncHandler(authController.me)
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh Firebase token
 * @access  Private (requires Firebase token)
 */
router.post(
  '/refresh',
  authRateLimit,
  authenticateToken,
  asyncHandler(authController.refresh)
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token invalidation)
 * @access  Private (requires Firebase token)
 */
router.post(
  '/logout',
  authenticateToken,
  asyncHandler(authController.logout)
);

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify Firebase token validity
 * @access  Private (requires Firebase token)
 */
router.post(
  '/verify-token',
  authRateLimit,
  authenticateToken,
  asyncHandler(authController.verifyToken)
);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account (soft delete)
 * @access  Private (requires Firebase token + password)
 */
router.delete(
  '/account',
  strictRateLimit,
  authenticateToken,
  validateRequest({ 
    body: z.object({ 
      password: z.string().min(1, 'Password is required for account deletion') 
    }) 
  }),
  asyncHandler(authController.deleteAccount)
);

/**
 * @route   GET /api/auth/session
 * @desc    Get user session information
 * @access  Private (requires Firebase token)
 */
router.get(
  '/session',
  authenticateToken,
  asyncHandler(authController.getSession)
);

/**
 * @route   PUT /api/auth/preferences
 * @desc    Update user preferences
 * @access  Private (requires Firebase token)
 */
router.put(
  '/preferences',
  authenticateToken,
  validateRequest({ 
    body: z.object({
      display_name: z.string().min(1).max(50).optional(),
      avatar_url: z.string().url().optional(),
      preferred_language: z.string().length(2).optional(),
      wellness_goals: z.array(z.string()).max(10).optional(),
      experience_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    })
  }),
  asyncHandler(authController.updatePreferences)
);

/**
 * @route   GET /api/auth/check-user
 * @desc    Check if user exists by email
 * @access  Public
 */
router.get(
  '/check-user',
  optionalAuth,
  validateRequest({ 
    query: z.object({ 
      email: z.string().email('Valid email is required') 
    }) 
  }),
  asyncHandler(authController.checkUserExists)
);

/**
 * @route   GET /api/auth/stats
 * @desc    Get user statistics
 * @access  Private (requires Firebase token)
 */
router.get(
  '/stats',
  authenticateToken,
  asyncHandler(authController.getUserStats)
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  authRateLimit,
  validateRequest({ 
    body: z.object({ 
      email: z.string().email('Valid email is required') 
    }) 
  }),
  asyncHandler(authController.forgotPassword)
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  authRateLimit,
  validateRequest({ 
    body: z.object({
      token: z.string().min(32, 'Invalid reset token'),
      newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    })
  }),
  asyncHandler(authController.resetPassword)
);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify email address with token
 * @access  Public
 */
router.get(
  '/verify-email/:token',
  authRateLimit,
  asyncHandler(authController.verifyEmail)
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Private (requires Firebase token)
 */
router.post(
  '/resend-verification',
  authRateLimit,
  authenticateToken,
  asyncHandler(authController.resendVerification)
);

export default router;
