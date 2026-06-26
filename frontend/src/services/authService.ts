import api from './api';
import { LoginResponse, Utilisateur } from '../types';

export const authService = {
  login: async (email: string, motDePasse: string): Promise<LoginResponse> => {
    const response = await api.post('/Auth/login', { email, motDePasse });
    return response.data;
  },

  forgotPassword: (data: { email: string; cinOuMatricule: string; telephone: string }) =>
    api.post('/Notifications/mot-de-passe-oublie', { email: data.email }),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): Utilisateur | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  setSession: (token: string, user: Utilisateur) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
};
