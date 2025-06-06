import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChantierStore } from '../store/chantierStore';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config/api';

const ChantierForm = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { createChantier, updateChantier, fetchChantierById, currentChantier } = useChantierStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const isEditing = !!id;

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

  // Fonction utilitaire pour formater la date sans décalage horaire
  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    // S'assurer que la date est valide
    if (isNaN(date.getTime())) return null;
    // Créer une date en UTC pour éviter les problèmes de fuseau horaire
    return new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )).toISOString();
  };

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
      const formattedChantier = {
        ...currentChantier,
        date_debut: currentChantier.date_debut 
          ? new Date(currentChantier.date_debut).toISOString().split('T')[0]
          : '',
        date_fin: currentChantier.date_fin 
          ? new Date(currentChantier.date_fin).toISOString().split('T')[0]
          : '',
        budget: currentChantier.budget?.toString() || ''
      };
      setFormData(formattedChantier);
    }
  }, [currentChantier, isEditing]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/chantiers/nouveau' } });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
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
    
    // Validation de la date de début
    if (!formData.date_debut) {
      newErrors.date_debut = 'La date de début est requise';
    } else {
      const startDate = new Date(formData.date_debut);
      if (isNaN(startDate.getTime())) {
        newErrors.date_debut = 'Date de début invalide';
      }
    }

    // Validation du statut
    if (!formData.statut) newErrors.statut = 'Le statut est requis';
    
    // Validation du budget
    if (!formData.budget) {
      newErrors.budget = 'Le budget est requis';
    } else if (isNaN(formData.budget) || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Le budget doit être un nombre positif';
    }
    
    if (!formData.adresse.trim()) newErrors.adresse = 'L\'adresse est requise';
    
    // Validation des dates
    if (formData.date_debut && formData.date_fin) {
      const startDate = new Date(formData.date_debut);
      const endDate = new Date(formData.date_fin);
      
      // S'assurer que les dates sont valides
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
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Formater les dates correctement
      const dateDebut = formData.date_debut ? new Date(formData.date_debut) : new Date();
      const dateFin = formData.date_fin ? new Date(formData.date_fin) : null;
  
      const chantierData = {
        ...formData,
        date_debut: dateDebut,
        date_fin: dateFin,
        budget: parseFloat(formData.budget),
        responsable_id: user.id
      };
  
      console.log('Données envoyées:', chantierData);
      
      if (isEditing) {
        await updateChantier(id, chantierData);
      } else {
        await createChantier(chantierData);
      }
      
      navigate('/chantiers', { 
        state: { 
          success: `Chantier ${isEditing ? 'mis à jour' : 'créé'} avec succès !` 
        } 
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
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Modifier le Chantier' : 'Nouveau Chantier'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Titre */}
            <div className="col-span-2">
              <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
                Titre du chantier *
              </label>
              <input
                type="text"
                id="titre"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${errors.titre ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                placeholder="Ex: Rénovation cuisine"
              />
              {errors.titre && <p className="mt-1 text-sm text-red-600">{errors.titre}</p>}
            </div>

            {/* Client */}
            <div>
              <label htmlFor="client_nom" className="block text-sm font-medium text-gray-700 mb-1">
                Client *
              </label>
              <input
                type="text"
                id="client_nom"
                name="client_nom"
                value={formData.client_nom}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${errors.client_nom ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                placeholder="Nom du client"
              />
              {errors.client_nom && <p className="mt-1 text-sm text-red-600">{errors.client_nom}</p>}
            </div>

            {/* Priorité */}
            <div>
              <label htmlFor="priorite" className="block text-sm font-medium text-gray-700 mb-1">
                Priorité
              </label>
              <select
                id="priorite"
                name="priorite"
                value={formData.priorite}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Statut */}
            <div>
              <label htmlFor="statut" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.statut && <p className="mt-1 text-sm text-red-600">{errors.statut}</p>}
            </div>

            {/* Date de début */}
            <div>
              <label htmlFor="date_debut" className="block text-sm font-medium text-gray-700 mb-1">
                Date de début *
              </label>
              <input
                type="date"
                id="date_debut"
                name="date_debut"
                value={formData.date_debut}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${errors.date_debut ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
              />
              {errors.date_debut && <p className="mt-1 text-sm text-red-600">{errors.date_debut}</p>}
            </div>

            {/* Date de fin */}
            <div>
              <label htmlFor="date_fin" className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin (optionnel)
              </label>
              <input
                type="date"
                id="date_fin"
                name="date_fin"
                value={formData.date_fin}
                onChange={handleChange}
                min={formData.date_debut || ''}
                className={`mt-1 block w-full rounded-md border ${errors.date_fin ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
              />
              {errors.date_fin && <p className="mt-1 text-sm text-red-600">{errors.date_fin}</p>}
            </div>

            {/* Budget */}
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
                  className={`block w-full pl-7 pr-12 sm:text-sm border ${errors.budget ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="0.00"
                />
              </div>
              {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget}</p>}
            </div>

            {/* Adresse */}
            <div className="col-span-2">
              <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse *
              </label>
              <input
                type="text"
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${errors.adresse ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                placeholder="Adresse complète du chantier"
              />
              {errors.adresse && <p className="mt-1 text-sm text-red-600">{errors.adresse}</p>}
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnel)
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Détails sur le chantier..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/chantiers')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isSubmitting 
                ? (isEditing ? 'Mise à jour...' : 'Création en cours...')
                : (isEditing ? 'Mettre à jour le chantier' : 'Créer le chantier')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChantierForm;