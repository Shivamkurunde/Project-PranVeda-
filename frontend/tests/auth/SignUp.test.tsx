import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignUp from '../../src/features/auth/pages/SignUp';
import { useAuth } from '../../src/features/auth/hooks/useFirebaseAuth';
import { toast } from 'sonner';

// Mock the auth hook
vi.mock('../../src/features/auth/hooks/useFirebaseAuth');
vi.mock('sonner');

// Mock useNavigate and useLocation
const mockNavigate = vi.fn();
const mockLocation = { state: { from: { pathname: '/dashboard' } } };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

const mockSignUp = vi.fn();
const mockSignInWithGoogle = vi.fn();

describe('SignUp Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      signUp: mockSignUp,
      signInWithGoogle: mockSignInWithGoogle,
    });
    (toast.success as any) = vi.fn();
    (toast.error as any) = vi.fn();
  });

  const renderSignUp = () => {
    return render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
  };

  describe('UI/UX Validation', () => {
    it('should have light blue background (#F0F4FF)', () => {
      renderSignUp();
      const container = document.querySelector('.min-h-screen');
      expect(container).toHaveClass('bg-[#F0F4FF]');
    });

    it('should have dark navbar (#1F2937)', () => {
      renderSignUp();
      const navbar = document.querySelector('nav');
      expect(navbar).toHaveClass('bg-[#1F2937]');
    });

    it('should have white card with shadow', () => {
      renderSignUp();
      const card = document.querySelector('.bg-white.rounded-lg.shadow-lg');
      expect(card).toBeInTheDocument();
    });

    it('should have white input backgrounds with gray borders', () => {
      renderSignUp();
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        expect(input).toHaveClass('bg-white', 'border-gray-300', 'text-gray-900');
      });
    });

    it('should have purple gradient button', () => {
      renderSignUp();
      const submitButton = screen.getByText('Create account');
      expect(submitButton).toHaveClass('bg-gradient-to-r', 'from-purple-600', 'to-blue-500');
    });

    it('should have black Google button', () => {
      renderSignUp();
      const googleButton = screen.getByText('Sign up with Google');
      expect(googleButton).toHaveClass('bg-black');
    });

    it('should display PranVeda logo with star icon', () => {
      renderSignUp();
      const logo = document.querySelector('.bg-purple-600.rounded-lg');
      expect(logo).toBeInTheDocument();
      expect(screen.getByText('PranVeda')).toBeInTheDocument();
    });
  });

  describe('Password Strength Indicator', () => {
    it('should show password strength when password is entered', async () => {
      renderSignUp();
      const passwordInput = screen.getByPlaceholderText('Create a strong password');
      
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
      
      await waitFor(() => {
        expect(screen.getByText('Password strength:')).toBeInTheDocument();
        expect(screen.getByText('Weak')).toBeInTheDocument();
      });
    });

    it('should show red progress bar for weak password', async () => {
      renderSignUp();
      const passwordInput = screen.getByPlaceholderText('Create a strong password');
      
      fireEvent.change(passwordInput, { target: { value: 'a' } });
      
      await waitFor(() => {
        const progressBar = document.querySelector('.bg-red-500');
        expect(progressBar).toBeInTheDocument();
      });
    });

    it('should show green checkmarks for met criteria', async () => {
      renderSignUp();
      const passwordInput = screen.getByPlaceholderText('Create a strong password');
      
      fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
      
      await waitFor(() => {
        const checkmarks = document.querySelectorAll('.text-green-600');
        expect(checkmarks.length).toBeGreaterThan(0);
      });
    });

    it('should show red X marks for unmet criteria', async () => {
      renderSignUp();
      const passwordInput = screen.getByPlaceholderText('Create a strong password');
      
      fireEvent.change(passwordInput, { target: { value: 'a' } });
      
      await waitFor(() => {
        const xMarks = document.querySelectorAll('.text-red-600');
        expect(xMarks.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error when passwords do not match', async () => {
      renderSignUp();
      const passwordInput = screen.getByPlaceholderText('Create a strong password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
      const submitButton = screen.getByText('Create account');
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should show error for password shorter than 8 characters', async () => {
      renderSignUp();
      const fullNameInput = screen.getByPlaceholderText('John Doe');
      const emailInput = screen.getByPlaceholderText('john@example.com');
      const passwordInput = screen.getByPlaceholderText('Create a strong password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
      const termsCheckbox = screen.getByLabelText(/I agree to the/);
      const submitButton = screen.getByText('Create account');
      
      fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
      fireEvent.click(termsCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Make sure your password is at least 8 characters long/)).toBeInTheDocument();
      });
    });

    it('should show error when terms are not agreed', async () => {
      renderSignUp();
      const fullNameInput = screen.getByPlaceholderText('John Doe');
      const emailInput = screen.getByPlaceholderText('john@example.com');
      const passwordInput = screen.getByPlaceholderText('Create a strong password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
      const submitButton = screen.getByText('Create account');
      
      fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please agree to the Terms and Conditions')).toBeInTheDocument();
      });
    });
  });

  describe('Server Error Handling', () => {
    it('should show server connection error when signup fails', async () => {
      mockSignUp.mockRejectedValueOnce(new Error('Connection failed'));
      
      renderSignUp();
      const fullNameInput = screen.getByPlaceholderText('John Doe');
      const emailInput = screen.getByPlaceholderText('john@example.com');
      const passwordInput = screen.getByPlaceholderText('Create a strong password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
      const termsCheckbox = screen.getByLabelText(/I agree to the/);
      const submitButton = screen.getByText('Create account');
      
      fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(termsCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Unable to connect to server. Please ensure the backend server is running on port 5000/)).toBeInTheDocument();
      });
    });
  });

  describe('Successful Signup', () => {
    it('should call signUp with correct parameters and navigate to dashboard', async () => {
      mockSignUp.mockResolvedValueOnce({});
      
      renderSignUp();
      const fullNameInput = screen.getByPlaceholderText('John Doe');
      const emailInput = screen.getByPlaceholderText('john@example.com');
      const passwordInput = screen.getByPlaceholderText('Create a strong password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
      const termsCheckbox = screen.getByLabelText(/I agree to the/);
      const submitButton = screen.getByText('Create account');
      
      fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(termsCheckbox);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('john@example.com', 'password123', 'John Doe');
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        expect(toast.success).toHaveBeenCalledWith('Account created successfully!');
      });
    });
  });

  describe('Google Signup', () => {
    it('should call signInWithGoogle when Google button is clicked', async () => {
      mockSignInWithGoogle.mockResolvedValueOnce({});
      
      renderSignUp();
      const googleButton = screen.getByText('Sign up with Google');
      fireEvent.click(googleButton);
      
      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility when eye icon is clicked', () => {
      renderSignUp();
      const passwordInput = screen.getByPlaceholderText('Create a strong password');
      const eyeButton = passwordInput.parentElement?.querySelector('button');
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      fireEvent.click(eyeButton!);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      fireEvent.click(eyeButton!);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Navigation Links', () => {
    it('should have correct navigation links in navbar', () => {
      renderSignUp();
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Meditate')).toBeInTheDocument();
      expect(screen.getByText('Workout')).toBeInTheDocument();
      expect(screen.getByText('AI Coach')).toBeInTheDocument();
    });

    it('should have sign in link at bottom', () => {
      renderSignUp();
      const signInLink = screen.getByText('Sign in');
      expect(signInLink.closest('a')).toHaveAttribute('href', '/auth/signin');
    });
  });
});
