// src/pages/ChantierDetail.jsx
import { useEffect, useState, useCallback, memo, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useChantierStore } from '../store/chantierStore';
import { PencilIcon, ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Eye, Download, AlertCircle } from 'lucide-react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import ChantierPDFDocument from '../components/ChantierPDFDocuments';
import InterventionList from '../components/InterventionList';
import Progress from '../components/ui/Progress';
import PDFDownloadButton from '../components/PDFDownloadButton';
import PDFExport from '../components/PDFExport';
import StatusBadge from '../components/ui/StatusBadge';
// Composant d'erreur réutilisable
const ErrorMessage = ({ message, onRetry, className = '' }) => (
  <div className={`bg-red-50 border-l-4 border-red-400 p-4 ${className}`}>
    <div className="flex">
      <div className="flex-shrink-0">
        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">{message}</p>
        {onRetry && (
          <div className="mt-2">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

const LoadingState = ({ message = 'Chargement en cours...' }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Progress className="w-12 h-12 text-indigo-600 animate-spin" />
    <p className="mt-4 text-sm text-gray-600">{message}</p>
  </div>
);

// Composant mémoïsé pour le bouton de navigation
const BackButton = memo(({ onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900 ${className}`}
  >
    <ArrowLeftIcon className="h-4 w-4 mr-1" />
    Retour à la liste
  </button>
));

const ChantierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const loadingRef = useRef(false);
  
  const {
    currentChantier: chantier,
    fetchChantierById,
    fetchInterventionsByChantier,
    interventions,
    isLoading,
    error,
    rateLimitExceeded,
    retryAfter
  } = useChantierStore();

  const [activeTab, setActiveTab] = useState('details');
  const [localError, setLocalError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Gestion de l'onglet actif via l'URL
  useEffect(() => {
    const tab = location.hash === '#interventions' ? 'interventions' : 'details';
    setActiveTab(tab);
  }, [location]);

  // Chargement des données avec gestion des erreurs et du cache
  const loadData = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLocalError(null);
    setIsRetrying(false);
    
    try {
      await fetchChantierById(id);
      
      if (activeTab === 'interventions') {
        await fetchInterventionsByChantier(id);
      }
      
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setLocalError({
        message: error.message || 'Une erreur est survenue lors du chargement des données',
        isRateLimit: error.message?.includes('429') || error.message?.includes('Trop de requêtes')
      });
    } finally {
      loadingRef.current = false;
    }
  }, [id, activeTab, fetchChantierById, fetchInterventionsByChantier]);

  // Chargement initial des données
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Recharger les interventions lors du changement d'onglet
  useEffect(() => {
    if (!isInitialLoad && activeTab === 'interventions' && !loadingRef.current) {
      fetchInterventionsByChantier(id).catch(error => {
        console.error('Erreur lors du chargement des interventions:', error);
        setLocalError({
          message: 'Impossible de charger les interventions',
          isRateLimit: error.message?.includes('429') || error.message?.includes('Trop de requêtes')
        });
      });
    }
  }, [activeTab, id, isInitialLoad, fetchInterventionsByChantier]);

  // Gestion du rechargement manuel
  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    loadData();
  }, [loadData]);

  // Gestion du changement d'onglet
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    navigate(`#${tab === 'details' ? '' : tab}`, { replace: true });
  }, [navigate]);

  // Afficher l'état de chargement
  if ((isLoading && isInitialLoad) || isRetrying) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <BackButton onClick={() => navigate('/chantiers')} className="mb-6" />
        <LoadingState message={isRetrying ? 'Nouvelle tentative en cours...' : 'Chargement des données...'} />
      </div>
    );
  }

  // Si le taux de requêtes est dépassé
  if (rateLimitExceeded) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <BackButton onClick={() => navigate('/chantiers')} className="mb-6" />
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Trop de requêtes. Réessayez dans {retryAfter} secondes...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Gestion des erreurs
  if (error || localError) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <BackButton onClick={() => navigate('/chantiers')} className="mb-6" />
        <ErrorMessage 
          message={error || localError?.message} 
          onRetry={handleRetry}
          className="mb-6"
        />
        {localError?.isRateLimit && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Le serveur a reçu trop de requêtes. Veuillez patienter quelques instants avant de réessayer.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vérifier si le chantier est chargé
  if (!chantier) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <BackButton onClick={() => navigate('/chantiers')} className="mb-6" />
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune donnée disponible</h3>
          <p className="mt-1 text-sm text-gray-500">Impossible de charger les détails du chantier.</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <BackButton onClick={() => navigate(-1)} className="mb-6" />
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* En-tête avec bouton Aperçu PDF */}
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {chantier.titre}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Détails du chantier
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPdfPreview(true)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Eye className="h-4 w-4 mr-1" />
              Aperçu du PDF
            </button>
            <PDFDownloadButton chantier={chantier} interventions={interventions} />
            <Link
              to={`/chantiers/${id}/modifier`}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PencilIcon className="-ml-1 mr-1 h-4 w-4" />
              Modifier
            </Link>
          </div>
        </div>
        
        {/* Onglets */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['details', 'interventions'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
              >
                {tab === 'details' ? 'Détails' : 'Interventions'}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Contenu des onglets */}
        <div className="p-6">
          {activeTab === 'details' ? (
            <div className="bg-white overflow-hidden">
              <div className="px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {chantier.description || 'Aucune description fournie'}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {chantier.adresse || 'Non spécifiée'}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Date de début</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {chantier.date_debut ? new Date(chantier.date_debut).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Statut</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <StatusBadge status={chantier.statut} />
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Interventions</h3>
                <Link
                  to={`/chantiers/${id}/interventions/nouvelle`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PencilIcon className="-ml-1 mr-1 h-4 w-4" />
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
      
      {/* Aperçu PDF Modal */}
      {showPdfPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white h-4/5 flex flex-col">
            <div className="flex justify-between items-center pb-3">
              <h3 className="text-lg font-medium">Aperçu du PDF</h3>
              <button
                onClick={() => setShowPdfPreview(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <PDFViewer width="100%" height="100%">
                <ChantierPDFDocument chantier={chantier} interventions={interventions} />
              </PDFViewer>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
              <button
                onClick={() => setShowPdfPreview(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Fermer
              </button>
              <PDFDownloadButton chantier={chantier} interventions={interventions}>
                <Download className="h-4 w-4 mr-1" />
                Télécharger
              </PDFDownloadButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChantierDetail;