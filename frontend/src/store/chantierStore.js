import { create } from 'zustand'
import { mockChantiers } from '../data/chantiers'

// Récupérer les chantiers du localStorage ou utiliser les données mockées
const getInitialChantiers = () => {
  const savedChantiers = localStorage.getItem('chantiers')
  return savedChantiers ? JSON.parse(savedChantiers) : mockChantiers
}

export const useChantierStore = create((set, get) => ({
  chantiers: getInitialChantiers(),
  currentChantier: null,
  isLoading: false,

  // Ajouter un nouveau chantier
  addChantier: async (chantierData) => {
    set({ isLoading: true })
    
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const newChantier = {
      ...chantierData,
      id: Date.now(),
      interventions: [],
      images: [],
      progress: 0,
      status: 'planifie'
    }
    
    set(state => {
      const updatedChantiers = [...state.chantiers, newChantier]
      // Sauvegarder dans le localStorage
      localStorage.setItem('chantiers', JSON.stringify(updatedChantiers))
      return {
        chantiers: updatedChantiers,
        isLoading: false
      }
    })
    
    return newChantier
  },

  // Récupérer tous les chantiers
  fetchChantiers: async () => {
    set({ isLoading: true })
    
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Utiliser les données du localStorage
    const savedChantiers = localStorage.getItem('chantiers')
    set({ 
      chantiers: savedChantiers ? JSON.parse(savedChantiers) : get().chantiers,
      isLoading: false 
    })
  },

  // Récupérer un chantier par ID
  fetchChantierById: async (id) => {
    set({ isLoading: true })
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const chantier = get().chantiers.find(c => c.id === parseInt(id))
    set({ currentChantier: chantier, isLoading: false })
    return chantier
  },

  // Calculer la progression d'un chantier
  calculateProgress: (chantier) => {
    if (!chantier.interventions || chantier.interventions.length === 0) {
      return 0
    }

    const totalInterventions = chantier.interventions.length
    const completedInterventions = chantier.interventions.filter(
      i => i.status === 'terminee'
    ).length

    return Math.round((completedInterventions / totalInterventions) * 100)
  },

  // Mettre à jour la progression d'un chantier
  updateChantierProgress: (chantierId) => {
    set(state => {
      const chantier = state.chantiers.find(c => c.id === parseInt(chantierId))
      if (!chantier) return state

      const progress = get().calculateProgress(chantier)
      
      const updatedChantier = {
        ...chantier,
        progress,
        // Mettre à jour automatiquement le statut en fonction de la progression
        status: progress === 100 ? 'termine' : 
               progress > 0 ? 'en_cours' : 
               'planifie'
      }

      const updatedChantiers = state.chantiers.map(c => 
        c.id === parseInt(chantierId) ? updatedChantier : c
      )

      // Sauvegarder dans le localStorage
      localStorage.setItem('chantiers', JSON.stringify(updatedChantiers))

      return {
        ...state,
        chantiers: updatedChantiers,
        currentChantier: state.currentChantier?.id === parseInt(chantierId) ? updatedChantier : state.currentChantier
      }
    })
  },

  // Ajouter une nouvelle intervention
  addIntervention: async (interventionData) => {
    set({ isLoading: true })
    
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const newIntervention = {
      ...interventionData,
      id: Date.now()
    }
    
    set(state => {
      const updatedChantier = {
        ...state.currentChantier,
        interventions: [...(state.currentChantier.interventions || []), newIntervention]
      }
      
      const updatedChantiers = state.chantiers.map(c => 
        c.id === updatedChantier.id ? updatedChantier : c
      )
      
      // Sauvegarder dans le localStorage
      localStorage.setItem('chantiers', JSON.stringify(updatedChantiers))
      
      return {
        chantiers: updatedChantiers,
        currentChantier: updatedChantier,
        isLoading: false
      }
    })

    // Mettre à jour la progression
    get().updateChantierProgress(interventionData.chantierId)
    
    return newIntervention
  },

  // Mettre à jour une intervention
  updateIntervention: async (interventionId, interventionData) => {
    set({ isLoading: true })
    
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 300))
    
    set(state => {
      const updatedChantier = {
        ...state.currentChantier,
        interventions: state.currentChantier.interventions.map(i => 
          i.id === interventionId ? { ...i, ...interventionData } : i
        )
      }
      
      const updatedChantiers = state.chantiers.map(c => 
        c.id === updatedChantier.id ? updatedChantier : c
      )
      
      // Sauvegarder dans le localStorage
      localStorage.setItem('chantiers', JSON.stringify(updatedChantiers))
      
      return {
        chantiers: updatedChantiers,
        currentChantier: updatedChantier,
        isLoading: false
      }
    })

    // Mettre à jour la progression
    get().updateChantierProgress(state.currentChantier.id)
  },

  // Récupérer les interventions d'un chantier
  getInterventionsByChantier: (chantierId) => {
    const { chantiers } = get()
    const chantier = chantiers.find(c => c.id === parseInt(chantierId))
    return chantier?.interventions || []
  },

  // Récupérer toutes les interventions
  getAllInterventions: () => {
    const { chantiers } = get()
    return chantiers.reduce((allInterventions, chantier) => {
      const interventions = (chantier.interventions || []).map(intervention => ({
        ...intervention,
        chantierId: chantier.id,
        chantierName: chantier.name
      }))
      return [...allInterventions, ...interventions]
    }, [])
  },

  // Mettre à jour un chantier
  updateChantier: async (chantierId, chantierData) => {
    set({ isLoading: true })
    
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 300))
    
    set(state => {
      const updatedChantier = {
        ...state.chantiers.find(c => c.id === chantierId),
        ...chantierData,
        // Préserver les champs qui ne doivent pas être écrasés
        id: chantierId,
        interventions: state.chantiers.find(c => c.id === chantierId)?.interventions || [],
        images: state.chantiers.find(c => c.id === chantierId)?.images || []
      }
      
      const updatedChantiers = state.chantiers.map(c => 
        c.id === chantierId ? updatedChantier : c
      )
      
      // Sauvegarder dans le localStorage
      localStorage.setItem('chantiers', JSON.stringify(updatedChantiers))
      
      return {
        chantiers: updatedChantiers,
        currentChantier: updatedChantier,
        isLoading: false
      }
    })
  },

  // Supprimer un chantier
  deleteChantier: async (chantierId) => {
    set({ isLoading: true })
    
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 300))
    
    set(state => {
      const updatedChantiers = state.chantiers.filter(c => c.id !== parseInt(chantierId))
      
      // Sauvegarder dans le localStorage
      localStorage.setItem('chantiers', JSON.stringify(updatedChantiers))
      
      return {
        chantiers: updatedChantiers,
        currentChantier: state.currentChantier?.id === parseInt(chantierId) ? null : state.currentChantier,
        isLoading: false
      }
    })
  },
}))