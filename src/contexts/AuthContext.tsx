'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string, phone?: string, telegramUsername?: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  useEffect(() => {
    // auth_token is an httpOnly cookie (by design, for security) so it can't be read here.
    // The server middleware is the real authority on session validity; we just restore the
    // last-known user from localStorage for the client UI. If the session is actually invalid,
    // the next server round-trip (middleware) will redirect to /login.
    try {
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
      localStorage.removeItem('auth_user');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const publicPaths = ['/login', '/register', '/apply'];
    if (!isLoading && !user && pathname !== '/' && !publicPaths.some(path => pathname.startsWith(path))) {
      router.push('/login');
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // In a real App Router app, we should probably fetch the user profile from an /api/auth/me endpoint
      // For now, let's store basic info from the login response if provided, 
      // or set a flag so the layout can fetch it.
      
      // Assuming the API returns the user role and maybe some basic info
      const mockUser: User = {
        id: data.id || 'current-user',
        firstName: data.firstName || 'User',
        lastName: data.lastName || '',
        email: email,
        role: data.role || 'EMPLOYEE',
        isActive: true,
        createdAt: new Date().toISOString(),
        settings: {
          language: 'uz',
          dateFormat: 'dd.mm.yyyy',
          timeFormat: '24h',
          notifications: {
            email: true, push: true, interviewReminders: true, newApplications: true, assignmentGraded: true
          },
          theme: 'light'
        }
      };

      setUser(mockUser);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      showToast('Login successful', 'success');
      
      // Redirect based on role
      if (['ADMIN', 'HR_MANAGER', 'DIRECTOR', 'DEPARTMENT_HEAD'].includes(data.role)) {
        router.push('/dashboard/hr');
      } else if (data.role === 'CANDIDATE') {
        router.push('/dashboard/candidate');
      } else {
        router.push('/dashboard/employee');
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
      setIsLoading(false);
      throw err;
    }
    setIsLoading(false);
  };

  const register = async (firstName: string, lastName: string, email: string, password: string, phone?: string, telegramUsername?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password, phone, telegramUsername }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      showToast('Registration successful! Please sign in.', 'success');
      router.push('/login');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
      setIsLoading(false);
      throw err;
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    // auth_token is httpOnly, so it can only be cleared server-side.
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    showToast('Logged out', 'info');
    router.push('/login');
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR_MANAGER';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
