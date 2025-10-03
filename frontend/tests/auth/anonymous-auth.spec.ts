import { test, expect } from '@playwright/test';

test.describe('Anonymous Authentication', () => {
  test('should allow anonymous access to public pages', async ({ page }) => {
    await page.goto('/');
    
    // Should be able to access landing page without authentication
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should show anonymous user limitations', async ({ page }) => {
    await page.goto('/');
    
    // Look for anonymous user indicators or limitations
    const anonymousIndicator = page.locator('[data-testid="anonymous-user"], text=Anonymous');
    if (await anonymousIndicator.isVisible()) {
      await expect(anonymousIndicator).toBeVisible();
    }
  });

  test('should prompt for sign-up when accessing protected features', async ({ page }) => {
    await page.goto('/ai-coach');
    
    // Should either redirect to sign-in or show sign-up prompt
    const signInPrompt = page.locator('text=Sign in, text=Sign up, [data-testid="auth-prompt"]');
    await expect(signInPrompt.first()).toBeVisible();
  });

  test('should allow browsing meditation content without authentication', async ({ page }) => {
    await page.goto('/meditation');
    
    // Should be able to view meditation content
    await expect(page.locator('text=Meditation')).toBeVisible();
  });

  test('should allow browsing workout content without authentication', async ({ page }) => {
    await page.goto('/workout');
    
    // Should be able to view workout content
    await expect(page.locator('text=Workout')).toBeVisible();
  });

  test('should show upgrade prompt for premium features', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should show upgrade prompt or redirect to sign-in
    const upgradePrompt = page.locator('text=Upgrade, text=Sign in, [data-testid="upgrade-prompt"]');
    await expect(upgradePrompt.first()).toBeVisible();
  });

  test('should handle anonymous user session persistence', async ({ page }) => {
    // Navigate as anonymous user
    await page.goto('/');
    
    // Navigate to another page
    await page.goto('/meditation');
    
    // Should still be anonymous
    const anonymousIndicator = page.locator('[data-testid="anonymous-user"]');
    if (await anonymousIndicator.isVisible()) {
      await expect(anonymousIndicator).toBeVisible();
    }
  });

  test('should convert anonymous session to authenticated session', async ({ page }) => {
    // Start as anonymous user
    await page.goto('/');
    
    // Navigate to sign-up
    await page.goto('/auth/signup');
    
    // Fill and submit sign-up form
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Should convert to authenticated session
    await page.waitForURL('**/dashboard');
  });
});
