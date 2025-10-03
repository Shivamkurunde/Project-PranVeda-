import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for frontend to be ready
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Frontend server is ready');
  } catch (error) {
    console.warn('⚠️ Frontend server may not be ready:', error);
  }
  
  try {
    // Test backend health endpoint
    const response = await page.request.get('http://localhost:5000/api/v1/health');
    if (response.ok()) {
      console.log('✅ Backend server is ready');
    } else {
      console.warn('⚠️ Backend server health check failed');
    }
  } catch (error) {
    console.warn('⚠️ Backend server may not be ready:', error);
  }
  
  await browser.close();
}

export default globalSetup;
