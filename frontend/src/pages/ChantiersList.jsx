// src/pages/ChantiersList.jsx
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useChantierStore } from '../store/chantierStore';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import StatusBadge from '../components/ui/StatusBadge';

const ChantiersList = () => {
  // Récupérez les données du store
  const { chantiers, fetchChantiers, deleteChantier, isLoading, error } = useChantierStore();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');

  // Chargez les chantiers au montage et quand la location change
  useEffect(() => {
    const loadChantiers = async () => {
      try {
        const forceRefresh = location.state?.refresh || false;
        await fetchChantiers(forceRefresh);
        
        if (location.state?.success) {
          setSuccessMessage(location.state.success);
          const timer = setTimeout(() => {
            setSuccessMessage('');
            // Nettoyer l'état de navigation
            window.history.replaceState({}, document.title);
          }, 5000);
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des chantiers:', error);
      }
    };
    
    loadChantiers();
  }, [fetchChantiers, location]);
  
const handleDelete = async (id) => {
  if (confirmDelete === id) {
    try {
      await deleteChantier(id);
      setSuccessMessage('Chantier supprimé avec succès');
      setConfirmDelete(null);
      await fetchChantiers(); // Recharger après suppression
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  } else {
    setConfirmDelete(id);
    setTimeout(() => setConfirmDelete(null), 3000);
  }
};

  if (isLoading) {
    return <div className="text-center py-10">Chargement des chantiers...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">Erreur: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Liste des chantiers</h1>
        <Link
          to="/chantiers/nouveau"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Nouveau chantier
        </Link>
      </div>
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {chantiers.map((chantier) => (
            <li key={chantier._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/chantiers/${chantier._id}`}
                    className="text-sm font-medium text-indigo-600 truncate"
                  >
                    {chantier.titre}
                  </Link>
                  <div className="ml-2 flex-shrink-0 flex">
                  <StatusBadge status={chantier.statut} />
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {chantier.adresse}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      Client: {chantier.client_nom}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      Budget: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(chantier.budget || 0)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex justify-end space-x-2">
                  <Link
                    to={`/chantiers/${chantier._id}/modifier`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(chantier._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    {confirmDelete === chantier._id ? (
                      <span className="text-xs text-red-600">Confirmer</span>
                    ) : (
                      <TrashIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChantiersList;