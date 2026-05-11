import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium: boolean;
  generationsLeft: number | string;
  totalGenerations: number;
  premiumExpiry?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await auth.me();
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const response = await auth.login({ email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
    return response.data;
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await auth.register({ name, email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
    return response.data;
  };

  const logout = async () => {
    await auth.logout();
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser
  };
};
