#!/usr/bin/env node

/**
 * Environment Validation Script for PranVeda Zen Flow
 * This script validates that all required environment variables are set correctly
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function to colorize console output
const colorize = (text, color) => `${colors[color]}${text}${colors.reset}`;

// Helper function to check if a file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
};

// Helper function to load environment variables from a file
const loadEnvFile = (filePath) => {
  if (!fileExists(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
};

// Helper function to validate URL format
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Frontend environment validation
const validateFrontendEnv = () => {
  console.log(colorize('\n🔍 Validating Frontend Environment...', 'cyan'));
  
  const envPath = path.join(__dirname, '..', 'frontend', 'frontend.env');
  const env = loadEnvFile(envPath);
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_GOOGLE_CLIENT_ID',
    'VITE_API_URL',
    'VITE_FRONTEND_URL'
  ];
  
  const optionalVars = [
    'VITE_FIREBASE_MEASUREMENT_ID',
    'VITE_GEMINI_API_KEY',
    'VITE_DEEPSEEK_API_KEY',
    'VITE_DEBUG',
    'VITE_LOG_LEVEL'
  ];
  
  let hasErrors = false;
  
  // Check if frontend.env exists
  if (!fileExists(envPath)) {
    console.log(colorize('❌ Frontend frontend.env file not found!', 'red'));
    console.log(colorize('   Create it by copying frontend/frontend.env.example to frontend/frontend.env', 'yellow'));
    return false;
  }
  
  // Validate required variables
  requiredVars.forEach(varName => {
    if (!env[varName] || env[varName] === 'your-' + varName.toLowerCase().replace('vite_', '').replace(/_/g, '-') + '-here') {
      console.log(colorize(`❌ Missing or placeholder value: ${varName}`, 'red'));
      hasErrors = true;
    } else {
      console.log(colorize(`✅ ${varName}`, 'green'));
    }
  });
  
  // Validate optional variables
  optionalVars.forEach(varName => {
    if (env[varName] && env[varName] !== 'your-' + varName.toLowerCase().replace('vite_', '').replace(/_/g, '-') + '-here') {
      console.log(colorize(`✅ ${varName} (optional)`, 'green'));
    } else {
      console.log(colorize(`⚠️  ${varName} (optional) - not set`, 'yellow'));
    }
  });
  
  // Validate URL formats
  const urlVars = ['VITE_SUPABASE_URL', 'VITE_API_URL', 'VITE_FRONTEND_URL'];
  urlVars.forEach(varName => {
    if (env[varName] && !isValidUrl(env[varName])) {
      console.log(colorize(`❌ Invalid URL format: ${varName}`, 'red'));
      hasErrors = true;
    }
  });
  
  return !hasErrors;
};

// Backend environment validation
const validateBackendEnv = () => {
  console.log(colorize('\n🔍 Validating Backend Environment...', 'cyan'));
  
  const envPath = path.join(__dirname, '..', 'backend', 'backend.env');
  const env = loadEnvFile(envPath);
  
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'PORT',
    'NODE_ENV',
    'FRONTEND_URL',
    'JWT_SECRET'
  ];
  
  const optionalVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USERNAME',
    'SMTP_PASSWORD',
    'GEMINI_API_KEY',
    'DEEPSEEK_API_KEY',
    'OPENAI_API_KEY'
  ];
  
  let hasErrors = false;
  
  // Check if backend.env exists
  if (!fileExists(envPath)) {
    console.log(colorize('❌ Backend backend.env file not found!', 'red'));
    console.log(colorize('   Create it by copying backend/backend.env.example to backend/backend.env', 'yellow'));
    return false;
  }
  
  // Validate required variables
  requiredVars.forEach(varName => {
    if (!env[varName] || env[varName].includes('your-') || env[varName].includes('YOUR_')) {
      console.log(colorize(`❌ Missing or placeholder value: ${varName}`, 'red'));
      hasErrors = true;
    } else {
      console.log(colorize(`✅ ${varName}`, 'green'));
    }
  });
  
  // Validate optional variables
  optionalVars.forEach(varName => {
    if (env[varName] && !env[varName].includes('your-') && !env[varName].includes('YOUR_')) {
      console.log(colorize(`✅ ${varName} (optional)`, 'green'));
    } else {
      console.log(colorize(`⚠️  ${varName} (optional) - not set`, 'yellow'));
    }
  });
  
  // Validate specific formats
  if (env.FIREBASE_CLIENT_EMAIL && !isValidEmail(env.FIREBASE_CLIENT_EMAIL)) {
    console.log(colorize('❌ Invalid email format: FIREBASE_CLIENT_EMAIL', 'red'));
    hasErrors = true;
  }
  
  if (env.PORT && (isNaN(env.PORT) || env.PORT < 1 || env.PORT > 65535)) {
    console.log(colorize('❌ Invalid port number: PORT', 'red'));
    hasErrors = true;
  }
  
  // Validate URL formats
  const urlVars = ['SUPABASE_URL', 'FRONTEND_URL'];
  urlVars.forEach(varName => {
    if (env[varName] && !isValidUrl(env[varName])) {
      console.log(colorize(`❌ Invalid URL format: ${varName}`, 'red'));
      hasErrors = true;
    }
  });
  
  return !hasErrors;
};

// Main validation function
const main = () => {
  console.log(colorize('🔧 PranVeda Zen Flow - Environment Validation', 'bright'));
  console.log(colorize('=' .repeat(50), 'blue'));
  
  const frontendValid = validateFrontendEnv();
  const backendValid = validateBackendEnv();
  
  console.log(colorize('\n📊 Validation Summary:', 'bright'));
  console.log(colorize('=' .repeat(30), 'blue'));
  
  if (frontendValid) {
    console.log(colorize('✅ Frontend environment: VALID', 'green'));
  } else {
    console.log(colorize('❌ Frontend environment: INVALID', 'red'));
  }
  
  if (backendValid) {
    console.log(colorize('✅ Backend environment: VALID', 'green'));
  } else {
    console.log(colorize('❌ Backend environment: INVALID', 'red'));
  }
  
  if (frontendValid && backendValid) {
    console.log(colorize('\n🎉 All environment configurations are valid!', 'green'));
    console.log(colorize('You can now start your development servers.', 'green'));
    process.exit(0);
  } else {
    console.log(colorize('\n⚠️  Please fix the environment configuration issues above.', 'yellow'));
    console.log(colorize('See ENV_SETUP.md for detailed instructions.', 'yellow'));
    process.exit(1);
  }
};

// Run validation if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  validateFrontendEnv,
  validateBackendEnv,
  main
};
