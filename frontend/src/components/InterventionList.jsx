// src/components/InterventionList.jsx
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const InterventionList = ({ interventions = [], isLoading, chantierId }) => {
  const [confirmDelete, setConfirmDelete] = useState(null);

  if (isLoading) {
    return <div className="text-center py-4">Chargement des interventions...</div>;
  }

  // S'assurer que interventions est un tableau
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
        // S'assurer que l'intervention est valide
        if (!intervention || typeof intervention !== 'object') {
          console.warn('Intervention invalide:', intervention);
          return null;
        }
        
        return (
          <div
            key={intervention._id || Math.random().toString(36).substr(2, 9)}
            className="bg-white shadow overflow-hidden rounded-lg p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">
                  {intervention.titre || 'Sans titre'}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {intervention.date ? new Date(intervention.date).toLocaleDateString('fr-FR') : 'Date non spécifiée'}
                </p>
                {intervention.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {intervention.description}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/chantiers/${chantierId}/interventions/${intervention._id}/modifier`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <PencilIcon className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => setConfirmDelete(intervention._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  {confirmDelete === intervention._id ? (
                    <span className="text-xs">Confirmer</span>
                  ) : (
                    <TrashIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InterventionList;