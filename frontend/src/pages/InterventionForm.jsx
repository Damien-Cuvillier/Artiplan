// pages/InterventionForm.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Save, ArrowLeft, Upload, X } from 'lucide-react'
import { useChantierStore } from '../store/chantierStore'
import { useAuthStore } from '../store/authStore'
import { API_BASE_URL } from '../config/api';

const InterventionForm = () => {
  const { chantierId, id } = useParams()
  const navigate = useNavigate()
  const { 
    addIntervention, 
    updateIntervention, 
    interventions, 
    fetchChantierById, 
    isLoading: isLoadingChantier,
  } = useChantierStore()
  const { user } = useAuthStore() 
  const currentUser = user 
  const [images, setImages] = useState([])
  const [submitError, setSubmitError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const isEditing = !!id
  const [existingIntervention, setExistingIntervention] = useState(null)

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm()

  useEffect(() => {
    if (chantierId) {
      fetchChantierById(chantierId)
    }
  }, [chantierId, fetchChantierById])
useEffect(() => {
    if (chantierId) {
      fetchChantierById(chantierId)
    }
  }, [chantierId, fetchChantierById])

  useEffect(() => {
    if (existingIntervention) {
      // Formater la date pour l'input datetime-local
      const formattedIntervention = {
        ...existingIntervention,
        date: existingIntervention.date_intervention 
          ? new Date(existingIntervention.date_intervention).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        // Convertir le prix en nombre s'il existe, sinon undefined
        prix: existingIntervention.prix && existingIntervention.prix !== "" 
          ? parseFloat(existingIntervention.prix) 
          : undefined
      };
      console.log('Données formatées pour le formulaire:', formattedIntervention);
      reset(formattedIntervention);
    }
  }, [existingIntervention, reset]);

  useEffect(() => {
    const loadIntervention = async () => {
      if (!isEditing || !id) return;
      
      setIsLoading(true);
      try {
        // D'abord, vérifier dans le store
        const interventionFromStore = interventions.find(i => i._id === id);
        
        if (interventionFromStore) {
          setExistingIntervention(interventionFromStore);
        } else {
          // Si pas dans le store, charger depuis l'API
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/api/interventions/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (!response.ok) {
            throw new Error('Impossible de charger les données de l\'intervention');
          }

          const data = await response.json();
          const interventionData = data.data || data;
          setExistingIntervention(interventionData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'intervention:', error);
        setSubmitError('Erreur lors du chargement des données de l\'intervention');
      } finally {
        setIsLoading(false);
      }
    };

    loadIntervention();
  }, [id, isEditing, interventions]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      console.log('Données du formulaire:', data);
      // Formater la date correctement
      const dateIntervention = data.date 
        ? new Date(data.date).toISOString()
        : new Date().toISOString();
    
      const interventionData = {
        titre: data.titre,
        description: data.description,
        date_intervention: dateIntervention,
        duree: parseInt(data.duree) || 0,
        statut: data.statut || 'planifiee',
        type: data.type || 'maintenance',
        ...(data.prix !== undefined && { prix: parseFloat(data.prix) })
      };
    
      const token = localStorage.getItem('token');
      let response;
      
      if (isEditing && existingIntervention) {
        // Mise à jour d'une intervention existante
        console.log('ID de l\'intervention:', existingIntervention._id); // Vérifiez cet
        response = await fetch(`${API_BASE_URL}/api/interventions/${existingIntervention._id}`, {
          method: 'PATCH',  // Utiliser PATCH au lieu de PUT
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(interventionData)
        });
      } else {
        // Création d'une nouvelle intervention
        response = await fetch(`${API_BASE_URL}/api/interventions/chantier/${chantierId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(interventionData)
        });
      }
  
      if (!response.ok) {
        let errorMessage = `Erreur lors de la ${isEditing ? 'mise à jour' : 'création'} de l'intervention`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Erreur lors de la lecture du message d\'erreur:', e);
        }
        throw new Error(errorMessage);
      }
  
      const result = await response.json();
      const updatedIntervention = result.data || result;
  
      // Mettre à jour le store local
      if (isEditing) {
        updateIntervention(updatedIntervention);
      } else {
        addIntervention(updatedIntervention);
      }
  
      // Rediriger vers la page du chantier
      navigate(`/chantiers/${chantierId}`);
  } catch (error) {
    console.error(`Erreur lors de la ${isEditing ? 'mise à jour' : 'création'} de l'intervention:`, error);
    setSubmitError(error.message || `Une erreur est survenue lors de la ${isEditing ? 'mise à jour' : 'création'}`);
  } finally {
    setIsLoading(false);
  }
};

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImages(prev => [...prev, e.target.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  if (isLoading || isLoadingChantier) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isEditing && !existingIntervention && !isLoading) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Impossible de charger les données de l'intervention.</p>
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Modifier l\'intervention' : 'Nouvelle intervention'}
        </h1>
        <div className="w-8"></div> {/* Pour l'alignement */}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
                id="titre"
                type="text"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                {...register('titre', { required: 'Le titre est requis' })}
                defaultValue={existingIntervention?.titre || ''}
              />
              {errors.titre && (
                <p className="mt-1 text-sm text-red-600">{errors.titre.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                id="date"
                type="datetime-local"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                {...register('date', { required: 'La date est requise' })}
                defaultValue={existingIntervention?.date_intervention 
                  ? new Date(existingIntervention.date_intervention).toISOString().slice(0, 16)
                  : ''
                }
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="duree" className="block text-sm font-medium text-gray-700 mb-1">
                Durée (heures)
              </label>
              <input
                id="duree"
                type="number"
                min="0"
                step="0.5"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                {...register('duree')}
                defaultValue={existingIntervention?.duree || ''}
              />
            </div>

            <div>
              <label htmlFor="prix" className="block text-sm font-medium text-gray-700 mb-1">
                Prix (€)
              </label>
              <input
                id="prix"
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                {...register('prix', {
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: 'Le prix ne peut pas être négatif'
                  }
                })}
                value={watch('prix') || ''} // S'assurer que la valeur est une chaîne vide si undefined
    onChange={(e) => {
      // Permettre de vider le champ
      const value = e.target.value === '' ? undefined : e.target.value;
      setValue('prix', value, { shouldValidate: true });
    }}
  />
  {errors.prix && (
    <p className="mt-1 text-sm text-red-600">{errors.prix.message}</p>
  )}
</div>

            <div>
              <label htmlFor="statut" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                id="statut"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                {...register('statut')}
                defaultValue={existingIntervention?.statut || 'planifiee'}
              >
                <option value="planifiee">Planifiée</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              {...register('description')}
              defaultValue={existingIntervention?.description || ''}
            />
          </div>

          {/* Section des images existantes */}
          {existingIntervention?.images?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Images existantes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingIntervention.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`Image ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section d'ajout d'images */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {existingIntervention?.images?.length > 0 ? 'Ajouter des images' : 'Images'}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Télécharger des fichiers</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF jusqu'à 10MB
                </p>
              </div>
            </div>

            {/* Aperçu des images téléchargées */}
            {images.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Nouvelles images</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image} 
                        alt={`Nouvelle image ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer l'image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bouton de soumission */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Save size={18} className="mr-2" />
              {isEditing ? 'Mettre à jour' : 'Créer'} l'intervention
            </button>
          </div>

          {/* Message d'erreur */}
          {submitError && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {submitError}
                  </h3>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
export default InterventionForm;