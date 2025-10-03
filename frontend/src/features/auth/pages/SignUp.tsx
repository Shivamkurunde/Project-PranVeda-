import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, User, Mail, Lock, Chrome, Star, Flower, Dumbbell, Brain, Check, X } from 'lucide-react';
import { useAuth } from '../hooks/useFirebaseAuth';
import { toast } from 'sonner';
import { apiUrl } from '@/config/env';

const SignUp: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    
    const strengthLevels = {
      0: { label: 'Very Weak', color: 'bg-red-500', percent: 0 },
      1: { label: 'Weak', color: 'bg-red-500', percent: 20 },
      2: { label: 'Fair', color: 'bg-yellow-500', percent: 40 },
      3: { label: 'Good', color: 'bg-green-500', percent: 60 },
      4: { label: 'Strong', color: 'bg-blue-500', percent: 80 },
      5: { label: 'Very Strong', color: 'bg-blue-600', percent: 100 }
    };
    
    return { ...strengthLevels[strength], checks };
  };

  const passwordStrength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Please check your information and try again. Make sure your password is at least 8 characters long.');
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms and Conditions');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, fullName);
      toast.success('Account created successfully!');
      navigate(from, { replace: true });
    } catch (error) {
      // Check if this is a Firebase authentication error (has specific error codes)
      if (error.code && error.code.startsWith('auth/')) {
        // This is a Firebase authentication error - use our custom message
        setError(error.message);
      } else if (error.code === 'auth/email-already-in-use' || error.code === 'auth/invalid-email' || error.code === 'auth/weak-password') {
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

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      toast.success('Welcome!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error('Google sign-up failed');
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h2>
            <p className="text-gray-600">Start your wellness journey today</p>
          </div>

          {/* Error Box - if error exists */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
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
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Create a strong password"
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

            {/* PASSWORD STRENGTH INDICATOR */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Password strength:</span>
                  <span className={`font-medium ${
                    passwordStrength.percent < 40 ? 'text-red-600' :
                    passwordStrength.percent < 60 ? 'text-yellow-600' :
                    passwordStrength.percent < 80 ? 'text-green-600' :
                    'text-blue-600'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.percent}%` }}
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    {passwordStrength.checks.length ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                    <span className={passwordStrength.checks.length ? 'text-green-600' : 'text-gray-600'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordStrength.checks.uppercase ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                    <span className={passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-600'}>
                      Contains uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordStrength.checks.lowercase ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                    <span className={passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-600'}>
                      Contains lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordStrength.checks.number ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                    <span className={passwordStrength.checks.number ? 'text-green-600' : 'text-gray-600'}>
                      Contains number
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordStrength.checks.special ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                    <span className={passwordStrength.checks.special ? 'text-green-600' : 'text-gray-600'}>
                      Contains special character
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 bg-white border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-purple-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
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
              onClick={handleGoogleSignUp}
              className="w-full py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              <Chrome className="w-5 h-5" />
              Sign up with Google
            </button>
          </form>

          {/* Bottom Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/auth/signin" className="text-purple-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;