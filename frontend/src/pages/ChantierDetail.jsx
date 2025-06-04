// src/pages/ChantierDetail.jsx
import { useEffect, useState, useCallback, memo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useChantierStore } from '../store/chantierStore';
import { PencilIcon, ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Eye, Download } from 'lucide-react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import ChantierPDFDocument from '../components/ChantierPDFDocuments';
import InterventionList from '../components/InterventionList';
import Progress from '../components/ui/Progress';
import PDFDownloadButton from '../components/PDFDownloadButton';
import PDFExport from '../components/PDFExport';

// Composant mémoïsé pour le bouton de navigation
const BackButton = memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
  >
    <ArrowLeftIcon className="h-4 w-4 mr-1" />
    Retour à la liste
  </button>
));

// Composant mémoïsé pour l'en-tête
const ChantierHeader = memo(({ chantier, onPreviewToggle, onEdit, showPdfPreview, interventions }) => (
  <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
    <div>
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        {chantier.titre}
      </h3>
      <p className="mt-1 max-w-2xl text-sm text-gray-500">
        Détails du chantier
      </p>
    </div>
    <div className="flex items-center space-x-3">
      <PDFExport chantier={chantier} interventions={interventions} />
      
      <Link
        to={onEdit}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <PencilIcon className="-ml-1 mr-1 h-4 w-4" />
        Modifier
      </Link>
    </div>
  </div>
));

// Composant mémoïsé pour les onglets
const Tabs = memo(({ activeTab, onTabChange }) => (
  <div className="border-t border-gray-200">
    <nav className="flex -mb-px">
      {['details', 'interventions'].map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
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
));

// Composant principal
const ChantierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  
  const {
    currentChantier: chantier,
    fetchChantierById,
    fetchInterventionsByChantier,
    interventions,
    isLoading,
    error
  } = useChantierStore();

  const [activeTab, setActiveTab] = useState('details');

  // Gestion de l'onglet actif via l'URL
  useEffect(() => {
    setActiveTab(location.hash === '#interventions' ? 'interventions' : 'details');
  }, [location]);

  // Chargement des données
  const loadData = useCallback(async () => {
    try {
      await fetchChantierById(id);
      await fetchInterventionsByChantier(id);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }, [id, fetchChantierById, fetchInterventionsByChantier]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);
  const handlePreviewToggle = useCallback(() => setShowPdfPreview(prev => !prev), []);
  const handleTabChange = useCallback((tab) => setActiveTab(tab), []);

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
        <BackButton onClick={handleBack} />
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ChantierHeader 
          chantier={chantier} 
          onPreviewToggle={handlePreviewToggle}
          onEdit={`/chantiers/${id}/modifier`}
          showPdfPreview={showPdfPreview}
          interventions={interventions}
        />

        {showPdfPreview ? (
          <div className="border-t border-gray-200 p-4" style={{ height: '800px' }}>
          <PDFGenerator 
            chantier={chantier} 
            interventions={interventions}
            onClose={() => setShowPdfPreview(false)}
          />
          </div>
        ) : (
          <>
            <Tabs activeTab={activeTab} onTabChange={handleTabChange} />

            <div className="px-4 py-5 sm:p-6">
              {activeTab === 'details' ? (
                <ChantierDetails chantier={chantier} />
              ) : (
                <ChantierInterventions 
                  chantierId={id} 
                  interventions={interventions} 
                  isLoading={isLoading} 
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Composant mémoïsé pour les détails du chantier
const ChantierDetails = memo(({ chantier }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h4>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
        <DetailItem label="Adresse" value={chantier.adresse} />
        <DetailItem label="Client" value={chantier.client_nom} />
        <DetailItem 
          label="Date de début" 
          value={new Date(chantier.date_debut).toLocaleDateString('fr-FR')} 
        />
        <DetailItem 
          label="Budget" 
          value={new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: 'EUR' 
          }).format(chantier.budget || 0)} 
        />
        <StatusBadge status={chantier.statut} />
        <ProgressSection chantier={chantier} />
      </dl>
    </div>
    
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">Description</h4>
      <p className="text-sm text-gray-700 whitespace-pre-line">
        {chantier.description || 'Aucune description fournie.'}
      </p>
    </div>
  </div>
));

// Composant mémoïsé pour la section des interventions
const ChantierInterventions = memo(({ chantierId, interventions, isLoading }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h4 className="text-lg font-medium text-gray-900">Interventions</h4>
      <Link
        to={`/intervention/new/${chantierId}`}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <PlusIcon className="-ml-1 mr-1 h-4 w-4" />
        Nouvelle intervention
      </Link>
    </div>
    
    <InterventionList 
      chantierId={chantierId} 
      interventions={interventions} 
      isLoading={isLoading} 
    />
  </div>
));

// Composant d'élément de détail
const DetailItem = memo(({ label, value }) => (
  <div className="sm:col-span-1">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{value}</dd>
  </div>
));

// Composant de badge de statut
const StatusBadge = memo(({ status }) => {
  const statusConfig = {
    en_cours: { bg: 'bg-green-100', text: 'text-green-800', label: 'En cours' },
    termine: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Terminé' },
    default: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' }
  };

  const { bg, text, label } = statusConfig[status] || statusConfig.default;

  return (
    <div className="sm:col-span-1">
      <dt className="text-sm font-medium text-gray-500">Statut</dt>
      <dd className="mt-1">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bg} ${text}`}>
          {label}
        </span>
      </dd>
    </div>
  );
});

// Composant de section de progression
const ProgressSection = memo(({ chantier }) => (
  <div className="sm:col-span-2 mt-2">
    <dt className="text-sm font-medium text-gray-500 mb-1">Progression</dt>
    <dd className="mt-1">
      <Progress 
        value={chantier.progression || 0} 
        label="Avancement du chantier"
        color={
          chantier.statut === 'termine' ? 'green' : 
          chantier.statut === 'en_cours' ? 'blue' : 'yellow'
        }
      />
    </dd>
  </div>
));

export default memo(ChantierDetail);