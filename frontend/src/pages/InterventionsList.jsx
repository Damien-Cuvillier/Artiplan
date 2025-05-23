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
  const { getAllInterventions, fetchChantiers, isLoading } = useChantierStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [interventions, setInterventions] = useState([])

  useEffect(() => {
    fetchChantiers()
  }, [fetchChantiers])

  useEffect(() => {
    setInterventions(getAllInterventions())
  }, [getAllInterventions])

  // Filtrer les interventions
  const filteredInterventions = interventions.filter(intervention => {
    const matchesSearch = 
      intervention.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intervention.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intervention.chantierName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !typeFilter || intervention.type === typeFilter
    
    return matchesSearch && matchesType
  })

  const getTypeColor = (type) => {
    const colors = {
      maintenance: 'bg-blue-100 text-blue-800',
      reparation: 'bg-red-100 text-red-800',
      installation: 'bg-green-100 text-green-800',
      inspection: 'bg-yellow-100 text-yellow-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Interventions</h1>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une intervention..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="w-full sm:w-64">
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="installation">Installation</option>
              <option value="reparation">Réparation</option>
              <option value="maintenance">Maintenance</option>
              <option value="inspection">Inspection</option>
            </select>
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Liste des interventions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredInterventions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucune intervention trouvée
            </p>
          ) : (
            filteredInterventions.map((intervention) => (
              <div key={intervention.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(intervention.type)}`}>
                        {intervention.type.charAt(0).toUpperCase() + intervention.type.slice(1)}
                      </span>
                      <Link 
                        to={`/chantiers/${intervention.chantierId}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {intervention.chantierName}
                      </Link>
                    </div>
                    <p className="mt-2 text-gray-600">{intervention.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(intervention.date).toLocaleDateString()}
                      </span>
                      {intervention.duration && (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {intervention.duration}h
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/chantiers/${intervention.chantierId}`}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default InterventionsList