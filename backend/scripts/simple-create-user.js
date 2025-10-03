/**
 * Simple User Creation Script
 * No dependencies, just fetch API
 */

const API_KEY = 'AIzaSyCj2aG66xxGiiS9zvm0WWzvBD6_R3yiL_0';

async function createUser(email, password, displayName) {
  console.log('🚀 Creating new Firebase user...');
  console.log(`Email: ${email}`);
  console.log(`Name: ${displayName || 'Not set'}`);
  console.log('');

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          displayName: displayName || '',
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || JSON.stringify(data));
    }

    console.log('✅ SUCCESS! User created in Firebase!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', data.email);
    console.log('🔑 Password:', password);
    console.log('👤 Name:', displayName || 'Not set');
    console.log('🆔 User ID:', data.localId);
    console.log('🎫 Token:', data.idToken.substring(0, 30) + '...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('   1. Go to: http://localhost:8082/auth/signin');
    console.log('   2. Sign in with the credentials above');
    console.log('   3. Your profile will be auto-created in Supabase');
    console.log('');

    return data;
  } catch (error) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    console.error('');

    if (error.message.includes('EMAIL_EXISTS')) {
      console.log('💡 This email is already registered!');
      console.log('   Try one of these:');
      console.log('   - Use a different email');
      console.log('   - Sign in at: http://localhost:8082/auth/signin');
    } else if (error.message.includes('WEAK_PASSWORD')) {
      console.log('💡 Password is too weak!');
      console.log('   - Must be at least 6 characters');
      console.log('   - Try: Test1234!');
    } else if (error.message.includes('INVALID_EMAIL')) {
      console.log('💡 Invalid email format!');
      console.log('   - Use format: user@example.com');
    } else {
      console.log('💡 Details:', error.message);
    }

    console.log('');
    throw error;
  }
}

// Get arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('');
  console.log('📋 Usage: node simple-create-user.js <email> <password> [displayName]');
  console.log('');
  console.log('📝 Examples:');
  console.log('   node simple-create-user.js test@example.com Test1234!');
  console.log('   node simple-create-user.js user@example.com MyPass123! "John Doe"');
  console.log('');
  console.log('⚠️  Password must be at least 6 characters');
  console.log('');
  process.exit(1);
}

const [email, password, displayName] = args;

createUser(email, password, displayName).catch(() => process.exit(1));

