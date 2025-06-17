// src/store/authStore.js
import { create } from 'zustand';
import { API_BASE_URL } from '../config/api';

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
      isAuthenticated: false,
      error: null
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    const user = getStoredUser();
    
    if (!token || !user) {
      set({ isAuthenticated: false, user: null });
      return false;
    }

    // Si on a un token et un utilisateur en cache, on considère la session comme valide
    // sans appeler l'API /me qui n'existe pas
    set({ 
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
    
    return true;
  },

  // Initialiser l'authentification au chargement de l'application
  initializeAuth: () => {
    const token = localStorage.getItem('token');
    const user = getStoredUser();
    
    if (token && user) {
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });
      return { user, isAuthenticated: true };
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
      return { user: null, isAuthenticated: false };
    }
  },
  
  // Mettre à jour les informations de l'utilisateur
  updateUser: (updatedUser) => {
    const currentUser = getStoredUser();
    if (!currentUser) return;
    
    // Fusionner les données existantes avec les nouvelles
    const mergedUser = { ...currentUser, ...updatedUser };
    
    // Mettre à jour le localStorage
    localStorage.setItem('user', JSON.stringify(mergedUser));
    
    // Mettre à jour le state
    set({ user: mergedUser });
    
    return mergedUser;
  }
}));

// Ne pas initialiser automatiquement ici, laissons le composant racine le faire