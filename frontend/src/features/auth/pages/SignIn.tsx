import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Mail, Lock, Chrome, Star, Flower, Dumbbell, Brain } from 'lucide-react';
import { useAuth } from '../hooks/useFirebaseAuth';
import { toast } from 'sonner';
import { apiUrl } from '@/config/env';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error) {
      // Check if this is a Firebase authentication error (has specific error codes)
      if (error.code && error.code.startsWith('auth/')) {
        // This is a Firebase authentication error - use our custom message
        setError(error.message);
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        // Specific Firebase auth errors
        setError(error.message);
      } else {
        // Check if the error is network/connection related
        const errorMessage = error.message || '';
        if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('connection') || 
            errorMessage.includes('ERR_CONNECTION_REFUSED') || errorMessage.includes('ERR_NETWORK')) {
          setError(`Unable to connect to server. Please ensure the backend server is running at ${apiUrl} and try again.`);
        } else if (errorMessage) {
          // Use any other error message
          setError(errorMessage);
        } else {
          // Default generic error message
          setError('An error occurred. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success('Welcome!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error('Google sign-in failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF] flex flex-col">
      {/* Navbar */}
      <nav className="bg-[#1F2937] text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-semibold">PranVeda</span>
          </div>
          <nav className="flex items-center space-x-6 text-sm">
            <Link to="/" className="hover:text-purple-300">Home</Link>
            <Link to="/meditate" className="flex items-center hover:text-purple-300">
              <Flower className="mr-1 h-4 w-4" /> Meditate
            </Link>
            <Link to="/workout" className="flex items-center hover:text-purple-300">
              <Dumbbell className="mr-1 h-4 w-4" /> Workout
            </Link>
            <Link to="/ai-coach" className="flex items-center hover:text-purple-300">
              <Brain className="mr-1 h-4 w-4" /> AI Coach
            </Link>
          </nav>
          <Button className="bg-purple-600 hover:bg-purple-700 rounded-md px-4 py-2 text-sm">Sign Up</Button>
        </div>
      </nav>

      {/* Main Content - CENTERED */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-white">P</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to your PranVeda account</p>
          </div>

          {/* Error Box - if error exists */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label htmlFor="remember" className="text-gray-600">Remember me</label>
              </div>
              <Link to="/auth/forgot-password" className="text-purple-600 hover:underline">Forgot your password?</Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            {/* Separator */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              <Chrome className="w-5 h-5" />
              Sign in with Google
            </button>
          </form>

          {/* Bottom Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-purple-600 font-medium hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;