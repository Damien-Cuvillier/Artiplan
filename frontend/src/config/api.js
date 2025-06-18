// src/config/api.js
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://artiplan-production.up.railway.app'; // URL dynamique selon l'environnement

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    ME: '/api/auth/me'
  },
  CHANTIERS: '/api/chantiers',
  INTERVENTIONS: '/api/interventions',
  USERS: '/api/users',
  UPLOAD: '/api/upload/image'
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // Si c'est déjà une URL complète, la retourner telle quelle
  if (typeof imagePath === 'string' && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath;
  }
  
  // Nettoyer le chemin
  let cleanPath = String(imagePath).trim();
  
  // Supprimer tous les préfixes /uploads/ pour éviter les doublons
  cleanPath = cleanPath.replace(/^\/+|\/+$/g, ''); // Supprimer les slashes au début et à la fin
  cleanPath = cleanPath.replace(/^uploads\//, ''); // Supprimer le préfixe uploads/ s'il existe
  
  // Construire l'URL complète avec le proxy
  return `/uploads/${cleanPath}`;
};

export const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Important pour les cookies d'authentification
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de la requête');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur fetchWithAuth:', error);
    throw error;
  }
};
