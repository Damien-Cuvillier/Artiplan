// src/store/authStore.js
import { create } from 'zustand';
import { API_BASE_URL } from '../config/api';

// Fonction utilitaire pour obtenir l'utilisateur depuis le localStorage
const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Mode de développement temporaire
const DEV_MODE = false; // Mettre à false quand le backend est prêt

export const useAuthStore = create((set) => ({
  // Récupérer l'utilisateur du localStorage au chargement initial
  user: getStoredUser(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    // Mode de développement temporaire
    if (DEV_MODE) {
      console.log('Mode développement: simulation de connexion réussie');
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Créer un utilisateur de test
      const mockUser = {
        _id: 'dev-user-1',
        nom: 'Utilisateur Test',
        email: email,
        role: 'admin',
        entreprise: 'Entreprise Test',
        telephone: '0123456789'
      };
      
      const mockToken = 'dev-token-' + Date.now();
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      set({ 
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return { data: { user: mockUser }, token: mockToken };
    }
    
    try {
      console.log('Tentative de connexion avec:', { email, password: '***' });
      console.log('URL de connexion:', `${API_BASE_URL}/api/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      console.log('Réponse du serveur:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.log('Détails de l\'erreur:', errorData);
        } catch (parseError) {
          console.log('Impossible de parser la réponse d\'erreur:', parseError);
        }
        
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
      console.log('Données de connexion reçues:', data);
      
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
      console.error('Erreur de connexion complète:', error);
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
  },

  // Fonction d'inscription
  register: async (userData) => {
    set({ isLoading: true, error: null });
    
    // Mode de développement temporaire
    if (DEV_MODE) {
      console.log('Mode développement: simulation d\'inscription réussie');
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Créer un utilisateur de test
      const mockUser = {
        _id: 'dev-user-' + Date.now(),
        nom: userData.nom,
        email: userData.email,
        role: userData.role || 'user',
        entreprise: userData.entreprise || '',
        telephone: userData.telephone || ''
      };
      
      const mockToken = 'dev-token-' + Date.now();
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      set({ 
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return { data: { user: mockUser }, token: mockToken };
    }
    
    try {
      console.log('Tentative d\'inscription avec:', { ...userData, password: '***' });
      console.log('URL d\'inscription:', `${API_BASE_URL}/api/auth/register`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
  
      console.log('Réponse du serveur (inscription):', response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.log('Détails de l\'erreur (inscription):', errorData);
        } catch (parseError) {
          console.log('Impossible de parser la réponse d\'erreur (inscription):', parseError);
        }
        
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
      console.log('Données d\'inscription reçues:', data);
      
      // Connecter automatiquement l'utilisateur après l'inscription
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
      console.error('Erreur lors de l\'inscription complète:', error);
      set({ 
        error: error.message || 'Erreur lors de l\'inscription',
        isLoading: false
      });
      throw error;
    }
  },
}));

// Ne pas initialiser automatiquement ici, laissons le composant racine le faire
