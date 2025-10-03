/**
 * User Management Routes
 * API endpoints for user profile management and dashboard
 */

import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticateToken, requireProfile } from '../auth/middleware/auth.middleware.js';
import { uploadRateLimit } from '../../middleware/rateLimiter.js';
import { validateRequest, userProfileSchemas } from '../../middleware/validator.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { z } from 'zod';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile with preferences
 * @access  Private (requires Firebase token)
 */
router.get(
  '/profile',
  authenticateToken,
  requireProfile,
  asyncHandler(userController.getProfile)
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile (name, avatar, bio)
 * @access  Private (requires Firebase token)
 */
router.put(
  '/profile',
  authenticateToken,
  requireProfile,
  validateRequest({
    body: z.object({
      display_name: z.string().min(1).max(50).optional(),
      avatar_url: z.string().url().optional(),
      bio: z.string().max(500).optional(),
    }),
  }),
  asyncHandler(userController.updateProfile)
);

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private (requires Firebase token)
 */
router.put(
  '/preferences',
  authenticateToken,
  requireProfile,
  validateRequest({
    body: z.object({
      preferred_language: z.string().length(2).optional(),
      wellness_goals: z.array(z.string()).max(10).optional(),
      experience_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      notifications: z.object({
        email_notifications: z.boolean().optional(),
        push_notifications: z.boolean().optional(),
        meditation_reminders: z.boolean().optional(),
        workout_reminders: z.boolean().optional(),
        achievement_notifications: z.boolean().optional(),
        weekly_reports: z.boolean().optional(),
        marketing_emails: z.boolean().optional(),
      }).optional(),
    }),
  }),
  asyncHandler(userController.updatePreferences)
);

/**
 * @route   DELETE /api/users/profile
 * @desc    Delete user profile (soft delete)
 * @access  Private (requires Firebase token)
 */
router.delete(
  '/profile',
  authenticateToken,
  requireProfile,
  validateRequest({
    body: z.object({
      confirm_deletion: z.boolean().refine(val => val === true, {
        message: 'Deletion confirmation is required',
      }),
    }),
  }),
  asyncHandler(userController.deleteProfile)
);

/**
 * @route   GET /api/users/dashboard
 * @desc    Get personalized dashboard data
 * @access  Private (requires Firebase token)
 */
router.get(
  '/dashboard',
  authenticateToken,
  requireProfile,
  asyncHandler(userController.getDashboard)
);

/**
 * @route   POST /api/users/avatar
 * @desc    Upload user avatar
 * @access  Private (requires Firebase token)
 */
router.post(
  '/avatar',
  uploadRateLimit,
  authenticateToken,
  requireProfile,
  upload.single('avatar'),
  asyncHandler(userController.uploadAvatar)
);

/**
 * @route   GET /api/users/activity
 * @desc    Get user activity feed
 * @access  Private (requires Firebase token)
 */
router.get(
  '/activity',
  authenticateToken,
  requireProfile,
  validateRequest({
    query: z.object({
      page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
      limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).default('20'),
    }),
  }),
  asyncHandler(userController.getActivityFeed)
);

/**
 * @route   GET /api/users/goals
 * @desc    Get user goals and progress
 * @access  Private (requires Firebase token)
 */
router.get(
  '/goals',
  authenticateToken,
  requireProfile,
  asyncHandler(userController.getGoals)
);

/**
 * @route   PUT /api/users/goals
 * @desc    Update user goals
 * @access  Private (requires Firebase token)
 */
router.put(
  '/goals',
  authenticateToken,
  requireProfile,
  validateRequest({
    body: z.object({
      goals: z.array(z.object({
        id: z.string(),
        type: z.enum(['meditation', 'workout', 'streak', 'achievement']),
        title: z.string().min(1).max(100),
        description: z.string().max(500),
        target_value: z.number().min(1),
        current_value: z.number().min(0),
        deadline: z.string().datetime().optional(),
        status: z.enum(['active', 'completed', 'paused']),
      })),
    }),
  }),
  asyncHandler(userController.updateGoals)
);

/**
 * @route   GET /api/users/privacy
 * @desc    Get user privacy settings
 * @access  Private (requires Firebase token)
 */
router.get(
  '/privacy',
  authenticateToken,
  requireProfile,
  asyncHandler(userController.getPrivacySettings)
);

/**
 * @route   PUT /api/users/privacy
 * @desc    Update user privacy settings
 * @access  Private (requires Firebase token)
 */
router.put(
  '/privacy',
  authenticateToken,
  requireProfile,
  validateRequest({
    body: z.object({
      profile_visibility: z.enum(['public', 'private', 'friends']).optional(),
      data_sharing: z.boolean().optional(),
      analytics_sharing: z.boolean().optional(),
      leaderboard_participation: z.boolean().optional(),
    }),
  }),
  asyncHandler(userController.updatePrivacySettings)
);

/**
 * @route   GET /api/users/export
 * @desc    Export user data
 * @access  Private (requires Firebase token)
 */
router.get(
  '/export',
  authenticateToken,
  requireProfile,
  validateRequest({
    query: z.object({
      format: z.enum(['json', 'csv']).default('json'),
    }),
  }),
  asyncHandler(userController.exportData)
);

/**
 * @route   GET /api/users/notifications
 * @desc    Get user notifications
 * @access  Private (requires Firebase token)
 */
router.get(
  '/notifications',
  authenticateToken,
  requireProfile,
  validateRequest({
    query: z.object({
      unread_only: z.string().transform(val => val === 'true').optional(),
      page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
      limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).default('20'),
    }),
  }),
  asyncHandler(userController.getNotifications)
);

/**
 * @route   PUT /api/users/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private (requires Firebase token)
 */
router.put(
  '/notifications/:notificationId/read',
  authenticateToken,
  requireProfile,
  validateRequest({
    params: z.object({
      notificationId: z.string().uuid(),
    }),
  }),
  asyncHandler(userController.markNotificationRead)
);

export default router;

