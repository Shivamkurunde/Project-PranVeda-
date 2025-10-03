/**
 * User Management Controller
 * Handles user profile management and dashboard data
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/middleware/auth.middleware.js';
import { UserService } from './user.service.js';
import { logger, logBusinessEvent } from '../../middleware/logger.js';
import { APIError, NotFoundError, ValidationError } from '../../middleware/errorHandler.js';

/**
 * User controller class
 */
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get user profile with preferences
   */
  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const profile = await this.userService.getUserProfile(userId);

      if (!profile) {
        throw new NotFoundError('User profile');
      }

      res.json({
        success: true,
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user profile
   */
  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { display_name, avatar_url, bio } = req.body;

      const updatedProfile = await this.userService.updateUserProfile(userId, {
        display_name,
        avatar_url,
        bio,
      });

      logBusinessEvent('profile_updated', userId, {
        display_name: updatedProfile.display_name,
        avatar_url: updatedProfile.avatar_url,
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          profile: updatedProfile,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user preferences
   */
  updatePreferences = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { preferred_language, wellness_goals, experience_level, notifications } = req.body;

      const updatedProfile = await this.userService.updateUserPreferences(userId, {
        preferred_language,
        wellness_goals,
        experience_level,
        notifications,
      });

      logBusinessEvent('preferences_updated', userId, {
        preferred_language: updatedProfile.preferred_language,
        wellness_goals: updatedProfile.wellness_goals,
        experience_level: updatedProfile.experience_level,
      });

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: {
          profile: updatedProfile,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete user profile (soft delete)
   */
  deleteProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { confirm_deletion } = req.body;

      if (!confirm_deletion) {
        throw new ValidationError('Deletion confirmation is required');
      }

      await this.userService.deleteUserProfile(userId);

      logBusinessEvent('profile_deleted', userId);

      res.json({
        success: true,
        message: 'Profile deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get personalized dashboard data
   */
  getDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const dashboardData = await this.userService.getDashboardData(userId);

      res.json({
        success: true,
        data: {
          dashboard: dashboardData,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload user avatar
   */
  uploadAvatar = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      
      if (!req.file) {
        throw new ValidationError('Avatar file is required');
      }

      const avatarUrl = await this.userService.uploadAvatar(userId, req.file);

      logBusinessEvent('avatar_uploaded', userId, {
        avatarUrl,
        fileSize: req.file.size,
      });

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          avatar_url: avatarUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user activity feed
   */
  getActivityFeed = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { page = 1, limit = 20 } = req.query;

      const activityFeed = await this.userService.getActivityFeed(
        userId,
        Number(page),
        Number(limit)
      );

      res.json({
        success: true,
        data: {
          activities: activityFeed.activities,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: activityFeed.total,
            hasMore: activityFeed.hasMore,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user goals and progress
   */
  getGoals = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const goals = await this.userService.getUserGoals(userId);

      res.json({
        success: true,
        data: {
          goals,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user goals
   */
  updateGoals = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { goals } = req.body;

      const updatedGoals = await this.userService.updateUserGoals(userId, goals);

      logBusinessEvent('goals_updated', userId, { goals: updatedGoals });

      res.json({
        success: true,
        message: 'Goals updated successfully',
        data: {
          goals: updatedGoals,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user privacy settings
   */
  getPrivacySettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const privacySettings = await this.userService.getPrivacySettings(userId);

      res.json({
        success: true,
        data: {
          privacy: privacySettings,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user privacy settings
   */
  updatePrivacySettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { profile_visibility, data_sharing, marketing_emails } = req.body;

      const updatedSettings = await this.userService.updatePrivacySettings(userId, {
        profile_visibility,
        data_sharing,
        marketing_emails,
      });

      logBusinessEvent('privacy_settings_updated', userId, updatedSettings);

      res.json({
        success: true,
        message: 'Privacy settings updated successfully',
        data: {
          privacy: updatedSettings,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Export user data
   */
  exportData = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { format = 'json' } = req.query;

      const exportData = await this.userService.exportUserData(userId, format as string);

      logBusinessEvent('data_exported', userId, { format });

      res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="pranaveda-data-${userId}.${format}"`);
      
      res.send(exportData);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user notifications
   */
  getNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { unread_only = false, page = 1, limit = 20 } = req.query;

      const notifications = await this.userService.getNotifications(
        userId,
        Boolean(unread_only),
        Number(page),
        Number(limit)
      );

      res.json({
        success: true,
        data: {
          notifications: notifications.notifications,
          unread_count: notifications.unreadCount,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: notifications.total,
            hasMore: notifications.hasMore,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark notification as read
   */
  markNotificationRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { notificationId } = req.params;

      await this.userService.markNotificationRead(userId, notificationId);

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  };
}

// Export controller instance
export const userController = new UserController();

