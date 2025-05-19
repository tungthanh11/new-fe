
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Simulate loading the user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('chatbot_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user data', e);
        localStorage.removeItem('chatbot_user');
      }
    }
    setLoading(false);
  }, []);

  // Mock authentication functions
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check against mock data
      const user = mockUsers.find(u => u.email === email);
      
      if (user && password === 'password') { // Mock password check
        setCurrentUser(user);
        localStorage.setItem('chatbot_user', JSON.stringify(user));
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name}!`,
        });
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists in mock data
      if (mockUsers.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }
      
      // Create new mock user (in a real app, this would be an API call to Firebase)
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      };
      
      // In a real app, mockUsers would be updated via API
      // For demo, we'll just set the current user
      setCurrentUser(newUser);
      localStorage.setItem('chatbot_user', JSON.stringify(newUser));
      
      toast({
        title: "Account created",
        description: `Welcome, ${name}!`,
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentUser(null);
      localStorage.removeItem('chatbot_user');
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: err.message,
      });
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock Google auth response
      const user: User = {
        id: 'google-user-1',
        name: 'Google User',
        email: 'google@example.com',
        avatar: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
      };
      
      setCurrentUser(user);
      localStorage.setItem('chatbot_user', JSON.stringify(user));
      
      toast({
        title: "Google login successful",
        description: `Welcome, ${user.name}!`,
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Google login failed",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loginWithGithub = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock GitHub auth response
      const user: User = {
        id: 'github-user-1',
        name: 'GitHub User',
        email: 'github@example.com',
        avatar: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
      };
      
      setCurrentUser(user);
      localStorage.setItem('chatbot_user', JSON.stringify(user));
      
      toast({
        title: "GitHub login successful",
        description: `Welcome, ${user.name}!`,
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "GitHub login failed",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    signUp,
    logout,
    loginWithGoogle,
    loginWithGithub,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
