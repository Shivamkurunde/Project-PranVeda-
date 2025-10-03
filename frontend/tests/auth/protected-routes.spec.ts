import { test, expect } from '@playwright/test';
import { AuthUtils } from './auth-utils';

test.describe('Protected Routes', () => {
  let authUtils: AuthUtils;

  test.beforeEach(async ({ page }) => {
    authUtils = new AuthUtils(page);
  });

  test('should redirect unauthenticated users to sign-in', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to sign-in page
    await expect(page).toHaveURL(/.*auth.*signin/);
  });

  test('should allow access to dashboard after authentication', async ({ page }) => {
    // Sign in first
    await authUtils.navigateToSignIn();
    await authUtils.fillSignInForm('test@example.com', 'TestPassword123!');
    await authUtils.submitForm();
    await authUtils.waitForSuccess();

    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Should have access to dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should allow access to AI Coach after authentication', async ({ page }) => {
    // Sign in first
    await authUtils.navigateToSignIn();
    await authUtils.fillSignInForm('test@example.com', 'TestPassword123!');
    await authUtils.submitForm();
    await authUtils.waitForSuccess();

    // Navigate to AI Coach
    await page.goto('/ai-coach');
    
    // Should have access to AI Coach
    await expect(page.locator('text=AI Coach')).toBeVisible();
  });

  test('should protect user profile page', async ({ page }) => {
    await page.goto('/profile');
    
    // Should redirect to sign-in
    await expect(page).toHaveURL(/.*auth.*signin/);
  });

  test('should allow access to profile after authentication', async ({ page }) => {
    // Sign in first
    await authUtils.navigateToSignIn();
    await authUtils.fillSignInForm('test@example.com', 'TestPassword123!');
    await authUtils.submitForm();
    await authUtils.waitForSuccess();

    // Navigate to profile
    await page.goto('/profile');
    
    // Should have access to profile
    await expect(page.locator('text=Profile')).toBeVisible();
  });

  test('should handle expired JWT tokens', async ({ page }) => {
    // Mock expired token
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'expired-jwt-token');
    });

    await page.goto('/dashboard');
    
    // Should redirect to sign-in due to expired token
    await expect(page).toHaveURL(/.*auth.*signin/);
  });

  test('should handle invalid JWT tokens', async ({ page }) => {
    // Mock invalid token
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'invalid-jwt-token');
    });

    await page.goto('/dashboard');
    
    // Should redirect to sign-in due to invalid token
    await expect(page).toHaveURL(/.*auth.*signin/);
  });

  test('should maintain session across page refreshes', async ({ page }) => {
    // Sign in first
    await authUtils.navigateToSignIn();
    await authUtils.fillSignInForm('test@example.com', 'TestPassword123!');
    await authUtils.submitForm();
    await authUtils.waitForSuccess();

    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Refresh the page
    await page.reload();
    
    // Should still be authenticated
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should logout and clear session', async ({ page }) => {
    // Sign in first
    await authUtils.navigateToSignIn();
    await authUtils.fillSignInForm('test@example.com', 'TestPassword123!');
    await authUtils.submitForm();
    await authUtils.waitForSuccess();

    // Logout
    await authUtils.logout();
    
    // Try to access protected route
    await page.goto('/dashboard');
    
    // Should redirect to sign-in
    await expect(page).toHaveURL(/.*auth.*signin/);
  });

  test('should handle multiple tab sessions', async ({ page, context }) => {
    // Sign in first
    await authUtils.navigateToSignIn();
    await authUtils.fillSignInForm('test@example.com', 'TestPassword123!');
    await authUtils.submitForm();
    await authUtils.waitForSuccess();

    // Open second tab
    const secondPage = await context.newPage();
    await secondPage.goto('/dashboard');
    
    // Should have access in second tab
    await expect(secondPage.locator('text=Dashboard')).toBeVisible();
    
    // Logout from first tab
    await authUtils.logout();
    
    // Refresh second tab
    await secondPage.reload();
    
    // Should redirect to sign-in in second tab
    await expect(secondPage).toHaveURL(/.*auth.*signin/);
  });
});
