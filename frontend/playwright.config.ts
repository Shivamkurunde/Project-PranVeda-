import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from frontend.env
dotenv.config({ path: path.resolve(__dirname, 'frontend.env') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry once locally, twice in CI
  workers: process.env.CI ? 1 : undefined,
  
  // Add timeout configurations
  timeout: 60000, // Global timeout per test (60 seconds)
  expect: {
    timeout: 10000, // Timeout for expect assertions (10 seconds)
  },
  
  reporter: [
    ['list'],
    ['html']
  ],
  use: {
    baseURL: 'http://localhost:8082',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 60000,  // Increased to 60 seconds
    actionTimeout: 30000,       // Action timeout for interactions
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
    ignoreHTTPSErrors: true,
    storageState: undefined,
  },

  projects: process.env.CI ? [
    // CI: Run only desktop browsers for speed
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ] : [
    // Local: Run all browsers including mobile
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        // Increase timeouts for WebKit
        navigationTimeout: 60000,
        actionTimeout: 30000,
      },
    },
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        // Increase timeouts for mobile
        navigationTimeout: 90000,
        actionTimeout: 45000,
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        // Increase timeouts for mobile
        navigationTimeout: 90000,
        actionTimeout: 45000,
      },
    },
  ],

  webServer: [
    {
      command: 'npm run dev',
      port: 8082,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'cd ../backend && npm run dev',
      port: 5000,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],

  globalSetup: './tests/global-setup.ts',
});
