/**
 * Authentication Controller
 * Handles user authentication, registration, and token management
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AuthService } from '../services/auth.service.js';
import { logger, logAuthEvent } from '../../../middleware/logger.js';
import { APIError, ConflictError, ValidationError } from '../../../middleware/errorHandler.js';

/**
 * Authentication controller class
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user profile after Firebase signup
   */
  register = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const { display_name, preferred_language, wellness_goals, experience_level } = req.body;
      const userId = req.user.uid;

      // Check if user profile already exists
      const existingProfile = await this.authService.getUserProfile(userId);
      if (existingProfile) {
        throw new ConflictError('User profile already exists');
      }

      // Create user profile
      const userProfile = await this.authService.createUserProfile({
        user_id: userId,
        display_name: display_name || req.user.name || null,
        avatar_url: req.user.picture || null,
        preferred_language: preferred_language || 'English',
        wellness_goals: wellness_goals || [],
        experience_level: experience_level || 'Beginner',
        email: req.user.email || null,
        role: 'user',
      });

      logAuthEvent('user_registered', userId, {
        display_name: userProfile.display_name,
        preferred_language: userProfile.preferred_language,
        experience_level: userProfile.experience_level,
      });

      res.status(201).json({
        success: true,
        message: 'User profile created successfully',
        data: {
          user: userProfile,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current authenticated user information
   */
  me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const userProfile = await this.authService.getUserProfile(userId);

      if (!userProfile) {
        // Return Firebase user data without profile
        res.json({
          success: true,
          data: {
            user: {
              uid: req.user.uid,
              email: req.user.email,
              email_verified: req.user.email_verified,
              name: req.user.name,
              picture: req.user.picture,
              profile_complete: false,
            },
          },
        });
        return;
      }

      // Return complete user data with profile
      res.json({
        success: true,
        data: {
          user: {
            uid: req.user.uid,
            email: req.user.email,
            email_verified: req.user.email_verified,
            name: req.user.name,
            picture: req.user.picture,
            profile_complete: true,
            profile: userProfile,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh Firebase token (if needed)
   */
  refresh = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      
      // Create a new custom token
      const customToken = await this.authService.createCustomToken(userId);

      logAuthEvent('token_refreshed', userId);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          custom_token: customToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout user (client-side token invalidation)
   */
  logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;

      logAuthEvent('user_logout', userId);

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify Firebase token validity
   */
  verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Invalid token', 401);
      }

      const userId = req.user.uid;
      const userProfile = await this.authService.getUserProfile(userId);

      res.json({
        success: true,
        data: {
          valid: true,
          user: {
            uid: req.user.uid,
            email: req.user.email,
            email_verified: req.user.email_verified,
            name: req.user.name,
            picture: req.user.picture,
            profile_exists: !!userProfile,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete user account (soft delete)
   */
  deleteAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { password } = req.body;

      if (!password) {
        throw new ValidationError('Password is required for account deletion');
      }

      // Verify password before deletion
      await this.authService.verifyPassword(userId, password);

      // Soft delete user profile
      await this.authService.softDeleteUserProfile(userId);

      logAuthEvent('account_deleted', userId);

      res.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user session information
   */
  getSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('No active session', 401);
      }

      const userId = req.user.uid;
      const sessionInfo = await this.authService.getSessionInfo(userId);

      res.json({
        success: true,
        data: {
          session: sessionInfo,
          user: {
            uid: req.user.uid,
            email: req.user.email,
            email_verified: req.user.email_verified,
          },
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
      const preferences = req.body;

      const updatedProfile = await this.authService.updateUserPreferences(userId, preferences);

      logAuthEvent('preferences_updated', userId, preferences);

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
   * Check if user exists
   */
  checkUserExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        throw new ValidationError('Email is required');
      }

      const exists = await this.authService.checkUserExists(email);

      res.json({
        success: true,
        data: {
          exists,
          email,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user statistics
   */
  getUserStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const stats = await this.authService.getUserStats(userId);

      res.json({
        success: true,
        data: {
          stats,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Request password reset
   */
  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ValidationError('Email is required');
      }

      // Import email service dynamically to avoid circular dependencies
      const { emailService } = await import('../services/email.service.js');
      const { getFirebaseAuth } = await import('../config/firebase.js');
      const crypto = await import('crypto');

      // Check if email service is available
      if (!emailService.isAvailable()) {
        throw new APIError('Email service is not configured. Password reset unavailable.', 503, 'SERVICE_UNAVAILABLE');
      }

      // Check if user exists
      try {
        const auth = getFirebaseAuth();
        const userRecord = await auth.getUserByEmail(email);

        // Generate secure token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Store token in database
        await this.authService.createPasswordResetToken(userRecord.uid, resetToken, expiresAt);

        // Send email
        await emailService.sendPasswordResetEmail(email, resetToken);

        logAuthEvent('password_reset_requested', userRecord.uid, { email });
      } catch (error) {
        // Don't reveal if email exists or not (security best practice)
        logger.warn('Password reset requested for non-existent email', { email });
      }

      // Always return success to prevent email enumeration
      res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset password with token
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        throw new ValidationError('Token and new password are required');
      }

      if (newPassword.length < 8) {
        throw new ValidationError('Password must be at least 8 characters long');
      }

      // Verify token and get user ID
      const userId = await this.authService.verifyPasswordResetToken(token);

      if (!userId) {
        throw new APIError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
      }

      // Import Firebase admin
      const { getFirebaseAuth } = await import('../config/firebase.js');

      // Update password in Firebase
      const auth = getFirebaseAuth();
      await auth.updateUser(userId, { password: newPassword });

      // Mark token as used
      await this.authService.markResetTokenUsed(token);

      logAuthEvent('password_reset_completed', userId);

      res.status(200).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify email with token
   */
  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.params;

      if (!token) {
        throw new ValidationError('Verification token is required');
      }

      const userId = await this.authService.verifyEmailToken(token);

      if (!userId) {
        throw new APIError('Invalid or expired verification token', 400, 'INVALID_TOKEN');
      }

      // Update email_verified in Supabase profile
      await this.authService.markEmailVerified(userId);

      // Also update in Firebase
      const { getFirebaseAuth } = await import('../config/firebase.js');
      const auth = getFirebaseAuth();
      await auth.updateUser(userId, { emailVerified: true });

      logAuthEvent('email_verified', userId);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resend email verification
   */
  resendVerification = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const email = req.user.email;

      if (!email) {
        throw new APIError('User email not found', 404);
      }

      // Import email service
      const { emailService } = await import('../services/email.service.js');
      const crypto = await import('crypto');

      // Check if email service is available
      if (!emailService.isAvailable()) {
        throw new APIError('Email service is not configured', 503, 'SERVICE_UNAVAILABLE');
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store token in database
      await this.authService.createEmailVerificationToken(userId, verificationToken, expiresAt);

      // Send verification email
      await emailService.sendEmailVerification(email, verificationToken);

      logAuthEvent('verification_email_resent', userId);

      res.json({
        success: true,
        message: 'Verification email sent successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

// Export controller instance
export const authController = new AuthController();

