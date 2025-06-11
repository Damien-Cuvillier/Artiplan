// src/store/chantierStore.js
import { create } from 'zustand';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeader } from '../config/api';

// Cache pour les requêtes
const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_DELAY = 1000; // 1 seconde entre les requêtes

// Dernière requête par endpoint
const lastRequestTime = new Map();

// Fonction utilitaire pour gérer le rate limiting
const withRateLimit = async (endpoint, fn) => {
  const now = Date.now();
  const lastTime = lastRequestTime.get(endpoint) || 0;
  const timeSinceLastRequest = now - lastTime;
  
  // Attendre si nécessaire pour respecter le délai minimum entre les requêtes
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
  }
  
  // Mettre à jour le temps de la dernière requête
  lastRequestTime.set(endpoint, Date.now());
  
  try {
    return await fn();
  } catch (error) {
    if (error.message.includes('429')) {
      // En cas de 429, attendre plus longtemps avant de réessayer
      console.warn('Rate limit atteint, attente avant nouvel essai...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 secondes d'attente
      return withRateLimit(endpoint, fn);
    }
    throw error;
  }
};

export const useChantierStore = create((set, get) => ({
  chantiers: [],
  currentChantier: null,
  interventions: [],
  isLoading: false,
  error: null,
  rateLimitExceeded: false,
  retryAfter: null,

  // Fonction utilitaire pour gérer les réponses d'erreur
  handleApiError: async (response) => {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 5;
      set({ 
        error: `Trop de requêtes. Réessayez dans ${retryAfter} secondes.`,
        rateLimitExceeded: true,
        retryAfter: parseInt(retryAfter, 10)
      });
      
      // Attendre avant de permettre une nouvelle tentative
      await new Promise(resolve => 
        setTimeout(resolve, retryAfter * 1000)
      );
      
      set({ rateLimitExceeded: false, retryAfter: null });
      return true;
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
    }
    
    return false;
  },

  // Récupérer tous les chantiers avec cache
  fetchChantiers: async (forceRefresh = false) => {
    const cacheKey = 'fetchChantiers';
    const cacheData = requestCache.get(cacheKey);
    const now = Date.now();
  
    // Si pas de forçage et que le cache est récent, utiliser le cache
    if (!forceRefresh && cacheData && (now - cacheData.timestamp < CACHE_DURATION)) {
      set({ chantiers: cacheData.data, isLoading: false });
      return cacheData.data;
    }
  
    set({ isLoading: true, error: null });
    
    return withRateLimit('fetchChantiers', async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/chantiers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
    
        // Gérer les erreurs de rate limiting
        const isRateLimited = await get().handleApiError(response);
        if (isRateLimited) {
          return get().fetchChantiers(forceRefresh);
        }
    
        const responseData = await response.json();
        const chantiers = responseData.data?.chantiers || responseData.data || responseData || [];
        
        // Mettre en cache
        requestCache.set(cacheKey, {
          data: chantiers,
          timestamp: Date.now()
        });
    
        set({ 
          chantiers: Array.isArray(chantiers) ? chantiers : [], 
          isLoading: false 
        });
        
        return chantiers;
      } catch (error) {
        console.error('Erreur dans fetchChantiers:', error);
        set({ error: error.message, isLoading: false });
        throw error;
      }
    });
  },

  // Récupérer un chantier par son ID avec cache
  fetchChantierById: async (id) => {
    const cacheKey = `chantier_${id}`;
    const cacheData = requestCache.get(cacheKey);
    const now = Date.now();

    // Retourner les données en cache si elles sont récentes
    if (cacheData && (now - cacheData.timestamp < CACHE_DURATION)) {
      set({ currentChantier: cacheData.data, isLoading: false });
      return cacheData.data;
    }

    set({ isLoading: true, error: null });
    
    return withRateLimit(`chantier_${id}`, async () => {
      try {
        console.log(`Tentative de récupération du chantier avec l'ID: ${id}`);
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHANTIERS}/${id}`, {
          headers: getAuthHeader(),
        });

        console.log('Réponse du serveur:', response.status, response.statusText);
        
        // Gérer les erreurs de rate limiting
        const isRateLimited = await get().handleApiError(response);
        if (isRateLimited) {
          return get().fetchChantierById(id); // Réessayer après l'attente
        }
        
        if (!response.ok) {
          let errorMessage = 'Erreur lors de la récupération du chantier';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
            console.error('Détails de l\'erreur:', errorData);
          } catch (e) {
            console.error('Erreur lors de la lecture du message d\'erreur:', e);
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        const chantier = data.data?.chantier || data;
        
        // Mettre en cache
        requestCache.set(cacheKey, {
          data: chantier,
          timestamp: Date.now()
        });
        
        set({ currentChantier: chantier, isLoading: false });
        return chantier;
      } catch (error) {
        console.error('Erreur dans fetchChantierById:', error);
        set({ error: error.message, isLoading: false });
        throw error;
      }
    });
  },

  // Créer un nouveau chantier
  createChantier: async (chantierData) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/chantiers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(chantierData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création du chantier');
      }
  
      const newChantier = await response.json();
      
      // Mise à jour optimiste de la liste des chantiers
      set(state => ({
        chantiers: [...state.chantiers, newChantier.data],
        isLoading: false
      }));
  
      return newChantier.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Mettre à jour un chantier
  updateChantier: async (id, chantierData) => {
    console.log('Début de la mise à jour du chantier', id, 'avec les données:', chantierData);
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHANTIERS}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chantierData),
      });

      console.log('Réponse de la mise à jour:', response.status, response.statusText);

      // Gérer les erreurs de rate limiting
      const isRateLimited = await get().handleApiError(response);
      if (isRateLimited) {
        console.log('Rate limit atteint, nouvelle tentative...');
        return get().updateChantier(id, chantierData);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur lors de la mise à jour du chantier:', errorText);
        let errorMessage = 'Erreur lors de la mise à jour du chantier';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Erreur lors du parsing de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      const updatedChantier = responseData.data?.chantier || responseData.data || responseData;
      
      console.log('Chantier mis à jour avec succès:', updatedChantier);
      
      // Mettre à jour la liste des chantiers et le chantier courant
      set(state => ({
        chantiers: state.chantiers.map(chantier => 
          chantier._id === id ? { ...updatedChantier } : chantier
        ),
        currentChantier: state.currentChantier?._id === id ? 
          { ...updatedChantier } : 
          state.currentChantier,
        isLoading: false
      }));
      
      // Invalider le cache pour forcer un rafraîchissement au prochain chargement
      requestCache.delete('fetchChantiers');
      
      return updatedChantier;
    } catch (error) {
      console.error('Erreur updateChantier:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    } finally {
      console.log('Fin de la mise à jour du chantier');
      set({ isLoading: false });
    }
  },

   // Supprimer un chantier
   deleteChantier: async (id) => {
    console.log('Début de la suppression du chantier', id);
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHANTIERS}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Réponse de la suppression:', response.status, response.statusText);

      // Gérer les erreurs de rate limiting
      const isRateLimited = await get().handleApiError(response);
      if (isRateLimited) {
        console.log('Rate limit atteint, nouvelle tentative...');
        return get().deleteChantier(id);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur lors de la suppression du chantier:', errorText);
        let errorMessage = 'Erreur lors de la suppression du chantier';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Erreur lors du parsing de la réponse d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }

      // Mettre à jour l'état local
      set(state => ({
        chantiers: state.chantiers.filter(chantier => chantier._id !== id),
        currentChantier: state.currentChantier?._id === id ? null : state.currentChantier,
        isLoading: false
      }));

      // Invalider le cache pour forcer un rafraîchissement au prochain chargement
      requestCache.delete('fetchChantiers');
      
      console.log('Chantier supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur deleteChantier:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    } finally {
      console.log('Fin de la suppression du chantier');
      set({ isLoading: false });
    }
  },

  // Récupérer toutes les interventions depuis l'API
  fetchAllInterventions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.INTERVENTIONS}`, {
        headers: getAuthHeader(),
      });

      // Gérer les erreurs de rate limiting
      const isRateLimited = await get().handleApiError(response);
      if (isRateLimited) {
        return get().fetchAllInterventions(); // Réessayer après l'attente
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des interventions');
      }

      const data = await response.json();
      const interventions = data.data?.interventions || data.data || data;
      
      // Mettre à jour le store avec les interventions
      set({ interventions, isLoading: false });
      return interventions;
      
    } catch (error) {
      console.error('Erreur dans fetchAllInterventions:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Récupérer toutes les interventions (depuis le store ou l'API si nécessaire)
  // Dans chantierStore.js
  getAllInterventions: async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token utilisé pour la requête:', token ? 'Présent' : 'Manquant');
      
      const response = await fetch(`${API_BASE_URL}/api/interventions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Gérer les erreurs de rate limiting
      const isRateLimited = await get().handleApiError(response);
      if (isRateLimited) {
        return get().getAllInterventions(); // Réessayer après l'attente
      }

      const data = await response.json();
      console.log('Réponse de l\'API:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.message || `Erreur HTTP: ${response.status}`);
      }

      // S'assurer que nous retournons toujours un tableau
      const interventions = Array.isArray(data.data?.interventions) 
        ? data.data.interventions 
        : (Array.isArray(data.data) ? data.data : []);
      
      // Log détaillé de la structure des interventions
      console.log('Détail complet des interventions reçues:');
      interventions.forEach((interv, index) => {
        console.group(`Intervention ${index} (${interv._id})`);
        console.log('Titre:', interv.titre);
        console.log('Toutes les propriétés:');
        
        // Afficher chaque propriété de l'intervention
        Object.entries(interv).forEach(([key, value]) => {
          console.log(`- ${key}:`, value);
        });
        
        console.groupEnd();
      });
      
      console.log(`${interventions.length} interventions chargées`);
      return interventions;
      
    } catch (error) {
      console.error('Erreur détaillée:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      throw error;
    }
  },

  // Récupérer les interventions d'un chantier
  fetchInterventionsByChantier: async (chantierId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.INTERVENTIONS}/chantier/${chantierId}`,
        { headers: getAuthHeader() }
      );

      // Gérer les erreurs de rate limiting
      const isRateLimited = await get().handleApiError(response);
      if (isRateLimited) {
        return get().fetchInterventionsByChantier(chantierId); // Réessayer après l'attente
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des interventions');
      }

      const data = await response.json();
      
      // S'assurer que nous avons un tableau d'interventions
      const interventions = Array.isArray(data.data?.interventions) 
        ? data.data.interventions 
        : [];
      
      set({ interventions, isLoading: false });
      return interventions;
      
    } catch (error) {
      console.error('Erreur dans fetchInterventionsByChantier:', error);
      set({ error: error.message, interventions: [], isLoading: false });
      throw error;
    }
  },

  // Ajouter une intervention
  addIntervention: async (interventionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/interventions/chantier/${interventionData.chantier_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(interventionData)
      });
  
      // Gérer les erreurs de rate limiting
      const isRateLimited = await get().handleApiError(response);
      if (isRateLimited) {
        return get().addIntervention(interventionData); // Réessayer après l'attente
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de l\'intervention');
      }
  
      const newIntervention = await response.json();
      set(state => ({
        interventions: [...state.interventions, newIntervention.data.intervention],
        isLoading: false
      }));
      return newIntervention.data.intervention;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Mettre à jour une intervention
  updateIntervention: async (interventionData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/interventions/${interventionData._id}`, {
        method: 'PATCH',  // Changer de PUT à PATCH
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(interventionData)
      });
  
      // Gérer les erreurs de rate limiting
      const isRateLimited = await get().handleApiError(response);
      if (isRateLimited) {
        return get().updateIntervention(interventionData); // Réessayer après l'attente
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }
  
      const result = await response.json();
      // Accéder à result.data.intervention au lieu de result.data
      const updatedIntervention = result.data?.intervention || result.data || result;
  
      set(state => ({
        interventions: state.interventions.map(i => 
          i._id === updatedIntervention._id ? updatedIntervention : i
        )
      }));
  
      return updatedIntervention;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  },

  // Supprimer une intervention
  deleteIntervention: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/interventions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      // Gérer les erreurs de rate limiting
      const isRateLimited = await get().handleApiError(response);
      if (isRateLimited) {
        return get().deleteIntervention(id); // Réessayer après l'attente
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }
  
      // Mettre à jour l'état local
      set(state => ({
        interventions: state.interventions.filter(i => i._id !== id),
        isLoading: false
      }));
  
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));