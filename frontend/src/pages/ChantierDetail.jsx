// src/pages/ChantierDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useChantierStore } from '../store/chantierStore';
import { PencilIcon, ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import InterventionList from '../components/InterventionList';

const ChantierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentChantier: chantier,
    fetchChantierById,
    fetchInterventionsByChantier,
    interventions,
    isLoading,
    error
  } = useChantierStore();
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchChantierById(id);
        await fetchInterventionsByChantier(id);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadData();
  }, [id, fetchChantierById, fetchInterventionsByChantier]);

  if (isLoading && !chantier) {
    return <div className="text-center py-10">Chargement du chantier...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">Erreur: {error}</div>;
  }

  if (!chantier) {
    return <div className="text-center py-10">Chantier non trouvé</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Retour à la liste
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {chantier.titre}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Détails du chantier
            </p>
          </div>
          <div>
            <Link
              to={`/chantiers/${id}/modifier`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PencilIcon className="-ml-1 mr-2 h-4 w-4" />
              Modifier
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('details')}
              className={`${
                activeTab === 'details'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
            >
              Détails
            </button>
            <button
              onClick={() => setActiveTab('interventions')}
              className={`${
                activeTab === 'interventions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
            >
              Interventions
            </button>
          </nav>
        </div>

        <div className="px-4 py-5 sm:p-6">
          {activeTab === 'details' ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h4>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                    <dd className="mt-1 text-sm text-gray-900">{chantier.adresse}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Client</dt>
                    <dd className="mt-1 text-sm text-gray-900">{chantier.client_nom}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Date de début</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(chantier.date_debut).toLocaleDateString('fr-FR')}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Budget</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(chantier.budget || 0)}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Statut</dt>
                    <dd className="mt-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        chantier.statut === 'en_cours'
                          ? 'bg-green-100 text-green-800'
                          : chantier.statut === 'termine'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {chantier.statut}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Description</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {chantier.description || 'Aucune description fournie.'}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-medium text-gray-900">Interventions</h4>
                <Link
  to={`/intervention/new/${id}`}
  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
>
  <PlusIcon className="-ml-1 mr-1 h-4 w-4" />
  Nouvelle intervention
</Link>
              </div>
              
              <InterventionList 
                chantierId={id} 
                interventions={interventions} 
                isLoading={isLoading} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChantierDetail;