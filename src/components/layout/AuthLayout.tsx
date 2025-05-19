
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  
  // Always call useEffect (no conditional usage)
  useEffect(() => {
    // Only redirect if not loading and user exists
    if (!loading && currentUser) {
      navigate('/');
    }
  }, [currentUser, loading, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render the layout if user exists and not loading
  // The useEffect will handle redirection
  if (currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side: Auth form */}
      <div className="flex items-center justify-center w-full p-4 lg:w-1/2">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Right side: Background and branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar items-center justify-center relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">AI Chat Assistant</h1>
          <p className="text-xl opacity-90 max-w-md">
            Access specialized chatbots for different domains. Get instant help with mathematics, law, medical, programming, business or science topics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
