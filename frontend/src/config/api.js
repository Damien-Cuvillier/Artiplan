// src/config/api.js
// URL dynamique selon l'environnement
let apiUrl = import.meta.env.VITE_API_URL || 'https://artiplan-production.up.railway.app';

// Nettoyer l'URL (supprimer le @ si présent)
if (apiUrl.startsWith('@')) {
  apiUrl = apiUrl.substring(1);
}

export const API_BASE_URL = apiUrl;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
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
  // Si l'image vient de localhost, on ne garde que le chemin relatif
  if (typeof imagePath === 'string' && imagePath.includes('localhost:5000/uploads/')) {
    return imagePath.replace(/^https?:\/\/localhost:5000/, '');
  }
  // Si c'est déjà une URL complète (autre que localhost), la retourner telle quelle
  if (typeof imagePath === 'string' && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath;
  }
  // Nettoyer le chemin
  let cleanPath = String(imagePath).trim();
  cleanPath = cleanPath.replace(/^\/+|\/+$/g, '');
  cleanPath = cleanPath.replace(/^uploads\//, '');
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
