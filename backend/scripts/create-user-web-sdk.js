/**
 * Create User Using Firebase Web SDK API
 * Simulates what the frontend does
 */

const FIREBASE_API_KEY = 'AIzaSyCj2aG66xxGiiS9zvm0WWzvBD6_R3yiL_0';

async function createUser(email, password, displayName) {
  console.log('🚀 Creating user via Firebase Web SDK API...');
  console.log(`📧 Email: ${email}`);
  console.log(`👤 Name: ${displayName || 'Not set'}`);
  console.log('');

  try {
    // Step 1: Create user account
    console.log('📝 Step 1: Creating Firebase account...');
    const signUpResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const signUpData = await signUpResponse.json();

    if (signUpData.error) {
      throw new Error(signUpData.error.message);
    }

    console.log('✅ Firebase account created!');
    console.log(`   User ID: ${signUpData.localId}`);

    // Step 2: Update profile with display name
    if (displayName) {
      console.log('\n📝 Step 2: Setting display name...');
      const updateResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken: signUpData.idToken,
            displayName,
            returnSecureToken: true,
          }),
        }
      );

      const updateData = await updateResponse.json();
      
      if (updateData.error) {
        console.log('⚠️  Could not set display name:', updateData.error.message);
      } else {
        console.log('✅ Display name set!');
      }
    }

    // Success summary
    console.log('\n✨ SUCCESS! User created!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Name:', displayName || 'Not set');
    console.log('🆔 User ID:', signUpData.localId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('   1. Go to: http://localhost:8082/auth/signin');
    console.log('   2. Sign in with the email/password above');
    console.log('   3. Profile will auto-create in Supabase');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('');

    if (error.message.includes('EMAIL_EXISTS')) {
      console.log('💡 This email already exists!');
      console.log('   - Try signing in at: http://localhost:8082/auth/signin');
      console.log('   - Or use a different email');
    } else if (error.message.includes('WEAK_PASSWORD')) {
      console.log('💡 Password too weak!');
      console.log('   - Must be at least 6 characters');
    } else if (error.message.includes('INVALID_EMAIL')) {
      console.log('💡 Invalid email format!');
    }

    console.log('');
    process.exit(1);
  }
}

// Get arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('');
  console.log('📋 Usage: node create-user-web-sdk.js <email> <password> [displayName]');
  console.log('');
  console.log('📝 Examples:');
  console.log('   node create-user-web-sdk.js demo@pranveda.com Demo1234!');
  console.log('   node create-user-web-sdk.js test@example.com Test1234! "Test User"');
  console.log('');
  console.log('⚠️  Password: Minimum 6 characters');
  console.log('');
  process.exit(1);
}

const [email, password, displayName] = args;

createUser(email, password, displayName);

