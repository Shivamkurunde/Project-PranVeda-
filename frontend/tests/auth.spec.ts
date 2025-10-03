import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:8082';
const API_URL = 'http://localhost:5000';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  fullName: 'Test User'
};

test.describe('Authentication System', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto(BASE_URL);
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test('1. Frontend loads successfully', async ({ page }) => {
    // Check if the main page loads
    await expect(page).toHaveTitle(/PranVeda/);
    
    // Check for navigation elements
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Meditate')).toBeVisible();
    await expect(page.locator('text=Workout')).toBeVisible();
    await expect(page.locator('text=AI Coach')).toBeVisible();
  });

  test('2. Sign up page loads and validates inputs', async ({ page }) => {
    // Navigate to sign up page
    await page.click('text=Sign Up');
    await page.waitForURL('**/auth/signup');
    
    // Check form elements
    await expect(page.locator('input[type="text"]')).toBeVisible(); // Full name
    await expect(page.locator('input[type="email"]')).toBeVisible(); // Email
    await expect(page.locator('input[type="password"]')).toBeVisible(); // Password
    await expect(page.locator('input[type="password"]').nth(1)).toBeVisible(); // Confirm password
    
    // Test password strength indicator
    await page.fill('input[type="password"]', 'weak');
    await expect(page.locator('text=Very Weak')).toBeVisible();
    
    await page.fill('input[type="password"]', 'StrongPassword123!');
    await expect(page.locator('text=Very Strong')).toBeVisible();
  });

  test('3. Sign in page loads and validates inputs', async ({ page }) => {
    // Navigate to sign in page
    await page.click('text=Sign in');
    await page.waitForURL('**/auth/signin');
    
    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Test form validation
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Unable to connect to server')).toBeVisible();
  });

  test('4. Backend health endpoint responds', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/health`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.message).toBe('Backend server is running');
  });

  test('5. Authentication endpoints are accessible', async ({ request }) => {
    // Test signup endpoint
    const signupResponse = await request.post(`${API_URL}/api/v1/auth/signup`, {
      data: {
        email: testUser.email,
        password: testUser.password,
        fullName: testUser.fullName
      }
    });
    
    // Should return 201 for successful signup or 400 for validation error
    expect([201, 400]).toContain(signupResponse.status());
    
    // Test signin endpoint
    const signinResponse = await request.post(`${API_URL}/api/v1/auth/signin`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });
    
    // Should return 200 for successful signin or 401 for invalid credentials
    expect([200, 401]).toContain(signinResponse.status());
  });

  test('6. CORS is properly configured', async ({ page }) => {
    // Test CORS by making a request from the frontend to backend
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('http://localhost:5000/api/health', {
          method: 'GET',
          credentials: 'include'
        });
        return { status: res.status, ok: res.ok };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);
  });

  test('7. Protected routes redirect to sign in', async ({ page }) => {
    // Try to access a protected route
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Should redirect to sign in page
    await page.waitForURL('**/auth/signin');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('8. Google OAuth button is present', async ({ page }) => {
    // Navigate to sign in page
    await page.click('text=Sign in');
    await page.waitForURL('**/auth/signin');
    
    // Check for Google OAuth button
    await expect(page.locator('text=Sign in with Google')).toBeVisible();
    
    // Navigate to sign up page
    await page.click('text=Sign up for free');
    await page.waitForURL('**/auth/signup');
    
    // Check for Google OAuth button
    await expect(page.locator('text=Sign up with Google')).toBeVisible();
  });

  test('9. Password reset flow is accessible', async ({ page }) => {
    // Navigate to sign in page
    await page.click('text=Sign in');
    await page.waitForURL('**/auth/signin');
    
    // Click forgot password link
    await page.click('text=Forgot your password?');
    
    // Should navigate to password reset page (if implemented)
    // For now, just check that the link is clickable
    await expect(page.locator('text=Forgot your password?')).toBeVisible();
  });

  test('10. Rate limiting is working', async ({ request }) => {
    // Make multiple rapid requests to test rate limiting
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(
        request.post(`${API_URL}/api/v1/auth/signin`, {
          data: {
            email: 'test@example.com',
            password: 'wrongpassword'
          }
        })
      );
    }
    
    const responses = await Promise.all(promises);
    
    // At least one request should be rate limited (429 status)
    const rateLimitedResponses = responses.filter(r => r.status() === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});

test.describe('Error Handling', () => {
  
  test('11. Network errors are handled gracefully', async ({ page }) => {
    // Navigate to sign in page
    await page.click('text=Sign in');
    await page.waitForURL('**/auth/signin');
    
    // Fill in credentials
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    
    // Try to submit (backend might not be running)
    await page.click('button[type="submit"]');
    
    // Should show connection error message
    await expect(page.locator('text=Unable to connect to server')).toBeVisible();
  });

  test('12. Invalid email format is rejected', async ({ page }) => {
    // Navigate to sign up page
    await page.click('text=Sign Up');
    await page.waitForURL('**/auth/signup');
    
    // Fill in invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'ValidPassword123!');
    await page.fill('input[type="password"]').nth(1).fill('ValidPassword123!');
    
    // Try to submit
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=Please check your information')).toBeVisible();
  });
});
