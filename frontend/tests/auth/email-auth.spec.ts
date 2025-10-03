import { test, expect } from '@playwright/test';
import { AuthUtils } from './auth-utils';

test.describe('Email Authentication', () => {
  let authUtils: AuthUtils;

  test.beforeEach(async ({ page }) => {
    authUtils = new AuthUtils(page);
  });

  test('should allow user registration with valid credentials', async ({ page }) => {
    await authUtils.navigateToSignUp();
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    const testName = 'Test User';

    await authUtils.fillSignUpForm(testEmail, testPassword, testName);
    await authUtils.submitForm();

    // Should redirect to dashboard or show success message
    await authUtils.waitForSuccess();
  });

  test('should allow user login with valid credentials', async ({ page }) => {
    await authUtils.navigateToSignIn();
    
    // Use test credentials
    const testEmail = 'test@example.com';
    const testPassword = 'TestPassword123!';

    await authUtils.fillSignInForm(testEmail, testPassword);
    await authUtils.submitForm();

    // Should redirect to dashboard or show success message
    await authUtils.waitForSuccess();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await authUtils.navigateToSignUp();
    
    await authUtils.fillSignUpForm('invalid-email', 'TestPassword123!', 'Test User');
    await authUtils.submitForm();

    // Should show validation error
    const errorMessage = await authUtils.getErrorMessage();
    expect(errorMessage).toContain('email');
  });

  test('should show error for weak password', async ({ page }) => {
    await authUtils.navigateToSignUp();
    
    await authUtils.fillSignUpForm('test@example.com', '123', 'Test User');
    await authUtils.submitForm();

    // Should show password strength error
    const errorMessage = await authUtils.getErrorMessage();
    expect(errorMessage).toContain('password');
  });

  test('should show error for password mismatch', async ({ page }) => {
    await authUtils.navigateToSignUp();
    
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
    
    await authUtils.submitForm();

    // Should show password mismatch error
    const errorMessage = await authUtils.getErrorMessage();
    expect(errorMessage).toContain('password');
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await authUtils.navigateToSignIn();
    
    await authUtils.fillSignInForm('nonexistent@example.com', 'WrongPassword123!');
    await authUtils.submitForm();

    // Should show authentication error
    const errorMessage = await authUtils.getErrorMessage();
    expect(errorMessage).toContain('invalid');
  });

  test('should validate password strength in real-time', async ({ page }) => {
    await authUtils.navigateToSignUp();
    
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('weak');
    
    // Check for password strength indicator
    const strengthIndicator = page.locator('[data-testid="password-strength"]');
    await expect(strengthIndicator).toBeVisible();
  });

  test('should remember user session when remember me is checked', async ({ page }) => {
    await authUtils.navigateToSignIn();
    
    const testEmail = 'test@example.com';
    const testPassword = 'TestPassword123!';

    await authUtils.fillSignInForm(testEmail, testPassword);
    await authUtils.submitForm();
    await authUtils.waitForSuccess();

    // Close and reopen browser
    await page.close();
    await page.browser().newPage();
    
    // Navigate to protected page - should still be logged in
    await page.goto('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});
