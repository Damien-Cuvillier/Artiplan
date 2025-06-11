// src/components/InterventionList.jsx
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DollarSign } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useChantierStore } from '../store/chantierStore';

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
const formatPrice = (price) => {
  if (price === undefined || price === null || price === '') return 'Non renseigné';
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(price);
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

const InterventionList = ({ interventions = [], isLoading, chantierId }) => {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { deleteIntervention, isLoading: isDeleting } = useChantierStore();

  const handleDelete = async (id) => {
    try {
      await deleteIntervention(id);
      setConfirmDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Chargement des interventions...</div>;
  }

  const safeInterventions = Array.isArray(interventions) ? interventions : [];

  if (safeInterventions.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Aucune intervention pour le moment
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {safeInterventions.map((intervention) => {
        if (!intervention || typeof intervention !== 'object') {
          console.warn('Intervention invalide:', intervention);
          return null;
        }
        
        const status = getStatusBadge(intervention.statut);
        
        return (
          <div
            key={intervention._id || Math.random().toString(36).substr(2, 9)}
            className="bg-white shadow overflow-hidden rounded-lg p-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    {intervention.titre || 'Sans titre'}
                  </h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>
                
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(intervention.date_intervention || intervention.date)}
                  </div>
                  {intervention.duree > 0 && (
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {intervention.duree} h
                    </div>
                  )}
                  {intervention.prix > 0 && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                      {formatPrice(intervention.prix)}
                    </div>
                  )}
                </div>
                
                {intervention.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {intervention.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Link
                  to={`/chantiers/${chantierId}/interventions/${intervention._id}/modifier`}
                  className="text-indigo-600 hover:text-indigo-900 p-1"
                  title="Modifier"
                >
                  <PencilIcon className="h-5 w-5" />
                </Link>
                
                {confirmDelete === intervention._id ? (
                  <div className="flex items-center space-x-2 bg-red-50 px-2 py-1 rounded">
                    <span className="text-xs text-red-700">Confirmer ?</span>
                    <button
                      onClick={() => handleDelete(intervention._id)}
                      disabled={isDeleting}
                      className={`text-xs px-2 py-1 rounded ${
                        isDeleting 
                          ? 'bg-red-300 text-white cursor-not-allowed' 
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {isDeleting ? 'Suppression...' : 'Oui'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      disabled={isDeleting}
                    >
                      Non
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(intervention._id)}
                    className="text-red-600 hover:text-red-900 p-1"
                    title="Supprimer"
                    disabled={isDeleting}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InterventionList;