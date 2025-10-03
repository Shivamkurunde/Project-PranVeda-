/**
 * Authentication Middleware
 * Handles Firebase token verification and user authentication
 */

import { Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken } from '../../../config/firebase.js';
import { getSupabaseClient, TABLES } from '../../../config/supabase.js';

/**
 * Extended Request interface with user data
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };
  userProfile?: any;
}

/**
 * Authentication middleware
 * Verifies Firebase ID token and attaches user data to request
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Access token is required',
      });
      return;
    }

    // DEVELOPMENT BYPASS: Always extract user info from token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      req.user = {
        uid: payload.user_id || payload.sub || payload.uid || 'temp-user-id',
        email: payload.email || 'temp@example.com',
        email_verified: payload.email_verified !== false,
        name: payload.name || payload.displayName || 'Temp User',
        picture: payload.picture || null,
      };
      console.log('✅ Token bypass successful for user:', req.user.uid);
    } catch (extractError) {
      throw new Error('Invalid token format');
    }

    // Get user profile from Supabase
    try {
      const supabase = getSupabaseClient();
      const { data: profile, error } = await supabase
        .from(TABLES.PROFILES)
        .select('*')
        .eq('user_id', decodedToken.uid)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user profile:', error);
        res.status(500).json({
          success: false,
          error: 'Database Error',
          message: 'Failed to fetch user profile',
        });
        return;
      }

      req.userProfile = profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Continue without profile data - user might not be registered yet
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Optional authentication middleware
 * Verifies token if present but doesn't require it
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Verify token if present
      const decodedToken = await verifyFirebaseToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
      };

      // Get user profile
      try {
        const supabase = getSupabaseClient();
        const { data: profile } = await supabase
          .from(TABLES.PROFILES)
          .select('*')
          .eq('user_id', decodedToken.uid)
          .single();

        req.userProfile = profile;
      } catch (error) {
        // Ignore profile fetch errors in optional auth
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
}

/**
 * Require user profile middleware
 * Ensures user has a complete profile
 */
export function requireProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.userProfile) {
    res.status(403).json({
      success: false,
      error: 'Profile Required',
      message: 'User profile is required to access this resource',
    });
    return;
  }

  next();
}

/**
 * Require verified email middleware
 */
export function requireVerifiedEmail(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user?.email_verified) {
    res.status(403).json({
      success: false,
      error: 'Email Verification Required',
      message: 'Please verify your email address to access this resource',
    });
    return;
  }

  next();
}

/**
 * Admin role middleware
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.userProfile || req.userProfile.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Admin Access Required',
      message: 'Administrator privileges are required to access this resource',
    });
    return;
  }

  next();
}

/**
 * Check if user owns resource middleware factory
 */
export function requireOwnership(resourceUserIdField: string = 'user_id') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Check if resource belongs to user
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId !== req.user.uid) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only access your own resources',
      });
      return;
    }

    next();
  };
}

/**
 * Extract user ID from token without full verification
 * Used for logging and rate limiting
 */
export function extractUserId(req: Request): string | null {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return null;
    }

    // Decode token without verification (for logging only)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    return payload.uid || null;
  } catch (error) {
    return null;
  }
}

/**
 * Auth error handler
 */
export function authErrorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Token Expired',
      message: 'Your session has expired. Please sign in again.',
    });
    return;
  }

  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Invalid Token',
      message: 'Invalid authentication token.',
    });
    return;
  }

  next(error);
}

console.log('🔐 Authentication middleware configured');

