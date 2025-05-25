/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '../firebase';
import { User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import axios from 'axios';

// Create axios instance for API requests
const api = axios.create({
  baseURL: 'http://localhost:3001',
});

// Function to set auth token in axios headers
const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Also set for regular axios if you're using it elsewhere
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Function to get and store Firebase JWT token
const getAndStoreToken = async (user: FirebaseUser) => {
  try {
    const token = await user.getIdToken();
    localStorage.setItem('authToken', token);
    setAuthToken(token);
    return token;
  } catch (error) {
    console.error('Error getting Firebase token:', error);
    throw error;
  }
};

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  api: typeof api; // Export api instance for use in components
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

  // Function to setup automatic token refresh
  const setupTokenRefresh = (user: FirebaseUser) => {
    // Refresh token every 50 minutes (before 1-hour expiry)
    const refreshInterval = setInterval(async () => {
      try {
        await getAndStoreToken(user);
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Handle token refresh failure
        await logout();
      }
    }, 50 * 60 * 1000); // 50 minutes

    return refreshInterval;
  };

  useEffect(() => {
    let tokenRefreshInterval: NodeJS.Timeout;
    
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in
        setCurrentUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || '',
        });
        
        // Get and store JWT token
        try {
          await getAndStoreToken(firebaseUser);
          // Setup automatic token refresh
          tokenRefreshInterval = setupTokenRefresh(firebaseUser);
        } catch (error) {
          console.error('Failed to get token:', error);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        // Clear token and headers
        localStorage.removeItem('authToken');
        setAuthToken(null);
        // Clear refresh interval
        if (tokenRefreshInterval) {
          clearInterval(tokenRefreshInterval);
        }
      }
      setLoading(false);
    });

    // Initialize auth token on app startup
    const initializeAuth = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        setAuthToken(token);
      }
    };
    
    initializeAuth();

    return () => {
      unsubscribe();
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get and store JWT token
      await getAndStoreToken(user);
      
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn trở lại!",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Đăng nhập thất bại",
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      await updateProfile(firebaseUser, { displayName: name });
      
      // Get and store JWT token after signup
      await getAndStoreToken(firebaseUser);
      
      toast({
        title: "Tài khoản đã được tạo",
        description: `Chào mừng, ${name}!`,
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Đăng ký thất bại",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear token and headers before signing out
      localStorage.removeItem('authToken');
      setAuthToken(null);
      
      await signOut(auth);
      toast({
        title: "Đã đăng xuất",
        description: "Bạn đã đăng xuất thành công",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Đăng xuất thất bại",
        description: err.message,
      });
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Get and store JWT token
      await getAndStoreToken(user);
      
      toast({
        title: "Đăng nhập Google thành công",
        description: "Chào mừng bạn!",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Đăng nhập Google thất bại",
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
      const provider = new GithubAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Get and store JWT token
      await getAndStoreToken(user);
      
      toast({
        title: "Đăng nhập GitHub thành công",
        description: "Chào mừng bạn!",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Đăng nhập GitHub thất bại",
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
    api, // Provide api instance through context
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export the api instance for direct use if needed
export { api };