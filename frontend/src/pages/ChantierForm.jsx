import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChantierStore } from '../store/chantierStore';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config/api';
import useUserRole from '../hooks/useUserRole';

const ChantierForm = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { 
    createChantier, 
    updateChantier, 
    fetchChantierById, 
    currentChantier 
  } = useChantierStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const isEditing = !!id;
  
  const { 
    isAdmin, 
    canEditChantier 
  } = useUserRole();
  
  const [formData, setFormData] = useState({
    titre: '',
    client_nom: '',
    date_debut: '',
    date_fin: '',
    budget: '',
    priorite: 'moyenne',
    statut: 'en_attente',
    adresse: '',
    description: ''
  });

  const priorities = [
    { value: 'basse', label: 'Basse' },
    { value: 'moyenne', label: 'Moyenne' },
    { value: 'haute', label: 'Haute' },
    { value: 'critique', label: 'Critique' }
  ];

  const statusOptions = [
    { value: 'en_attente', label: 'Planifié' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'termine', label: 'Terminé' }
  ];

  // Charger les données du chantier en mode édition
  useEffect(() => {
    const loadChantier = async () => {
      if (!isEditing) return;
      
      setIsLoading(true);
      try {
        await fetchChantierById(id);
      } catch (error) {
        console.error('Erreur lors du chargement du chantier:', error);
        setErrors(prev => ({
          ...prev,
          fetchError: 'Impossible de charger les données du chantier'
        }));
      } finally {
        setIsLoading(false);
      }
    };

    loadChantier();
  }, [id, isEditing, fetchChantierById]);

  // Mettre à jour le formulaire quand currentChantier change
  useEffect(() => {
    if (isEditing && currentChantier) {
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
      };

      const formattedChantier = {
        ...currentChantier,
        date_debut: formatDateForInput(currentChantier.date_debut),
        date_fin: formatDateForInput(currentChantier.date_fin),
        budget: currentChantier.budget?.toString() || ''
      };
      setFormData(formattedChantier);
    }
  }, [currentChantier, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.titre.trim()) newErrors.titre = 'Le titre est requis';
    if (!formData.client_nom.trim()) newErrors.client_nom = 'Le nom du client est requis';
    
    if (!formData.date_debut) {
      newErrors.date_debut = 'La date de début est requise';
    } else {
      const startDate = new Date(formData.date_debut);
      if (isNaN(startDate.getTime())) {
        newErrors.date_debut = 'Date de début invalide';
      }
    }

    if (!formData.statut) newErrors.statut = 'Le statut est requis';
    
    if (!formData.budget) {
      newErrors.budget = 'Le budget est requis';
    } else if (isNaN(formData.budget) || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Le budget doit être un nombre positif';
    }
    
    if (!formData.adresse.trim()) newErrors.adresse = 'L\'adresse est requise';
    
    if (formData.date_debut && formData.date_fin) {
      const startDate = new Date(formData.date_debut);
      const endDate = new Date(formData.date_fin);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        newErrors.date_fin = 'Dates invalides';
      } else if (endDate < startDate) {
        newErrors.date_fin = 'La date de fin doit être postérieure ou égale à la date de début';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canEditChantier) {
      setErrors(prev => ({
        ...prev,
        submitError: 'Vous n\'avez pas les droits pour effectuer cette action'
      }));
      return;
    }
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      const formatDateForAPI = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
      };

      const dateDebut = formData.date_debut ? formatDateForAPI(formData.date_debut) : null;
      const dateFin = formData.date_fin ? formatDateForAPI(formData.date_fin) : null;
  
      const chantierData = {
        ...formData,
        date_debut: dateDebut,
        date_fin: dateFin,
        budget: parseFloat(formData.budget) || 0,
        responsable_id: user.id
      };
  
      if (isEditing) {
        await updateChantier(id, chantierData);
      } else {
        await createChantier(chantierData);
      }
      
      // Utiliser replace: false pour permettre au bouton de retour de fonctionner correctement
      navigate('/chantiers', { 
        state: { 
          success: `Chantier ${isEditing ? 'mis à jour' : 'créé'} avec succès !`,
          refresh: true
        },
        replace: false  // Changé de true à false pour conserver l'historique
      });
      
    } catch (error) {
      console.error(`Erreur lors de ${isEditing ? 'la mise à jour' : 'la création'} du chantier:`, error);
      setErrors(prev => ({
        ...prev,
        submitError: error.message || `Impossible de ${isEditing ? 'mettre à jour' : 'créer'} le chantier`
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (fieldName) => 
    `mt-1 block w-full rounded-md border ${errors[fieldName] ? 'border-red-500' : 'border-gray-300'} 
    shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!canEditChantier ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  const renderInput = (field, label, type = 'text', placeholder = '', required = true, options = null) => (
    <div className={field === 'description' ? 'col-span-2' : ''}>
      <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      {type === 'select' ? (
        <select
          id={field}
          name={field}
          value={formData[field]}
          onChange={handleChange}
          disabled={!canEditChantier}
          className={`${inputClass(field)} ${!canEditChantier ? 'bg-gray-100' : ''}`}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={field}
          name={field}
          rows={4}
          value={formData[field]}
          onChange={handleChange}
          disabled={!canEditChantier}
          className={`${inputClass(field)} ${!canEditChantier ? 'bg-gray-100' : ''}`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          id={field}
          name={field}
          value={formData[field]}
          onChange={handleChange}
          disabled={!canEditChantier}
          className={`${inputClass(field)} ${!canEditChantier ? 'bg-gray-100' : ''}`}
          placeholder={placeholder}
          required={required}
          min={field === 'date_fin' ? formData.date_debut || '' : undefined}
        />
      )}
      {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isEditing && !currentChantier && !isLoading) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Impossible de charger les données du chantier.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
        >
          Retour
        </button>
      </div>
    );
  }

  if (!canEditChantier) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Accès refusé</h2>
          <p className="mb-4">
            Vous n'avez pas les autorisations nécessaires pour {isEditing ? 'modifier' : 'créer'} un chantier.
            Seuls les administrateurs peuvent effectuer cette action.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Modifier le Chantier' : 'Nouveau Chantier'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('titre', 'Titre du chantier', 'text', 'Ex: Rénovation cuisine')}
            {renderInput('client_nom', 'Client', 'text', 'Nom du client')}
            {renderInput('priorite', 'Priorité', 'select', '', false, priorities)}
            {renderInput('statut', 'Statut', 'select', '', true, statusOptions)}
            {renderInput('date_debut', 'Date de début', 'date')}
            {renderInput('date_fin', 'Date de fin (optionnel)', 'date', '', false)}
            
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                Budget (€) *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">€</span>
                </div>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={handleChange}
                  disabled={!canEditChantier}
                  className={`block w-full pl-7 pr-12 sm:text-sm border ${errors.budget ? 'border-red-500' : 'border-gray-300'} 
                  rounded-md focus:ring-blue-500 focus:border-blue-500 ${!canEditChantier ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="0.00"
                />
              </div>
              {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget}</p>}
            </div>
            
            {renderInput('adresse', 'Adresse', 'text', 'Adresse complète du chantier')}
            {renderInput('description', 'Description (optionnel)', 'textarea', 'Détails sur le chantier...', false)}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/chantiers')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            {canEditChantier && (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isSubmitting 
                  ? (isEditing ? 'Mise à jour...' : 'Création en cours...')
                  : (isEditing ? 'Mettre à jour le chantier' : 'Créer le chantier')}
              </button>
            )}
          </div>
          
          {errors.submitError && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-red-700">{errors.submitError}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChantierForm;