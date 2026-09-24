'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string, address?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'food-ordering-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const { token } = JSON.parse(stored);
        setToken(token);
        // Always re-fetch user from backend so role changes are reflected immediately
        api.auth.getMe()
          .then(data => {
            setUser(data.user);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: data.user, token }));
          })
          .catch(() => {
            // Token expired or backend down — clear auth
            localStorage.removeItem(AUTH_STORAGE_KEY);
            setToken(null);
          })
          .finally(() => setIsLoading(false));
        return;
      } catch (e) {
        console.error('Failed to load auth from storage');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    const data = await api.auth.login({ phone, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  };

  const register = async (name: string, phone: string, password: string, address?: string) => {
    const data = await api.auth.register({ name, phone, password, address });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}