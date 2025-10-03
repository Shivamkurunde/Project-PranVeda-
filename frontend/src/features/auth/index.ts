/**
 * Authentication Feature
 * Centralized exports for authentication functionality
 */

// Components
export { ProtectedRoute } from './components/ProtectedRoute';
export { AuthLayout } from './components/AuthLayout';

// Pages
export { default as SignIn } from './pages/SignIn';
export { default as SignUp } from './pages/SignUp';
export { default as ForgotPassword } from './pages/ForgotPassword';
export { default as ResetPassword } from './pages/ResetPassword';

// Hooks
export { useAuth, AuthProvider } from './hooks/useFirebaseAuth';
