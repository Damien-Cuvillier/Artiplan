// src/store/chantierStore.js
import { create } from 'zustand';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeader } from '../config/api';

export const useChantierStore = create((set, get) => ({
  chantiers: [],
  currentChantier: null,
  interventions: [],
  isLoading: false,
  error: null,

  // Récupérer tous les chantiers
  fetchChantiers: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/chantiers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des chantiers');
      }
  
      const responseData = await response.json();
      console.log('Données reçues du serveur:', responseData);
  
      // Vérifiez la structure de la réponse
      const chantiers = responseData.data?.chantiers || responseData.data || responseData;
      console.log('Chantiers extraits:', chantiers);
  
      set({ 
        chantiers: Array.isArray(chantiers) ? chantiers : [], 
        isLoading: false 
      });
  
      return chantiers;
    } catch (error) {
      console.error('Erreur dans fetchChantiers:', error);
      set({ error: error.message, isLoading: false });
      return [];
    }
  },

  // Récupérer un chantier par son ID
  fetchChantierById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      console.log(`Tentative de récupération du chantier avec l'ID: ${id}`);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHANTIERS}/${id}`, {
        headers: getAuthHeader(),
      });

      console.log('Réponse du serveur:', response.status, response.statusText);
      
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
      console.log('Données du chantier reçues:', data);
      
      // Vérifier si les données sont dans data.data (convention REST)
      const chantier = data.data?.chantier || data;
      
      set({ currentChantier: chantier, isLoading: false });
      return chantier;
    } catch (error) {
      console.error('Erreur dans fetchChantierById:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
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

    const responseData = await response.json();
    
    // Mettez à jour la liste des chantiers
    await get().fetchChantiers();
    
    return responseData.data.chantier;
  } catch (error) {
    console.error('Erreur createChantier:', error);
    set({ error: error.message, isLoading: false });
    throw error;
  } finally {
    set({ isLoading: false });
  }
},

  // Mettre à jour un chantier
  updateChantier: async (id, chantierData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHANTIERS}/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(chantierData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du chantier');
      }

      const updatedChantier = await response.json();
      set(state => ({
        chantiers: state.chantiers.map(chantier => 
          chantier._id === id ? updatedChantier : chantier
        ),
        currentChantier: updatedChantier,
        isLoading: false
      }));
      return updatedChantier;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Supprimer un chantier
  deleteChantier: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHANTIERS}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression du chantier');
      }

      set(state => ({
        chantiers: state.chantiers.filter(chantier => chantier._id !== id),
        currentChantier: state.currentChantier?._id === id ? null : state.currentChantier,
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Récupérer toutes les interventions depuis l'API
  fetchAllInterventions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.INTERVENTIONS}`, {
        headers: getAuthHeader(),
      });

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

    const data = await response.json();
    console.log('Réponse de l\'API:', { status: response.status, data });

    if (!response.ok) {
      throw new Error(data.message || `Erreur HTTP: ${response.status}`);
    }

    // S'assurer que nous retournons toujours un tableau
    const interventions = Array.isArray(data.data?.interventions) 
      ? data.data.interventions 
      : (Array.isArray(data.data) ? data.data : []);
    
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
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.INTERVENTIONS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(interventionData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de l\'intervention');
      }
  
      const newIntervention = await response.json();
      set(state => ({
        interventions: [...state.interventions, newIntervention],
        isLoading: false
      }));
      return newIntervention;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Mettre à jour une intervention
  updateIntervention: async (id, interventionData) => {
    console.log('URL de la requête:', `${API_BASE_URL}${API_ENDPOINTS.INTERVENTIONS}/${id}`);
  console.log('Headers:', getAuthHeader());
  console.log('Données envoyées:', interventionData);
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.INTERVENTIONS}/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify(interventionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour de l\'intervention');
      }

      const updatedIntervention = await response.json();
      set(state => ({
        interventions: state.interventions.map(intervention =>
          intervention._id === id ? updatedIntervention : intervention
        ),
        isLoading: false
      }));
      return updatedIntervention;
    } catch (error) {
      set({ error: error.message, isLoading: false });
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