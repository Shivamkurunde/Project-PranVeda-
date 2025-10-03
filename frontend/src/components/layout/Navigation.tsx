import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AudioButton } from '@/components/common/AudioButton';
import { Home, Brain, Dumbbell, MessageCircle, User, Sparkles, BarChart3, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to home page after sign out
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const navItems = user ? [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/meditate', icon: Brain, label: 'Meditate' },
    { path: '/workout', icon: Dumbbell, label: 'Workout' },
    { path: '/ai-coach', icon: MessageCircle, label: 'AI Coach' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/profile', icon: User, label: 'Profile' }
  ] : [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/auth/signin', icon: User, label: 'Sign In' },
    { path: '/auth/signup', icon: Sparkles, label: 'Sign Up' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-poppins text-gradient-primary">
              PranVeda
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300',
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile Section */}
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white font-medium">
                  {user.full_name || user.email}
                </span>
              </div>
              <button 
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          ) : (
            // Sign Up and Sign In buttons removed
            <div></div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;