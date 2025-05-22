import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { Settings as SettingsIcon, User, Bell, MapPin, Clock, FileText, Save } from 'lucide-react'

const Settings = () => {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  
  // États pour les différents paramètres
  const [profileData, setProfileData] = useState({
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    role: user?.role || '',
    entreprise: user?.entreprise || ''
  })
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    notifNouvelleIntervention: true,
    notifModificationChantier: true,
    notifRappelEcheance: true,
    notifRapportHebdo: false
  })
  
  const [preferences, setPreferences] = useState({
    uniteDistance: 'km',
    formatDate: 'dd/mm/yyyy',
    heureDebut: '8:00',
    heureFin: '17:00',
    affichageCartes: 'satellite',
    exportFormat: 'pdf'
  })
  
  const [defaultValues, setDefaultValues] = useState({
    dureeInterventionDefaut: 2,
    tempsTrajetDefaut: 30,
    tauxHoraireDefaut: 45,
    categorieDefaut: 'maintenance'
  })

  const handleSave = () => {
    // Logique de sauvegarde
    console.log('Sauvegarde des paramètres...')
    // TODO: Appel API pour sauvegarder
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Préférences', icon: SettingsIcon },
    { id: 'defaults', label: 'Valeurs par défaut', icon: FileText }
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
                <h2 className="text-xl font-semibold text-gray-900">Préférences de notification</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Notifications par email</h3>
                      <p className="text-sm text-gray-600">Recevoir les notifications importantes par email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={(e) => setNotifications({...notifications, emailNotifications: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Notifications SMS</h3>
                      <p className="text-sm text-gray-600">Recevoir les notifications urgentes par SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.smsNotifications}
                      onChange={(e) => setNotifications({...notifications, smsNotifications: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Nouvelles interventions</h3>
                      <p className="text-sm text-gray-600">Être notifié lors de nouvelles interventions</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.notifNouvelleIntervention}
                      onChange={(e) => setNotifications({...notifications, notifNouvelleIntervention: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Modifications de chantier</h3>
                      <p className="text-sm text-gray-600">Être notifié des changements sur les chantiers</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.notifModificationChantier}
                      onChange={(e) => setNotifications({...notifications, notifModificationChantier: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Rappels d'échéance</h3>
                      <p className="text-sm text-gray-600">Rappels pour les dates limites importantes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.notifRappelEcheance}
                      onChange={(e) => setNotifications({...notifications, notifRappelEcheance: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de carte
                    </label>
                    <select
                      value={preferences.affichageCartes}
                      onChange={(e) => setPreferences({...preferences, affichageCartes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="roadmap">Route</option>
                      <option value="satellite">Satellite</option>
                      <option value="hybrid">Hybride</option>
                      <option value="terrain">Terrain</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Format d'export par défaut
                    </label>
                    <select
                      value={preferences.exportFormat}
                      onChange={(e) => setPreferences({...preferences, exportFormat: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Valeurs par défaut */}
            {activeTab === 'defaults' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Valeurs par défaut</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée d'intervention par défaut (heures)
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={defaultValues.dureeInterventionDefaut}
                      onChange={(e) => setDefaultValues({...defaultValues, dureeInterventionDefaut: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temps de trajet par défaut (minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={defaultValues.tempsTrajetDefaut}
                      onChange={(e) => setDefaultValues({...defaultValues, tempsTrajetDefaut: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taux horaire par défaut (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={defaultValues.tauxHoraireDefaut}
                      onChange={(e) => setDefaultValues({...defaultValues, tauxHoraireDefaut: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie par défaut
                    </label>
                    <select
                      value={defaultValues.categorieDefaut}
                      onChange={(e) => setDefaultValues({...defaultValues, categorieDefaut: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="maintenance">Maintenance</option>
                      <option value="installation">Installation</option>
                      <option value="reparation">Réparation</option>
                      <option value="inspection">Inspection</option>
                      <option value="formation">Formation</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Bouton de sauvegarde */}
            <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                Sauvegarder les modifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings