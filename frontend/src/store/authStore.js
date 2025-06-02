// src/store/authStore.js
import { create } from 'zustand';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeader } from '../config/api';

// Fonction utilitaire pour obtenir l'utilisateur depuis le localStorage
const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const useAuthStore = create((set) => ({
  // Récupérer l'utilisateur du localStorage au chargement initial
  user: getStoredUser(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la connexion');
      }
  
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      set({ 
        user: data.data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      set({ 
        error: error.message || 'Erreur de connexion',
        isLoading: false
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return false;
    }
  
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.ME}`, {
        headers: getAuthHeader(),
      });
  
      if (!response.ok) {
        throw new Error('Session expirée');
      }
  
      const userData = await response.json();
      console.log('Utilisateur récupéré:', userData); // Vérifiez cette sortie
      
      localStorage.setItem('user', JSON.stringify(userData));
      set({ 
        user: userData,
        isAuthenticated: true,
        token: localStorage.getItem('token'),
        error: null
      });
      return true;
    } catch (error) {
      console.error('Erreur de vérification d\'authentification:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        error: error.message
      });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Initialiser l'authentification au chargement de l'application
  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      return await useAuthStore.getState().checkAuth();
    }
    return false;
  }
}));

// Initialiser l'authentification au chargement du store
useAuthStore.getState().initializeAuth();