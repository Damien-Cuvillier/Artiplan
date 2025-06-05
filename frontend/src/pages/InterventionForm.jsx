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
  const { addIntervention, updateIntervention, interventions, fetchChantierById, currentChantier, isLoading: isLoadingChantier } = useChantierStore()
  const { user } = useAuthStore() 
  const currentUser = user 
  const [images, setImages] = useState([])
  const [submitError, setSubmitError] = useState(null)
  
  const isEditing = !!id
  const existingIntervention = isEditing ? interventions.find(i => i.id === parseInt(id)) : null

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm({
    defaultValues: existingIntervention || {}
  })

  useEffect(() => {
    if (chantierId) {
      fetchChantierById(chantierId)
    }
  }, [chantierId, fetchChantierById])

  useEffect(() => {
    if (existingIntervention) {
      reset(existingIntervention)
    }
  }, [existingIntervention, reset])

  const onSubmit = async (data) => {
    try {
      // Formater la date correctement
      const dateIntervention = data.date 
        ? new Date(data.date).toISOString()
        : new Date().toISOString();

      const response = await fetch(`${API_BASE_URL}/api/interventions/chantier/${chantierId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titre: data.titre,
          description: data.description,
          date_intervention: dateIntervention,
          duree: parseInt(data.duree) || 0,
          statut: data.statut || 'planifiee',
          type: data.type || 'maintenance' // Assurez-vous d'ajouter le type si nécessaire
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de l\'intervention');
      }
  
      // Rediriger vers la page du chantier
      navigate(`/chantiers/${chantierId}`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'intervention:', error);
      setSubmitError(error.message || 'Une erreur est survenue lors de la sauvegarde');
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

  if (isLoadingChantier) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Modifier l\'intervention' : 'Nouvelle intervention'}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </button>
      </div>

      {submitError && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="titre" className="block text-sm font-medium text-gray-700">
              Titre *
            </label>
            <input
              type="text"
              id="titre"
              {...register('titre', { required: 'Le titre est requis' })}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.titre ? 'border-red-500' : ''
              }`}
            />
            {errors.titre && (
              <p className="mt-1 text-sm text-red-600">{errors.titre.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="datetime-local"
              id="date"
              {...register('date')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="duree" className="block text-sm font-medium text-gray-700">
              Durée (heures)
            </label>
            <input
              type="number"
              id="duree"
              min="1"
              {...register('duree', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="statut" className="block text-sm font-medium text-gray-700">
              Statut
            </label>
            <select
              id="statut"
              {...register('statut')}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="planifiee">Planifiée</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              rows={4}
              {...register('description')}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
              defaultValue={''}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Photos</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Téléverser des fichiers</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleImageUpload}
                    multiple
                  />
                </label>
                <p className="pl-1">ou glisser-déposer</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
            </div>
          </div>
          
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Preview ${index + 1}`}
                    className="h-32 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoadingChantier}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoadingChantier ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="-ml-1 mr-2 h-4 w-4" />
                {isEditing ? 'Mettre à jour' : 'Créer l\'intervention'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
export default InterventionForm;