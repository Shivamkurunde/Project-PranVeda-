import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '@/integrations/firebase/client';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loading: boolean;
  refreshToken: () => Promise<string | null>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get the Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Create/update user profile in Supabase via new backend
          try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                full_name: data.profile?.display_name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
              });
            } else {
              // Profile doesn't exist yet, it will be created on first API call
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
              });
            }
          } catch (error) {
            console.error('Failed to sync user with backend:', error);
            // Still set user even if backend sync fails
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
            });
          }
        } catch (error) {
          console.error('Error syncing user with backend:', error);
          // Still set user from Firebase even if backend sync fails
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // User profile will be created automatically on first API call
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Provide more specific error messages based on Firebase error codes
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address. Please sign up first.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled. Please contact support.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please wait before trying again.');
      } else {
        // Generic error for other cases
        throw error;
      }
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await userCredential.user.updateProfile({
        displayName: fullName
      });
      
      const idToken = await userCredential.user.getIdToken();
      
      // User profile will be created automatically on first API call
    } catch (error) {
      console.error('Sign up error:', error);
      
      // Provide more specific error messages based on Firebase error codes
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account already exists with this email address. Please sign in instead.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/password authentication is not enabled.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign-up popup was blocked by your browser.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-up was cancelled.');
      } else {
        // Generic error for other cases
        throw error;
      }
    }
  };

  const signOut = async () => {
    try {
      // Sign out from Firebase
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local state even if backend call fails
      setUser(null);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // User profile will be created automatically on first API call
    } catch (error) {
      console.error('Google sign in error:', error);
      
      // Provide more specific error messages for Google sign-in
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked by your browser. Please allow popups and try again.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Another sign-in popup is already open.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (error.code === 'auth/internal-error') {
        throw new Error('An internal error occurred. Please try again.');
      } else {
        // Generic error for other cases
        throw new Error('Google sign-in failed. Please try again.');
      }
    }
  };

  const refreshToken = async (): Promise<string | null> => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken(true);
    }
    return null;
  };

  const getIdToken = async (): Promise<string | null> => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    loading,
    refreshToken,
    getIdToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

