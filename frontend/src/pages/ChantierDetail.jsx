import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  MapPin, 
  Calendar, 
  User, 
  Euro, 
  BarChart3, 
  Plus,
  Edit,
  FileText,
  Image as ImageIcon
} from 'lucide-react'
import { useChantierStore } from '../store/chantierStore'
import { statusLabels, priorityLabels, typeLabels } from '../data/chantiers'
import PDFPreview from '../components/PDFPreview'

const ChantierDetail = () => {
  const { id } = useParams()
  const { currentChantier, fetchChantierById, isLoading, getInterventionsByChantier } = useChantierStore()

  useEffect(() => {
    if (id) {
      fetchChantierById(id)
    }
  }, [id, fetchChantierById])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!currentChantier) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Chantier introuvable</h2>
        <p className="mt-2 text-gray-600">Le chantier demandé n'existe pas.</p>
        <Link 
          to="/dashboard" 
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Retour au dashboard
        </Link>
      </div>
    )
  }

  const interventions = getInterventionsByChantier(currentChantier.id)

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
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{currentChantier.name}</h1>
          <p className="mt-2 text-gray-600">{currentChantier.description}</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/intervention/new/${currentChantier.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
          
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle intervention
          </Link>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </button>
        </div>
      </div>

      {/* Infos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card principale */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Adresse</p>
                  <p className="text-sm text-gray-600">{currentChantier.address}</p>
                </div>
              </div>

              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Client</p>
                  <p className="text-sm text-gray-600">{currentChantier.client}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Dates</p>
                  <p className="text-sm text-gray-600">
                    Du {new Date(currentChantier.startDate).toLocaleDateString()} 
                    au {new Date(currentChantier.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <Euro className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Budget</p>
                  <p className="text-sm text-gray-600">{currentChantier.budget.toLocaleString()} €</p>
                </div>
              </div>

              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Progression</p>
                  <div className="flex items-center mt-1">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${currentChantier.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{currentChantier.progress}%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentChantier.status)}`}>
                  {statusLabels[currentChantier.status]}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(currentChantier.priority)}`}>
                  {priorityLabels[currentChantier.priority]}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {typeLabels[currentChantier.type]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ImageIcon className="h-5 w-5 mr-2" />
            Photos ({currentChantier.images.length})
          </h3>
          {currentChantier.images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {currentChantier.images.slice(0, 4).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-20 object-cover rounded-md"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Aucune photo</p>
          )}
        </div>
      </div>

      {/* Interventions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Interventions ({interventions.length})
            </h3>
            <Link
              to={`/intervention/new/${currentChantier.id}`}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              + Ajouter une intervention
            </Link>
          </div>
        </div>
        
        {interventions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {interventions.map((intervention) => (
              <div key={intervention.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{intervention.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{intervention.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(intervention.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/intervention/edit/${intervention.id}`}
                    className="text-blue-600 hover:text-blue-500 text-sm"
                  >
                    Modifier
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">Aucune intervention enregistrée</p>
            <Link
              to={`/intervention/new/${currentChantier.id}`}
              className="mt-2 inline-block text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              Créer la première intervention
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChantierDetail