import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      // Connexion (mockée pour l'instant)
      login: async (email) => {
        set({ isLoading: true })
        
        // Simulation d'une API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock user - à remplacer par vraie API plus tard
        const mockUser = {
          id: 1,
          email: email,
          name: email.split('@')[0],
          role: 'admin'
        }
        
        const mockToken = 'mock-jwt-token-' + Date.now()
        
        set({ 
          user: mockUser, 
          token: mockToken, 
          isLoading: false 
        })
        
        return { success: true }
      },

      // Inscription (mockée)
      signup: async (name, email) => {
        set({ isLoading: true })
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockUser = {
          id: Date.now(),
          email: email,
          name: name,
          role: 'user'
        }
        
        const mockToken = 'mock-jwt-token-' + Date.now()
        
        set({ 
          user: mockUser, 
          token: mockToken, 
          isLoading: false 
        })
        
        return { success: true }
      },

      // Déconnexion
      logout: () => {
        set({ user: null, token: null })
      },

      // Vérification si utilisateur connecté
      isAuthenticated: () => {
        const { user, token } = get()
        return !!(user && token)
      }
    }),
    {
      name: 'auth-storage', // nom pour localStorage
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }) // ne persiste que user et token
    }
  )
)