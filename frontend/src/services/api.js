// src/services/api.js
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Gestion des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Déconnexion si non autorisé
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
export const authService = {
  login: (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
  getProfile: () => api.get(API_ENDPOINTS.AUTH.ME)
};

export const chantierService = {
  getAll: () => api.get(API_ENDPOINTS.CHANTIERS),
  // autres méthodes...
};

export const userService = {
  // Met à jour le profil utilisateur avec gestion d'erreur
  updateProfile: async (data) => {
    try {
      const response = await api.patch(`${API_ENDPOINTS.USERS}/profile`, data);
      return response.data;
    } catch (error) {
      console.warn('Erreur lors de la mise à jour du profil, utilisation du stockage local', error);
      // Sauvegarde locale en cas d'erreur
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { data: updatedUser };
    }
  },
  
  // Met à jour les préférences de notification avec gestion d'erreur
  updateNotifications: async (data) => {
    try {
      const response = await api.patch(`${API_ENDPOINTS.USERS}/notifications`, { notifications: data });
      return response.data;
    } catch (error) {
      console.warn('Erreur lors de la mise à jour des notifications, utilisation du stockage local', error);
      // Sauvegarde locale en cas d'erreur
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { 
        ...user, 
        notifications: { ...(user.notifications || {}), ...data } 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { data: updatedUser };
    }
  },
  
  // Met à jour les préférences utilisateur avec gestion d'erreur
  updatePreferences: async (data) => {
    try {
      const response = await api.patch(`${API_ENDPOINTS.USERS}/preferences`, { preferences: data });
      return response.data;
    } catch (error) {
      console.warn('Erreur lors de la mise à jour des préférences, utilisation du stockage local', error);
      // Sauvegarde locale en cas d'erreur
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { 
        ...user, 
        preferences: { ...(user.preferences || {}), ...data } 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { data: updatedUser };
    }
  },
  
  // Récupère les paramètres utilisateur
  getSettings: async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.USERS}/settings`);
      return response.data;
    } catch (error) {
      console.warn('Erreur lors de la récupération des paramètres, utilisation du stockage local', error);
      // Récupération locale en cas d'erreur
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return { 
        data: {
          profile: {
            nom: user.nom || '',
            email: user.email || '',
            telephone: user.telephone || '',
            entreprise: user.entreprise || ''
          },
          notifications: user.notifications || {},
          preferences: user.preferences || {}
        } 
      };
    }
  }
};

export default api;