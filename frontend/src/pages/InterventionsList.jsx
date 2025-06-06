import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Calendar,
  Clock,
  Building,
  Eye,
  DollarSign
} from 'lucide-react'
import { useChantierStore } from '../store/chantierStore'

const InterventionsList = () => {
  const { getAllInterventions, fetchChantiers, isLoading } = useChantierStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter] = useState('')
  const [interventions, setInterventions] = useState([])
  const [isLoadingInterventions, setIsLoadingInterventions] = useState(false)
  const [error, setError] = useState(null)

  const getStatusBadge = (status) => {
    const statusConfig = {
      planifiee: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Planifiée' },
      en_cours: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En cours' },
      terminee: { bg: 'bg-green-100', text: 'text-green-800', label: 'Terminée' },
      annulee: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulée' },
      default: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inconnu' }
    };
    return statusConfig[status] || statusConfig.default;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non spécifiée';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const formatPrice = (price) => {
    if (price === undefined || price === null || price === '') return 'Non renseigné';
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(price);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingInterventions(true)
        await fetchChantiers()
        const allInterventions = await getAllInterventions()
        setInterventions(allInterventions)
      } catch (err) {
        console.error('Erreur lors du chargement des interventions:', err)
        setError('Erreur lors du chargement des interventions')
      } finally {
        setIsLoadingInterventions(false)
      }
    }
    
    loadData()
  }, [fetchChantiers, getAllInterventions])

  // Afficher un indicateur de chargement
  if (isLoading || isLoadingInterventions) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  // Afficher un message d'erreur s'il y en a un
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Filtrer les interventions
  const filteredInterventions = interventions.filter(intervention => {
    if (!intervention) return false;
    
    const matchesSearch = 
      (intervention.titre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (intervention.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (intervention.chantierName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    
    const matchesType = !typeFilter || intervention.type === typeFilter
    
    return matchesSearch && matchesType
  })


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
      </div>

      {/* Liste des interventions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredInterventions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucune intervention trouvée
            </p>
          ) : (
            filteredInterventions.map((intervention) => {
              const status = getStatusBadge(intervention.statut);
              
              return (
                <div key={intervention._id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900">
                        {intervention.titre || 'Sans titre'}
                      </h3>
                      
                      <p className="mt-1 text-sm text-gray-600">
                        {intervention.description}
                      </p>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(intervention.date_intervention || intervention.date)}
                        </div>
                        {intervention.duree > 0 && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            {intervention.duree} h
                          </div>
                        )}
                        {intervention.prix && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                            {formatPrice(intervention.prix)}
                          </div>
                        )}
                      </div>
                      
                      {intervention.chantierId && (
                        <div className="mt-2">
                          <Link 
                            to={`/chantier/${intervention.chantierId}`}
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Building className="h-4 w-4 mr-1" />
                            {intervention.chantierName || 'Voir le chantier'}
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    {intervention.chantier_id?._id ? (
                      <Link
                        to={`/chantiers/${intervention.chantier_id._id}#interventions`}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Voir le chantier"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default InterventionsList