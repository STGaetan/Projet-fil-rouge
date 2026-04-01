import React, { createContext, useContext, useState, useCallback } from 'react';

export type User = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  user: User | null;
  token: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mns_token') !== null;
  });
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('mns_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem('mns_user');
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('mns_token');
  });

  const login = useCallback((userData: User, jwtToken: string) => {
    setIsAuthenticated(true);
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('mns_token', jwtToken);
    localStorage.setItem('mns_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('mns_token');
    localStorage.removeItem('mns_user');
    localStorage.removeItem('mns_auth');
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
