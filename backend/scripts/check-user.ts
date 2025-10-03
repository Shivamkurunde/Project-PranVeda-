/**
 * Check User Script
 * Checks if a user exists in Firebase and Supabase
 */

import { getFirebaseAuth } from '../src/config/firebase.js';
import { getSupabaseClient, TABLES } from '../src/config/supabase.js';

async function checkUser(userId: string) {
  try {
    console.log('🔍 Checking user...');
    console.log(`User ID: ${userId}\n`);
    
    // Get Firebase Admin
    const auth = getFirebaseAuth();
    
    // Check Firebase
    console.log('📝 Step 1: Checking Firebase...');
    try {
      const userRecord = await auth.getUser(userId);
      console.log('✅ User found in Firebase!');
      console.log(`   Email: ${userRecord.email}`);
      console.log(`   Display Name: ${userRecord.displayName || 'Not set'}`);
      console.log(`   Email Verified: ${userRecord.emailVerified}`);
      console.log(`   Created: ${new Date(userRecord.metadata.creationTime).toLocaleString()}`);
    } catch (error: any) {
      console.log('❌ User NOT found in Firebase');
      console.log(`   Error: ${error.message}`);
      return;
    }
    
    // Check Supabase
    console.log('\n📝 Step 2: Checking Supabase profile...');
    const supabase = getSupabaseClient();
    
    const { data: profile, error } = await supabase
      .from(TABLES.PROFILES)
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !profile) {
      console.log('⚠️  Profile NOT found in Supabase');
      console.log('   Profile will be created on first login');
    } else {
      console.log('✅ Profile found in Supabase!');
      console.log(`   Display Name: ${profile.display_name}`);
      console.log(`   Language: ${profile.preferred_language}`);
      console.log(`   Experience: ${profile.experience_level}`);
      console.log(`   Created: ${new Date(profile.created_at).toLocaleString()}`);
    }
    
    console.log('\n✨ User check complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error checking user:', error.message);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 1) {
  console.log('\n📋 Usage: npm run check-user <userId>');
  console.log('\n📝 Example:');
  console.log('   npm run check-user Vc3WS67p7ua62bhBcIH4vcBmln43');
  console.log('');
  process.exit(1);
}

const [userId] = args;

// Run the script
checkUser(userId);

