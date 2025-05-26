import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Calendar,
  Euro,
  BarChart3,
  Grid,
  List,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react'
import { useChantierStore } from '../store/chantierStore'
import { statusLabels, priorityLabels, typeLabels } from '../data/chantiers'

const ChantiersList = () => {
  const { chantiers, fetchChantiers, isLoading, deleteChantier } = useChantierStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' ou 'list'
  const [selectedChantiers, setSelectedChantiers] = useState([])
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchChantiers()
  }, [fetchChantiers])

  // Filtrer les chantiers
  const filteredChantiers = chantiers.filter(chantier => {
    const matchesSearch = chantier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chantier.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chantier.address.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || chantier.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    const colors = {
      planifie: 'bg-yellow-100 text-yellow-800',
      en_cours: 'bg-blue-100 text-blue-800',
      termine: 'bg-green-100 text-green-800',
      suspendu: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    }
    return colors[priority] || 'text-gray-600'
  }

  const handleDeleteChantier = async (chantierId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chantier ? Cette action est irréversible.')) {
      await deleteChantier(chantierId)
      await fetchChantiers()
      setShowDeleteConfirm(null)
    }
  }

  const toggleChantierSelection = (chantierId) => {
    setSelectedChantiers(prev => 
      prev.includes(chantierId)
        ? prev.filter(id => id !== chantierId)
        : [...prev, chantierId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedChantiers.length === filteredChantiers.length) {
      setSelectedChantiers([])
    } else {
      setSelectedChantiers(filteredChantiers.map(c => c.id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedChantiers.length === 0) return
    
    const message = selectedChantiers.length === 1 
      ? 'Êtes-vous sûr de vouloir supprimer le chantier sélectionné ?' 
      : `Êtes-vous sûr de vouloir supprimer les ${selectedChantiers.length} chantiers sélectionnés ?`
    
    if (window.confirm(message + ' Cette action est irréversible.')) {
      for (const id of selectedChantiers) {
        await deleteChantier(id)
      }
      await fetchChantiers()
      setSelectedChantiers([])
      setIsSelectMode(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Chantiers</h1>
          <p className="text-gray-600">
            {filteredChantiers.length} chantier(s) trouvé(s)
            {selectedChantiers.length > 0 && ` • ${selectedChantiers.length} sélectionné(s)`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isSelectMode ? (
            <>
              <button
                onClick={() => {
                  setSelectedChantiers([])
                  setIsSelectMode(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedChantiers.length === 0}
                className={`px-4 py-2 rounded-md text-white flex items-center ${selectedChantiers.length > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer ({selectedChantiers.length})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsSelectMode(true)}
                className="px-4 py-2 border rounded-md text-gray-700 border-red-300 text-red-700 hover:bg-gray-50 flex items-center"
              >
              <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </button>
              <Link
                to="/chantiers/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau chantier
              </Link>
            </>
          )}
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
                placeholder="Rechercher un chantier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Filtre statut */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="planifie">Planifié</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="suspendu">Suspendu</option>
              </select>
            </div>

            {/* Toggle vue */}
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des chantiers */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChantiers.map((chantier) => (
            <div 
              key={chantier.id} 
              className={`bg-white rounded-lg shadow hover:shadow-md transition-border ${isSelectMode ? 'border-2 ' + (selectedChantiers.includes(chantier.id) ? 'border-blue-500' : 'border-transparent') : ''}`}
            >
              {(isSelectMode || selectedChantiers.length > 0) && (
                <div className="p-2 flex justify-end">
                  <button
                    onClick={() => toggleChantierSelection(chantier.id)}
                    className={`w-5 h-5 rounded border ${selectedChantiers.includes(chantier.id) ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}
                  >
                    {selectedChantiers.includes(chantier.id) && <Check className="w-3 h-3 mx-auto" />}
                  </button>
                </div>
              )}
              <Link to={`/chantier/${chantier.id}`} className="block">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {chantier.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chantier.status)}`}>
                      {statusLabels[chantier.status]}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{chantier.address}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(chantier.startDate).toLocaleDateString()} - 
                        {new Date(chantier.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Euro className="h-4 w-4 mr-2" />
                      <span>{chantier.budget.toLocaleString()}€</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progression</span>
                      <span className={`font-medium ${getPriorityColor(chantier.priority)}`}>
                        {priorityLabels[chantier.priority]}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${chantier.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{chantier.progress}%</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Client: {chantier.client}</span>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                        {typeLabels[chantier.type]}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {isSelectMode && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={toggleSelectAll}
                      className={`w-4 h-4 rounded border flex items-center justify-center ${selectedChantiers.length === filteredChantiers.length ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}
                    >
                      {selectedChantiers.length === filteredChantiers.length && filteredChantiers.length > 0 && (
                        <Check className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chantier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progression
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Échéance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredChantiers.map((chantier) => (
                <tr 
                  key={chantier.id} 
                  className={`hover:bg-gray-50 ${selectedChantiers.includes(chantier.id) ? 'bg-blue-50' : ''}`}
                >
                  {isSelectMode && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleChantierSelection(chantier.id)}
                        className={`w-4 h-4 rounded border ${selectedChantiers.includes(chantier.id) ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}
                      >
                        {selectedChantiers.includes(chantier.id) && <Check className="w-3 h-3 mx-auto" />}
                      </button>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/chantier/${chantier.id}`}
                      className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                      {chantier.name}
                    </Link>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {chantier.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {chantier.client}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chantier.status)}`}>
                      {statusLabels[chantier.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${chantier.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{chantier.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {chantier.budget.toLocaleString()}€
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(chantier.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {(chantier.status === 'termine' || chantier.status === 'suspendu') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chantier ? Cette action est irréversible.')) {
                            handleDeleteChantier(chantier.id)
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer le chantier"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredChantiers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun chantier trouvé</p>
        </div>
      )}
    </div>
  )
}

export default ChantiersList