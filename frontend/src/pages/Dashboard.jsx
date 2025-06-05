import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Building2, 
  Calendar, 
  Euro, 
  TrendingUp,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { useChantierStore } from '../store/chantierStore'
import { useAuthStore } from '../store/authStore'
import { statusLabels, priorityLabels } from '../data/chantiers'

const getPriorityColor = (priority) => {
  const colors = {
    'basse': 'text-green-600 border-green-600 border-1',      // Vert pour Basse
    'moyenne': 'text-blue-600 border-blue-600 border-1',     // Bleu pour Moyenne
    'haute': 'text-orange-500 border-orange-600 border-1',     // Orange pour Haute
    'critique': 'text-red-600 border-red-600 border-1',       // Rouge pour Urgent
    // Ajout des clés anglaises pour la rétrocompatibilité
    'low': 'text-green-600 border-green-600 border-1',
    'medium': 'text-blue-600',
    'high': 'text-orange-600'
  }
  // Convertir en minuscules pour la correspondance insensible à la casse
  return colors[priority?.toLowerCase()] || 'text-gray-600'
}

const calculateProgression = (chantier) => {
  // Si le chantier a une progression définie, on l'utilise
  if (chantier.progression !== undefined && chantier.progression !== null) {
    return chantier.progression;
  }

  // Si le chantier a des interventions terminées
  if (chantier.interventions && chantier.interventions.length > 0) {
    const totalInterventions = chantier.interventions.length;
    const completedInterventions = chantier.interventions.filter(
      i => i.statut === 'termine'
    ).length;
    return Math.round((completedInterventions / totalInterventions) * 100);
  }

  // Si le chantier est marqué comme terminé
  if (chantier.statut === 'termine') {
    return 100;
  }

  // Pour les chantiers en cours ou urgents
  if (chantier.statut === 'en_cours' || 
      ['urgent', 'high', 'critique'].includes(chantier.priorite?.toLowerCase())) {
    return 15; // Progression initiale
  }

  // Par défaut (pour les chantiers en attente)
  return 0;
};

const ChantierCard = ({ chantier, showProgress = true, showClient = false }) => {
  const progression = calculateProgression(chantier);
  
  return (
    <Link 
      to={`/chantiers/${chantier._id}`}
      className="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{chantier.titre}</h4>
          {showClient && chantier.client_nom && (
            <p className="text-sm text-gray-600">{chantier.client_nom}</p>
          )}
          <p className="text-sm text-gray-600 flex items-center mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {chantier.adresse}
          </p>
          {showProgress && (
            <div className="flex items-center mt-2">
              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${progression}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{progression}%</span>
            </div>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(chantier.priorite || 'medium')}`}>
          {priorityLabels[chantier.priorite] || chantier.priorite || 'Non définie'}
        </span>
      </div>
    </Link>
  );
};


const getDisplayStatus = (chantier) => {
  // Si le chantier est terminé
  if (chantier.statut === 'termine' || chantier.progression >= 100) {
    return 'termine';
  }
  
  // Si le chantier est dans les priorités urgentes
  if (['urgent', 'high', 'critique'].includes(chantier.priorite?.toLowerCase())) {
    return 'en_cours';
  }
  
  // Si le chantier est en attente mais que la date de début est passée
  if (chantier.statut === 'en_attente' && chantier.date_debut && !isDateInFuture(chantier.date_debut)) {
    return 'en_cours';
  }
  
  // Si le chantier est en attente avec date future
  if (chantier.statut === 'en_attente' && (!chantier.date_debut || isDateInFuture(chantier.date_debut))) {
    return 'planifie';
  }
  
  // Par défaut, retourner le statut actuel
  return chantier.statut;
};

const isDateInFuture = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date > today;
};
const Dashboard = () => {
  const { user } = useAuthStore()
  const { chantiers, fetchChantiers, isLoading } = useChantierStore()

  useEffect(() => {
    fetchChantiers()
  }, [fetchChantiers])

  // Fonction de mapping des statuts
  const mapStatus = (status) => {
    const mapping = {
      'en_attente': 'planifie',
      'en_cours': 'en_cours',
      'termine': 'termine',
      'annule': 'suspendu'
    };
    return mapping[status] || status;
  };

  // Calculs pour les statistiques
  const stats = {
    total: Array.isArray(chantiers) ? chantiers.length : 0,
    enCours: Array.isArray(chantiers) ? 
      chantiers.filter(c => getDisplayStatus(c) === 'en_cours').length : 0,
    planifies: Array.isArray(chantiers) ? 
      chantiers.filter(c => getDisplayStatus(c) === 'planifie').length : 0,
    termines: Array.isArray(chantiers) ? 
      chantiers.filter(c => getDisplayStatus(c) === 'termine').length : 0,
    budgetTotal: Array.isArray(chantiers) ? 
      chantiers.reduce((sum, c) => sum + (c.budget || 0), 0) : 0,
    progressionMoyenne: Array.isArray(chantiers) && chantiers.length > 0 
      ? Math.round(chantiers.reduce((sum, c) => sum + (c.progression || 0), 0) / chantiers.length) 
      : 0
  }

  const getStatusColor = (status) => {
    const mappedStatus = mapStatus(status);
    const colors = {
      planifie: 'bg-yellow-100 text-yellow-800',
      en_cours: 'bg-blue-100 text-blue-800',
      termine: 'bg-green-100 text-green-800',
      suspendu: 'bg-red-100 text-red-800'
    }
    return colors[mappedStatus] || 'bg-gray-100 text-gray-800'
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
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.prenom} {user?.nom} 👋
        </h1>
        <p className="text-gray-600">Voici un aperçu de vos chantiers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Chantiers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En Cours</p>
              <p className="text-2xl font-bold text-gray-900">{stats.enCours}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-gray-900">{stats.termines}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Euro className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Budget Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.budgetTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des chantiers */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Chantiers planifiés */}
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 flex items-center">
        <Calendar className="h-5 w-5 mr-2" />
        Chantiers Planifiés
      </h3>
    </div>
    <div className="p-6">
  {chantiers?.filter(c => 
    c.statut === 'en_attente' && 
    (c.progression === 0 || c.progression === undefined || c.progression === null) &&
    (c.date_debut ? isDateInFuture(c.date_debut) : false) // Seulement les dates futures
  ).length > 0 ? (
    <div className="space-y-4">
      {chantiers
        .filter(c => 
          c.statut === 'en_attente' && 
          (c.progression === 0 || c.progression === undefined || c.progression === null) &&
          (c.date_debut ? isDateInFuture(c.date_debut) : false)
        )
        .slice(0, 3)
        .map((chantier) => (
          <ChantierCard 
  key={chantier._id} 
  chantier={chantier} 
  showClient={true}
  showProgress={true}  // Ajout de la barre de progression
/>
        ))}
    </div>
  ) : (
    <p className="text-gray-500 text-center py-4">
      Aucun chantier planifié
    </p>
  )}
</div>
  </div>

  {/* Chantiers en cours */}
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2" />
        Chantiers En Cours
      </h3>
    </div>
    <div className="p-6">
    {chantiers?.filter(c => {
    const progression = calculateProgression(c);
    return (c.statut === 'en_cours' || 
           (c.statut === 'en_attente' && 
            progression > 0 && 
            progression < 100 &&
            (c.date_debut ? !isDateInFuture(c.date_debut) : true))) &&
           !['urgent', 'high', 'critique'].includes(c.priorite?.toLowerCase());
  }).length > 0 ? (
    <div className="space-y-4">
      {chantiers
        .filter(c => {
          const progression = calculateProgression(c);
          return (c.statut === 'en_cours' || 
                 (c.statut === 'en_attente' && 
                  progression > 0 && 
                  progression < 100 &&
                  (c.date_debut ? !isDateInFuture(c.date_debut) : true))) &&
                 !['urgent', 'high', 'critique'].includes(c.priorite?.toLowerCase());
        })
        .slice(0, 3)
        .map((chantier) => (
          <ChantierCard 
            key={chantier._id} 
            chantier={chantier} 
            showClient={true}
            showProgress={true}
          />
        ))}
    </div>
  ) : (
    <p className="text-gray-500 text-center py-4">
      Aucun chantier en cours
    </p>
  )}
</div>
  </div>
</div>

{/* Deuxième ligne avec Urgents et Terminés */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Chantiers urgents */}
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
        Priorités Urgentes
      </h3>
    </div>
    <div className="p-6">
    {chantiers?.filter(c => {
        const progression = calculateProgression(c);
        return ['urgent', 'high', 'critique'].includes(c.priorite?.toLowerCase()) &&
               c.statut !== 'termine' && 
               progression < 100 &&
               (c.date_debut ? !isDateInFuture(c.date_debut) : true);
      }).length > 0 ? (
        <div className="space-y-4">
          {chantiers
            .filter(c => {
              const progression = calculateProgression(c);
              return ['urgent', 'high', 'critique'].includes(c.priorite?.toLowerCase()) &&
                     c.statut !== 'termine' && 
                     progression < 100 &&
                     (c.date_debut ? !isDateInFuture(c.date_debut) : true);
            })
            .slice(0, 3)
            .map((chantier) => (
              <ChantierCard 
                key={chantier._id} 
                chantier={chantier} 
                showClient={true}
                showProgress={true}
              />
            ))}
        </div>
  ) : (
    <p className="text-gray-500 text-center py-4">
      Aucune priorité urgente
    </p>
  )}
</div>
  </div>

  {/* Chantiers terminés */}
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 flex items-center">
        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
        Chantiers Terminés
      </h3>
    </div>
    <div className="p-6">
  {chantiers?.filter(c => c.statut === 'termine' || c.progression >= 100).length > 0 ? (
    <div className="space-y-4">
      {chantiers
        .filter(c => c.statut === 'termine' || c.progression >= 100)
        .slice(0, 3)
        .map((chantier) => (
          <ChantierCard 
            key={chantier._id} 
    chantier={chantier} 
    showClient={true}
            showProgress={true}
/>
        ))}
    </div>
  ) : (
    <p className="text-gray-500 text-center py-4">
      Aucun chantier terminé
    </p>
  )}
</div>
  </div>
</div>


      {/* Tous les chantiers */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Tous les Chantiers</h3>
            <Link 
              to="/chantiers" 
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              Voir tout
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chantiers?.slice(0, 5).map((chantier) => (
                <tr key={chantier._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/chantiers/${chantier._id}`}
                      className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                      {chantier.titre}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {chantier.client_nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
    getStatusColor(getDisplayStatus(chantier))
  }`}>
    {statusLabels[mapStatus(getDisplayStatus(chantier))] || getDisplayStatus(chantier)}
  </span>
</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${chantier.progression || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{chantier.progression || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(chantier.budget || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard