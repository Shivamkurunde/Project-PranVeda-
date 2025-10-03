import { test, expect } from '@playwright/test';

test.describe('OAuth Integration', () => {
  test('should display Google sign-in button', async ({ page }) => {
    await page.goto('/auth/signin');
    
    const googleButton = page.locator('button:has-text("Google"), [data-testid="google-signin"]');
    await expect(googleButton).toBeVisible();
  });

  test('should display Google sign-up button on registration page', async ({ page }) => {
    await page.goto('/auth/signup');
    
    const googleButton = page.locator('button:has-text("Google"), [data-testid="google-signup"]');
    await expect(googleButton).toBeVisible();
  });

  test('should handle Google OAuth flow', async ({ page }) => {
    await page.goto('/auth/signin');
    
    const googleButton = page.locator('button:has-text("Google"), [data-testid="google-signin"]');
    await googleButton.click();

    // Should redirect to Google OAuth or show OAuth popup
    // Note: This test may fail in CI/CD without proper OAuth setup
    await page.waitForLoadState('networkidle');
  });

  test('should show OAuth error when Google sign-in fails', async ({ page }) => {
    // Mock Google OAuth failure
    await page.route('**/auth/google/callback', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'OAuth authentication failed' })
      });
    });

    await page.goto('/auth/signin');
    
    const googleButton = page.locator('button:has-text("Google"), [data-testid="google-signin"]');
    await googleButton.click();

    // Should show error message
    const errorMessage = page.locator('[role="alert"], .error, .text-red-500');
    await expect(errorMessage).toBeVisible();
  });

  test('should redirect to correct URL after successful OAuth', async ({ page }) => {
    // Mock successful Google OAuth
    await page.route('**/auth/google/callback', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true, 
          user: { id: 'google-user-123', email: 'user@gmail.com' },
          token: 'mock-jwt-token'
        })
      });
    });

    await page.goto('/auth/signin');
    
    const googleButton = page.locator('button:has-text("Google"), [data-testid="google-signin"]');
    await googleButton.click();

    // Should redirect to dashboard
    await page.waitForURL('**/dashboard');
  });

  test('should handle OAuth popup window', async ({ page, context }) => {
    await page.goto('/auth/signin');
    
    const googleButton = page.locator('button:has-text("Google"), [data-testid="google-signin"]');
    
    // Listen for popup
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      googleButton.click()
    ]);

    // Should open Google OAuth popup
    await expect(popup.url()).toContain('accounts.google.com');
  });
});
