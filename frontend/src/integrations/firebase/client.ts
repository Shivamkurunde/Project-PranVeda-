// Firebase client configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { 
  firebaseApiKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId,
  firebaseMeasurementId
} from '@/config/env';

// Validate Firebase configuration before initialization
const validateFirebaseConfig = () => {
  const requiredVars = {
    apiKey: firebaseApiKey,
    authDomain: firebaseAuthDomain,
    projectId: firebaseProjectId,
    storageBucket: firebaseStorageBucket,
    messagingSenderId: firebaseMessagingSenderId,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('❌ Missing Firebase environment variables:', missingVars);
    throw new Error(`Firebase configuration incomplete: ${missingVars.join(', ')}`);
  }

  // Log configuration status (without exposing sensitive data)
  console.log('✅ Firebase configuration loaded:', {
    apiKey: firebaseApiKey ? '***' + firebaseApiKey.slice(-4) : 'missing',
    authDomain: firebaseAuthDomain,
    projectId: firebaseProjectId,
    storageBucket: firebaseStorageBucket,
    messagingSenderId: firebaseMessagingSenderId ? '***' + firebaseMessagingSenderId.slice(-4) : 'missing',
    appId: firebaseAppId ? '***' + firebaseAppId.slice(-6) : 'not set',
  });

  return requiredVars;
};

// Validate configuration
validateFirebaseConfig();

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
  measurementId: firebaseMeasurementId
};

// Initialize Firebase
console.log('🔥 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
console.log('✅ Firebase initialized successfully');

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics only if valid config exists (not placeholders)
const hasValidAnalyticsConfig = 
  firebaseAppId && 
  !firebaseAppId.includes('123456789012') && 
  !firebaseAppId.includes('abcdef') &&
  firebaseMeasurementId && 
  !firebaseMeasurementId.includes('XXXX');

export const analytics = typeof window !== 'undefined' && hasValidAnalyticsConfig 
  ? getAnalytics(app) 
  : null;

// Export the app instance
export default app;
