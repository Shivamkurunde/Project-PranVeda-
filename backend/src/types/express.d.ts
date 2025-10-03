/**
 * Express Type Definitions
 * Extended types for Express request objects
 */

import { UserProfile } from './database.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        email_verified?: boolean;
        name?: string;
        picture?: string;
      };
      userProfile?: UserProfile;
    }
  }
}

export {};
