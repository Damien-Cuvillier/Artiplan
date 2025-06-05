import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChantierStore } from '../store/chantierStore';
import { useAuthStore } from '../store/authStore';

const ChantierForm = () => {
  const { user } = useAuthStore();
  const { createChantier } = useChantierStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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
    if (!formData.date_debut) newErrors.date_debut = 'La date de début est requise';
    if (!formData.statut) newErrors.statut = 'Le statut est requis';
    if (!formData.budget) {
      newErrors.budget = 'Le budget est requis';
    } else if (isNaN(formData.budget) || formData.budget <= 0) {
      newErrors.budget = 'Le budget doit être un nombre positif';
    }
    if (!formData.adresse.trim()) newErrors.adresse = 'L\'adresse est requise';
    
    // Validation des dates
    if (formData.date_debut && formData.date_fin) {
      const startDate = new Date(formData.date_debut);
      const endDate = new Date(formData.date_fin);
      
      if (endDate < startDate) {
        newErrors.date_fin = 'La date de fin doit être postérieure à la date de début';
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
      const chantierData = {
        ...formData,
        date_debut: new Date(formData.date_debut).toISOString(),
        date_fin: formData.date_fin ? new Date(formData.date_fin).toISOString() : null,
        budget: parseFloat(formData.budget),
        responsable_id: user.id
      };
      
      console.log('Envoi des données du chantier:', chantierData);
      
      await createChantier(chantierData);
      navigate('/chantiers', { 
        state: { success: 'Chantier créé avec succès !' } 
      });
      
    } catch (error) {
      console.error('Erreur lors de la création du chantier:', error);
      alert(`Erreur: ${error.message || 'Impossible de créer le chantier'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouveau Chantier</h1>
        
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
              {isSubmitting ? 'Création en cours...' : 'Créer le chantier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChantierForm;