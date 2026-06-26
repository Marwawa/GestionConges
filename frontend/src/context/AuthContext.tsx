import React, { createContext, useContext, useState, useEffect } from 'react';
import { Utilisateur, AuthContextType } from '../types';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = authService.getToken();
    const storedUser = authService.getCurrentUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setIsAuthenticated(true);
    }
  }, []);

const login = async (email: string, password: string) => {
  try {
    const response = await authService.login(email, password);
    console.log('Réponse reçue:', response); // Pour déboguer
    
    if (response && response.token && response.utilisateur) {
      authService.setSession(response.token, response.utilisateur);
      setToken(response.token);
      setUser(response.utilisateur);
      setIsAuthenticated(true);
    } else {
      throw new Error('Réponse invalide du serveur');
    }
  } catch (error) {
    console.error('Erreur de login:', error);
    throw error;
  }
};

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};