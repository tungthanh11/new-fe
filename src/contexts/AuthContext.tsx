/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '../firebase';
import { User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setCurrentUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || '',
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
      await signInWithPopup(auth, provider);
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
      await signInWithPopup(auth, provider);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};