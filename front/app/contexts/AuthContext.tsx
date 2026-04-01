import React, { createContext, useContext, useState } from 'react';

export type User = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  user: User | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mns_auth') === 'true';
  });
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('mns_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('mns_auth', 'true');
    localStorage.setItem('mns_user', JSON.stringify(userData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('mns_auth');
    localStorage.removeItem('mns_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
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
