// src/config/api.js
export const API_BASE_URL = 'http://localhost:5000'; // Même URL que dans api.js
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    ME: '/api/auth/me'
  },
  CHANTIERS: '/api/chantiers',
  INTERVENTIONS: '/api/interventions',
  USERS: '/api/users'
};

export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };