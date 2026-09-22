import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 'admin-1',
    username: 'admin',
    name: 'Mess Owner',
    email: 'owner@srikarthikeyamess.com',
    role: 'ADMIN',
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('mess_auth_token') || 'demo_token');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('mess_auth_token');
    if (savedToken) {
      api.getMe()
        .then((u) => setUser(u))
        .catch(() => {
          // fallback to default mock admin if server offline
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(username, pass);
      localStorage.setItem('mess_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('mess_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
