// src/config/api.js
export const API_BASE_URL = 'http://localhost:5000';

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
  if (imagePath.startsWith('http')) {
    // Vérifier si c'est une URL avec un mauvais domaine
    try {
      const url = new URL(imagePath);
      if (url.origin !== new URL(API_BASE_URL).origin) {
        // Si le domaine est différent, reconstruire l'URL avec le bon domaine
        return `${API_BASE_URL}${url.pathname.startsWith('/') ? '' : '/'}${url.pathname}`;
      }
    } catch (e) {
      console.error('Erreur lors du parsing de l\'URL de l\'image:', imagePath, e);
    }
    return imagePath;
  }
  
  // Nettoyer le chemin pour éviter les doublons
  let cleanPath = imagePath;
  while (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  // Construire l'URL complète
  const imageUrl = `${API_BASE_URL}/${cleanPath}`;
  
  return imageUrl;
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