import React from 'react';
import { useAuth } from '../hooks/useFirebaseAuth';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  // Defensive useAuth to prevent crashes during HMR or test setups
  let auth = null;
  try {
    auth = useAuth();
  } catch (error) {
    console.warn('AuthLayout: useAuth not available in current context');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            PranVeda Zen Flow
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your journey to wellness starts here
          </p>
        </div>
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
};
