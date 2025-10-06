import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sotuvchi' | 'omborchi' | 'hisobchi';
  phone: string;
  branch_id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);


  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // For demo purposes, use simple email/password check
      // In production, you would use Supabase Auth
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error || !data) {
        return false;
      }

      // Simple password check (in production, use proper hashing)
      if (password !== '123456') {
        return false;
      }

      // Set user in state and localStorage
      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        branch_id: data.branch_id
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}