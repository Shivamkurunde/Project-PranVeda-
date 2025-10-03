/**
 * Create User Script
 * Creates a new user in Firebase and Supabase
 */

import { getFirebaseAuth } from '../src/config/firebase.js';
import { getSupabaseClient, TABLES } from '../src/config/supabase.js';

async function createUser(email: string, password: string, displayName: string) {
  try {
    console.log('🚀 Creating new user...');
    console.log(`Email: ${email}`);
    console.log(`Name: ${displayName}`);
    
    // Get Firebase Admin
    const auth = getFirebaseAuth();
    
    // Create user in Firebase
    console.log('\n📝 Step 1: Creating Firebase user...');
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });
    
    console.log('✅ Firebase user created successfully!');
    console.log(`User ID: ${userRecord.uid}`);
    
    // Create user profile in Supabase
    console.log('\n📝 Step 2: Creating Supabase profile...');
    const supabase = getSupabaseClient();
    
    const { data: profile, error } = await supabase
      .from(TABLES.PROFILES)
      .insert({
        user_id: userRecord.uid,
        display_name: displayName,
        email: email,
        preferred_language: 'en',
        wellness_goals: [],
        experience_level: 'beginner',
      })
      .select()
      .single();
    
    if (error) {
      console.error('⚠️ Supabase profile creation failed:', error.message);
      console.log('Note: Profile will be created automatically on first login');
    } else {
      console.log('✅ Supabase profile created successfully!');
      console.log(`Profile ID: ${profile.id}`);
    }
    
    // Success summary
    console.log('\n✨ User created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Name:', displayName);
    console.log('🆔 User ID:', userRecord.uid);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎯 You can now sign in with these credentials!');
    console.log(`   URL: http://localhost:8082/auth/signin\n`);
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error creating user:', error.message);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('\n💡 This email is already registered. Try signing in or use a different email.');
    } else if (error.code === 'auth/invalid-password') {
      console.log('\n💡 Password must be at least 6 characters long.');
    } else if (error.code === 'auth/invalid-email') {
      console.log('\n💡 Please provide a valid email address.');
    }
    
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('\n📋 Usage: npm run create-user <email> <password> <displayName>');
  console.log('\n📝 Example:');
  console.log('   npm run create-user test@example.com Password123! "Test User"');
  console.log('\n⚠️  Note: Password must be at least 6 characters long\n');
  process.exit(1);
}

const [email, password, displayName] = args;

// Run the script
createUser(email, password, displayName);

