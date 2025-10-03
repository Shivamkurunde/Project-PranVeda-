/**
 * Firebase Admin SDK Configuration
 * Handles Firebase authentication and admin operations
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { env } from './env.js';

/**
 * Firebase Admin App instance
 */
let firebaseApp: App | null = null;

/**
 * Firebase Auth instance
 */
let firebaseAuth: Auth | null = null;

/**
 * Firebase Firestore instance
 */
let firebaseFirestore: Firestore | null = null;

/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebase(): App {
  try {
    // Check if Firebase is already initialized
    if (getApps().length > 0) {
      firebaseApp = getApps()[0];
      firebaseAuth = getAuth(firebaseApp);
      firebaseFirestore = getFirestore(firebaseApp);
      return firebaseApp;
    }

    // Parse the private key (handle newlines in environment variable)
    const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    // Initialize Firebase Admin SDK
    firebaseApp = initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        privateKey,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
      }),
      projectId: env.FIREBASE_PROJECT_ID,
    });

    // Initialize services
    firebaseAuth = getAuth(firebaseApp);
    firebaseFirestore = getFirestore(firebaseApp);

    console.log('🔥 Firebase Admin SDK initialized successfully');
    console.log(`  - Project ID: ${env.FIREBASE_PROJECT_ID}`);
    console.log(`  - Client Email: ${env.FIREBASE_CLIENT_EMAIL}`);

    return firebaseApp;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw new Error('Failed to initialize Firebase Admin SDK');
  }
}

/**
 * Get Firebase Auth instance
 */
export function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth not initialized. Call initializeFirebase() first.');
  }
  return firebaseAuth;
}

/**
 * Get Firebase Firestore instance
 */
export function getFirebaseFirestore(): Firestore {
  if (!firebaseFirestore) {
    throw new Error('Firebase Firestore not initialized. Call initializeFirebase() first.');
  }
  return firebaseFirestore;
}

/**
 * Get Firebase App instance
 */
export function getFirebaseApp(): App {
  if (!firebaseApp) {
    throw new Error('Firebase App not initialized. Call initializeFirebase() first.');
  }
  return firebaseApp;
}

/**
 * Verify Firebase ID token
 */
export async function verifyFirebaseToken(idToken: string): Promise<{
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}> {
  try {
    const auth = getFirebaseAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    throw new Error('Invalid Firebase token');
  }
}

/**
 * Create custom token for user
 */
export async function createCustomToken(uid: string, additionalClaims?: Record<string, any>): Promise<string> {
  try {
    const auth = getFirebaseAuth();
    return await auth.createCustomToken(uid, additionalClaims);
  } catch (error) {
    console.error('Custom token creation failed:', error);
    throw new Error('Failed to create custom token');
  }
}

/**
 * Get user by UID
 */
export async function getFirebaseUser(uid: string) {
  try {
    const auth = getFirebaseAuth();
    return await auth.getUser(uid);
  } catch (error) {
    console.error('Failed to get Firebase user:', error);
    throw new Error('User not found');
  }
}

/**
 * Update user claims
 */
export async function updateUserClaims(uid: string, claims: Record<string, any>): Promise<void> {
  try {
    const auth = getFirebaseAuth();
    await auth.setCustomUserClaims(uid, claims);
  } catch (error) {
    console.error('Failed to update user claims:', error);
    throw new Error('Failed to update user claims');
  }
}

/**
 * Delete user account
 */
export async function deleteFirebaseUser(uid: string): Promise<void> {
  try {
    const auth = getFirebaseAuth();
    await auth.deleteUser(uid);
  } catch (error) {
    console.error('Failed to delete Firebase user:', error);
    throw new Error('Failed to delete user');
  }
}

/**
 * List users with pagination
 */
export async function listFirebaseUsers(maxResults: number = 1000, pageToken?: string) {
  try {
    const auth = getFirebaseAuth();
    return await auth.listUsers(maxResults, pageToken);
  } catch (error) {
    console.error('Failed to list Firebase users:', error);
    throw new Error('Failed to list users');
  }
}

// Initialize Firebase on module load
if (!firebaseApp) {
  initializeFirebase();
}

