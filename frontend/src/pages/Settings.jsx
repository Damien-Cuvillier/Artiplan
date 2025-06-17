import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { Settings as SettingsIcon, User, Bell, Save, AlertCircle, CheckCircle } from 'lucide-react'
import { userService } from '../services/api'
import { toast } from 'react-toastify'

const Settings = () => {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  
  // États pour les différents paramètres
  const [profileData, setProfileData] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    entreprise: user?.entreprise || ''
  })
  
  const [notifications, setNotifications] = useState({
    email: {
      enabled: user?.notifications?.email?.enabled ?? true,
      newIntervention: user?.notifications?.email?.newIntervention ?? true,
      chantierUpdated: user?.notifications?.email?.chantierUpdated ?? true,
      deadlineReminder: user?.notifications?.email?.deadlineReminder ?? true,
      weeklyReport: user?.notifications?.email?.weeklyReport ?? false
    },
    inApp: {
      enabled: user?.notifications?.inApp?.enabled ?? true,
      all: user?.notifications?.inApp?.all ?? true
    },
    reminders: {
      beforeDeadline: user?.notifications?.reminders?.beforeDeadline ?? 24,
      dailyDigest: user?.notifications?.reminders?.dailyDigest ?? '08:00',
      timezone: user?.notifications?.reminders?.timezone ?? 'Europe/Paris'
    }
  });

  
  const [preferences, setPreferences] = useState({
    uniteDistance: user?.preferences?.uniteDistance || 'km',
    formatDate: user?.preferences?.formatDate || 'dd/mm/yyyy',
    heureDebut: user?.preferences?.heureDebut || '08:00',
    heureFin: user?.preferences?.heureFin || '17:00',
    affichageCartes: user?.preferences?.affichageCartes || 'satellite',
    exportFormat: user?.preferences?.exportFormat || 'pdf'
  })

  // Charger les paramètres utilisateur au montage
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        // Si l'utilisateur a déjà des données, on les utilise
        if (user) {
          setProfileData({
            nom: user.nom || '',
            email: user.email || '',
            telephone: user.telephone || '',
            entreprise: user.entreprise || ''
          });
          
          if (user.notifications) {
            setNotifications(prev => ({
              ...prev,
              ...user.notifications
            }));
          }
          
          if (user.preferences) {
            setPreferences(prev => ({
              ...prev,
              ...user.preferences
            }));
          }
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error)
        toast.error('Erreur lors du chargement des paramètres')
      }
    }
    
    loadUserSettings()
  }, [user])

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      
      let result;
      
      // Sauvegarder en fonction de l'onglet actif
      switch (activeTab) {
        case 'profile':
          result = await userService.updateProfile(profileData);
          updateUser(result.data);
          break;
          
        case 'notifications':
          result = await userService.updateNotifications(notifications);
          updateUser(result.data);
          break;
          
        case 'preferences':
          result = await userService.updatePreferences(preferences);
          updateUser(result.data);
          break;
      }
      
      toast.success('Paramètres enregistrés avec succès', {
        icon: <CheckCircle className="text-green-500" />
      });
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue lors de la sauvegarde';
      setSaveError(errorMessage);
      
      toast.error(errorMessage, {
        icon: <AlertCircle className="text-red-500" />
      });
      
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = (section, field, value) => {
    setNotifications(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Préférences', icon: SettingsIcon },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            Paramètres
          </h1>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {/* Profil */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Informations du profil</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={profileData.nom}
                      onChange={(e) => setProfileData({...profileData, nom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={profileData.telephone}
                      onChange={(e) => setProfileData({...profileData, telephone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entreprise
                    </label>
                    <input
                      type="text"
                      value={profileData.entreprise}
                      onChange={(e) => setProfileData({...profileData, entreprise: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Préférences de notification</h3>
                  
                  {/* Notifications par email */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Notifications par email</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={notifications.email.enabled}
                          onChange={(e) => handleNotificationChange('email', 'enabled', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    {notifications.email.enabled && (
                      <div className="space-y-2 pl-6">
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600"
                            checked={notifications.email.newIntervention}
                            onChange={(e) => handleNotificationChange('email', 'newIntervention', e.target.checked)}
                          />
                          <span>Nouvelles interventions</span>
                        </label>
                        
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600"
                            checked={notifications.email.chantierUpdated}
                            onChange={(e) => handleNotificationChange('email', 'chantierUpdated', e.target.checked)}
                          />
                          <span>Modifications de chantier</span>
                        </label>
                        
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600"
                            checked={notifications.email.deadlineReminder}
                            onChange={(e) => handleNotificationChange('email', 'deadlineReminder', e.target.checked)}
                          />
                          <span>Rappels d'échéance</span>
                        </label>
                        
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600"
                            checked={notifications.email.weeklyReport}
                            onChange={(e) => handleNotificationChange('email', 'weeklyReport', e.target.checked)}
                          />
                          <span>Rapport hebdomadaire</span>
                        </label>
                      </div>
                    )}
                  </div>
                  {/* Rappels et préférences */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Préférences de rappel</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rappel avant échéance (heures)
                        </label>
                        <select 
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={notifications.reminders.beforeDeadline}
                          onChange={(e) => handleNotificationChange('reminders', 'beforeDeadline', parseInt(e.target.value))}
                        >
                          <option value="1">1 heure avant</option>
                          <option value="3">3 heures avant</option>
                          <option value="6">6 heures avant</option>
                          <option value="12">12 heures avant</option>
                          <option value="24">24 heures avant</option>
                          <option value="48">48 heures avant</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Réception du récapitulatif
                        </label>
                        <div className="flex items-center">
                          <span className="mr-2">Tous les jours à</span>
                          <input 
                            type="time" 
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={notifications.reminders.dailyDigest}
                            onChange={(e) => handleNotificationChange('reminders', 'dailyDigest', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Préférences */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Préférences d'affichage</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Format de date
                    </label>
                    <select
                      value={preferences.formatDate}
                      onChange={(e) => setPreferences({...preferences, formatDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                      <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                      <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unité de distance
                    </label>
                    <select
                      value={preferences.uniteDistance}
                      onChange={(e) => setPreferences({...preferences, uniteDistance: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="km">Kilomètres</option>
                      <option value="miles">Miles</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure de début par défaut
                    </label>
                    <input
                      type="time"
                      value={preferences.heureDebut}
                      onChange={(e) => setPreferences({...preferences, heureDebut: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure de fin par défaut
                    </label>
                    <input
                      type="time"
                      value={preferences.heureFin}
                      onChange={(e) => setPreferences({...preferences, heureFin: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bouton de sauvegarde */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
              {saveError && (
                <div className="flex items-center text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {saveError}
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                {isSaving && (
                  <div className="text-sm text-gray-500">
                    Enregistrement en cours...
                  </div>
                )}
                
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isSaving 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings