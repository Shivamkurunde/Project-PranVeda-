// Environment Configuration for PranVeda Zen Flow
// Centralized environment variable management

interface EnvConfig {
  // Supabase Configuration (for database only)
  supabaseUrl: string;
  supabaseAnonKey: string;
  
  // Firebase Configuration
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
  firebaseMeasurementId: string;
  
  // Google OAuth Configuration
  googleClientId: string;
  
  // AI Service Keys (for frontend if needed)
  geminiApiKey?: string;
  deepseekApiKey?: string;
  
  // Application Configuration
  appName: string;
  apiUrl: string;
  frontendUrl: string;
  
  // Development flags
  isDevelopment: boolean;
  isProduction: boolean;
}

// Validate required environment variables
const validateEnvVar = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

// Get environment variables with validation
const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = import.meta.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${name}${defaultValue ? ` (default: ${defaultValue})` : ''}`);
  }
  return value;
};

// Configuration object
export const env: EnvConfig = {
  // Supabase Configuration (for database only)
  supabaseUrl: validateEnvVar('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: validateEnvVar('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY),
  
  // Firebase Configuration
  firebaseApiKey: validateEnvVar('VITE_FIREBASE_API_KEY', import.meta.env.VITE_FIREBASE_API_KEY),
  firebaseAuthDomain: validateEnvVar('VITE_FIREBASE_AUTH_DOMAIN', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  firebaseProjectId: validateEnvVar('VITE_FIREBASE_PROJECT_ID', import.meta.env.VITE_FIREBASE_PROJECT_ID),
  firebaseStorageBucket: validateEnvVar('VITE_FIREBASE_STORAGE_BUCKET', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  firebaseMessagingSenderId: validateEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  firebaseAppId: import.meta.env.VITE_FIREBASE_APP_ID || '', // Optional - for analytics
  firebaseMeasurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '', // Optional - for analytics
  
  // Google OAuth Configuration
  googleClientId: validateEnvVar('VITE_GOOGLE_CLIENT_ID', import.meta.env.VITE_GOOGLE_CLIENT_ID),
  
  // AI Service Keys (optional for frontend)
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
  deepseekApiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
  
  // Application Configuration
  appName: getEnvVar('VITE_APP_NAME', 'PranVeda Zen Flow'),
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:5000'),
  frontendUrl: getEnvVar('VITE_FRONTEND_URL', 'http://localhost:8082'),
  
  // Development flags
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validate configuration on import
export const validateConfig = (): void => {
  try {
    // Check required variables
    if (!env.supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL is required');
    }
    if (!env.supabaseAnonKey) {
      throw new Error('VITE_SUPABASE_ANON_KEY is required');
    }
    // Google OAuth client ID is optional (has default value)
    if (!env.googleClientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID not found, using default value');
    }
    
    // Validate URLs
    try {
      new URL(env.supabaseUrl);
    } catch {
      throw new Error('VITE_SUPABASE_URL must be a valid URL');
    }
    
    try {
      new URL(env.apiUrl);
    } catch {
      throw new Error('VITE_API_URL must be a valid URL');
    }
    
    try {
      new URL(env.frontendUrl);
    } catch {
      throw new Error('VITE_FRONTEND_URL must be a valid URL');
    }
    
    console.log('✅ Environment configuration validated successfully');
    console.log(`📱 App: ${env.appName}`);
    console.log(`🌐 API URL: ${env.apiUrl}`);
    console.log(`🔗 Frontend URL: ${env.frontendUrl}`);
    console.log(`🗄️ Supabase: ${env.supabaseUrl}`);
    console.log(`🔐 Google OAuth: ${env.googleClientId ? 'Configured' : 'Missing'}`);
    
  } catch (error) {
    console.error('❌ Environment configuration validation failed:', error);
    throw error;
  }
};

// Export individual variables for convenience
export const {
  supabaseUrl,
  supabaseAnonKey,
  firebaseApiKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId,
  firebaseMeasurementId,
  googleClientId,
  geminiApiKey,
  deepseekApiKey,
  appName,
  apiUrl,
  frontendUrl,
  isDevelopment,
  isProduction,
} = env;

// Default export
export default env;
