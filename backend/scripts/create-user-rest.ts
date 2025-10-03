/**
 * Create User Script (Using REST API)
 * Creates a new user using Firebase REST API
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../backend.env') });

async function createUser(email: string, password: string, displayName: string) {
  try {
    console.log('🚀 Creating new user via Firebase REST API...');
    console.log(`Email: ${email}`);
    console.log(`Name: ${displayName}`);
    
    // Firebase Web API key
    const apiKey = process.env.FIREBASE_WEB_API_KEY;
    
    if (!apiKey) {
      throw new Error('FIREBASE_WEB_API_KEY not found in environment variables');
    }
    
    console.log('\n📝 Creating Firebase user...');
    
    // Create user using Firebase REST API
    const signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
    
    const response = await fetch(signUpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        displayName,
        returnSecureToken: true,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create user');
    }
    
    const userData = await response.json();
    
    console.log('✅ Firebase user created successfully!');
    console.log(`User ID: ${userData.localId}`);
    console.log(`Email: ${userData.email}`);
    console.log(`ID Token: ${userData.idToken.substring(0, 20)}...`);
    
    // Success summary
    console.log('\n✨ User created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Name:', displayName);
    console.log('🆔 User ID:', userData.localId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎯 You can now sign in with these credentials!');
    console.log(`   URL: http://localhost:8082/auth/signin\n`);
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error creating user:', error.message);
    
    if (error.message.includes('EMAIL_EXISTS')) {
      console.log('\n💡 This email is already registered. Try signing in or use a different email.');
    } else if (error.message.includes('WEAK_PASSWORD')) {
      console.log('\n💡 Password must be at least 6 characters long.');
    } else if (error.message.includes('INVALID_EMAIL')) {
      console.log('\n💡 Please provide a valid email address.');
    }
    
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('\n📋 Usage: npm run create-user-rest <email> <password> <displayName>');
  console.log('\n📝 Example:');
  console.log('   npm run create-user-rest test@example.com Password123! "Test User"');
  console.log('\n⚠️  Note: Password must be at least 6 characters long\n');
  process.exit(1);
}

const [email, password, displayName] = args;

// Run the script
createUser(email, password, displayName);

