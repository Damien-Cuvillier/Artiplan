import { create } from 'zustand'
import { mockChantiers } from '../data/chantiers'

export const useChantierStore = create((set, get) => ({
  chantiers: mockChantiers,
  currentChantier: null,
  interventions: [],
  isLoading: false,

  // Récupérer tous les chantiers
  fetchChantiers: async () => {
    set({ isLoading: true })
    // Simulation API call
    await new Promise(resolve => setTimeout(resolve, 500))
    set({ chantiers: mockChantiers, isLoading: false })
  },

  // Récupérer un chantier par ID
  fetchChantierById: async (id) => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const chantier = mockChantiers.find(c => c.id === parseInt(id))
    set({ currentChantier: chantier, isLoading: false })
    return chantier
  },

  // Ajouter une intervention
  addIntervention: (intervention) => {
    const newIntervention = {
      ...intervention,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
    
    set(state => ({
      interventions: [...state.interventions, newIntervention]
    }))
    
    return newIntervention
  },

  // Mettre à jour une intervention
  updateIntervention: (id, updatedIntervention) => {
    set(state => ({
      interventions: state.interventions.map(intervention => 
        intervention.id === id 
          ? { ...intervention, ...updatedIntervention }
          : intervention
      )
    }))
  },

  // Récupérer les interventions d'un chantier
  getInterventionsByChantier: (chantierId) => {
    const { interventions } = get()
    return interventions.filter(intervention => 
      intervention.chantierId === parseInt(chantierId)
    )
  }
}))