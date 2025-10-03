// Startup validation and initialization
import { validateConfig } from '@/config/env';

export const initializeApp = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing PranVeda Zen Flow...');
    
    // Validate environment configuration
    validateConfig();
    
    // Additional startup checks can be added here
    console.log('✅ App initialization completed successfully');
    
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    
    // Show user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // You could show a modal or redirect to an error page here
    alert(`App initialization failed: ${errorMessage}\n\nPlease check your environment configuration.`);
    
    throw error;
  }
};

export default initializeApp;

