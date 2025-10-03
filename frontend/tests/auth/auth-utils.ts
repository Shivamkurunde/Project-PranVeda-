import { Page } from '@playwright/test';

export class AuthUtils {
  constructor(private page: Page) {}

  async navigateToSignUp() {
    await this.page.goto('/auth/signup');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToSignIn() {
    await this.page.goto('/auth/signin');
    await this.page.waitForLoadState('networkidle');
  }

  async fillSignUpForm(email: string, password: string, fullName?: string) {
    if (fullName) {
      await this.page.fill('input[name="fullName"]', fullName);
    }
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.fill('input[name="confirmPassword"]', password);
    
    // Check terms agreement if present
    const termsCheckbox = this.page.locator('input[type="checkbox"]').first();
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }
  }

  async fillSignInForm(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    
    // Check remember me if present
    const rememberMe = this.page.locator('input[name="rememberMe"]');
    if (await rememberMe.isVisible()) {
      await rememberMe.check();
    }
  }

  async submitForm() {
    const submitButton = this.page.locator('button[type="submit"]');
    await submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async waitForSuccess() {
    // Wait for success message or redirect
    await this.page.waitForSelector('text=success', { timeout: 10000 }).catch(() => {
      // If no success message, check for redirect to dashboard
      return this.page.waitForURL('**/dashboard', { timeout: 10000 });
    });
  }

  async waitForError() {
    await this.page.waitForSelector('text=error', { timeout: 5000 });
  }

  async getErrorMessage() {
    const errorElement = this.page.locator('[role="alert"], .error, .text-red-500').first();
    return await errorElement.textContent();
  }

  async isLoggedIn() {
    // Check for logout button or user menu
    const logoutButton = this.page.locator('button:has-text("Logout"), [data-testid="logout"]');
    return await logoutButton.isVisible();
  }

  async logout() {
    const logoutButton = this.page.locator('button:has-text("Logout"), [data-testid="logout"]');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }
}
