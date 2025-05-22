import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar,
  Clock,
  FileText,
  Building,
  Edit,
  Eye
} from 'lucide-react'
import { useChantierStore } from '../store/chantierStore'

const InterventionsList = () => {
  const { interventions, chantiers, fetchChantiers, isLoading } = useChantierStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    fetchChantiers()
  }, [fetchChantiers])

  // Filtrer les interventions
  const filteredInterventions = interventions.filter(intervention => {
    const chantier = chantiers.find(c => c.id === intervention.chantierId)
    const matchesSearch = intervention.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         intervention.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chantier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !typeFilter || intervention.type === typeFilter
    
    return matchesSearch && matchesType
  })

  const getChantierName = (chantierId) => {
    const chantier = chantiers.find(c => c.id === chantierId)
    return chantier?.name || 'Chantier inconnu'
  }

  const getTypeColor = (type) => {
    const colors = {
      maintenance: 'bg-blue-100 text-blue-800',
      reparation: 'bg-red-100 text-red-800',
      installation: 'bg-green-100 text-green-800',
      controle: 'bg-yellow-100 text-yellow-800',
      nettoyage: 'bg-purple-100 text-purple-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const typeLabels = {
    maintenance: 'Maintenance',
    reparation: 'Réparation',
    installation: 'Installation',
    controle: 'Contrôle',
    nettoyage: 'Nettoyage'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interventions</h1>
          <p className="text-gray-600">{filteredInterventions.length} intervention(s) trouvée(s)</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/intervention/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle intervention
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une intervention..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtre type */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="maintenance">Maintenance</option>
              <option value="reparation">Réparation</option>
              <option value="installation">Installation</option>
              <option value="controle">Contrôle</option>
              <option value="nettoyage">Nettoyage</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des interventions */}
      {filteredInterventions.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-gray-200">
            {filteredInterventions.map((intervention) => (
              <div key={intervention.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {intervention.title || 'Intervention sans titre'}
                      </h3>
                      {intervention.type && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(intervention.type)}`}>
                          {typeLabels[intervention.type]}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        <Link 
                          to={`/chantier/${intervention.chantierId}`}
                          className="text-blue-600 hover:text-blue-500"
                        >
                          {getChantierName(intervention.chantierId)}
                        </Link>
                      </div>
                      
                      {intervention.date && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(intervention.date).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {intervention.duration && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{intervention.duration}h</span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Créé le {new Date(intervention.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                      {intervention.description || 'Aucune description'}
                    </p>

                    {intervention.images && intervention.images.length > 0 && (
                      <div className="flex items-center text-sm text-gray-500">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>{intervention.images.length} photo(s) attachée(s)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                      <Eye className="h-4 w-4" />
                    </button>
                    <Link
                      to={`/intervention/edit/${intervention.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune intervention</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || typeFilter 
                ? 'Aucune intervention ne correspond à vos critères de recherche.'
                : 'Vous n\'avez pas encore créé d\'intervention.'
              }
            </p>
            {!searchTerm && !typeFilter && (
              <Link
                to="/intervention/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer votre première intervention
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Statistiques rapides */}
      {interventions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{interventions.length}</div>
            <div className="text-sm text-gray-600">Total interventions</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {interventions.filter(i => i.type === 'maintenance').length}
            </div>
            <div className="text-sm text-gray-600">Maintenances</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">
              {interventions.filter(i => i.type === 'reparation').length}
            </div>
            <div className="text-sm text-gray-600">Réparations</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {interventions.filter(i => i.type === 'installation').length}
            </div>
            <div className="text-sm text-gray-600">Installations</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InterventionsList