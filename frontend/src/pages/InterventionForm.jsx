// pages/InterventionForm.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Save, ArrowLeft, Upload, X } from 'lucide-react'
import { useChantierStore } from '../store/chantierStore'
import useUserRole from '../hooks/useUserRole';
import { API_BASE_URL } from '../config/api';
import { getImageUrl } from '../config/api';


// Fonction utilitaire pour gérer les erreurs de chargement d'images
const handleImageError = (e, imageUrl) => {
  // Si l'image est déjà un SVG d'erreur, ne rien faire
  if (e.target.src && e.target.src.startsWith('data:image/svg+xml')) {
    return;
  }
  
  console.error('Erreur de chargement de l\'image:', imageUrl);
  
  // Remplacer l'image par un placeholder d'erreur
  e.target.onerror = null;
  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzljYTVhZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWltYWdlLW9mZiI+CiAgPHBhdGggZD0iTTE5LjUgMTRuLTIuNTQtMi45QzE2LjQ4IDEwLjM3IDE1LjMgMTAgMTQgMTBjLS4zNiAwLS4zNy0uMDYtMS4xOS0xLjEyLjU0LTEuMSAxLjE5LTIuMzEgMS40NS0yLjg5LjI3LS41OS4yLTE4LjIyLTEuNjEtMTguMTgtMS4yMi4wMS0xLjUzLjc4LS43OCAxLjU5LjUuNTYgMS4yIDEuMjUgMS4yIDIuMTIgMCAuNzgtLjM5IDEuMTUtLjg2IDIuMDgtLjU0Ljk1MC0xLjE3IDIuMTEtMS42MiAzLjIxYS40NC40NCAwIDAgMC0uMDQuMTV2Ni42M3MwIC41Mi40Mi45NS45NS45NWgxMS45Yy41MiAwIC45NS0uNDMuOTUtLjk1di00Ljc1YzAtLjIyLS4wNy0uNDMtLjItLjZ6Ii8+CiAgPHBhdGggZD0ibTIgNCAzLjA5LTMuMTRhMS4yNCAxLjI0IDAgMCAxIDEuNzUtLjAxTDx3IDExIi8+CiAgPHBhdGggZD0ibTIgNCAzLTMiLz4KICA8cGF0aCBkPSJtMyAyMSAyMS0yMSIvPgo8L3N2Zz4=';
  
  // Ajouter une classe pour indiquer visuellement l'erreur
  const container = e.target.closest('div[class*="relative"]');
  if (container) {
    container.classList.add('bg-red-50', 'border', 'border-red-200');
  }
  
  // Ajouter un titre avec l'erreur
  e.target.title = `Impossible de charger l'image: ${imageUrl}`;
};

const InterventionForm = () => {
  const { chantierId, id } = useParams()
  const navigate = useNavigate()
  const { 
    addIntervention, 
    updateIntervention, 
    interventions, 
    fetchChantierById, 
  } = useChantierStore()
  
  const { canEditIntervention } = useUserRole();
  const [images, setImages] = useState([])
  const [submitError, setSubmitError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false);
  const isEditing = !!id
  const [existingIntervention, setExistingIntervention] = useState(null)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [existingImages, setExistingImages] = useState(null)

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
    if (existingIntervention) {
      const formattedIntervention = {
        ...existingIntervention,
        date: existingIntervention.date_intervention 
          ? new Date(existingIntervention.date_intervention).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        prix: existingIntervention.prix && existingIntervention.prix !== "" 
          ? parseFloat(existingIntervention.prix) 
          : undefined
      };
      
      console.log('Données formatées pour le formulaire:', formattedIntervention);
      reset(formattedIntervention);
      
      // Initialiser l'état des images avec les images existantes
      if (existingIntervention.images && existingIntervention.images.length > 0) {
        console.log('Initialisation des images existantes:', existingIntervention.images);
        setImages(existingIntervention.images);
      }
    }
  }, [existingIntervention, reset]);
// Fonction utilitaire pour normaliser les chemins d'images
const normalizeImagePaths = (images) => {
  if (!Array.isArray(images)) return [];
  
  return images.map(img => {
    if (!img) return null;
    
    // Si c'est une URL complète, la retourner telle quelle
    if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
      return img;
    }
    
    // Nettoyer le chemin
    let cleanPath = String(img).trim();
    
    // Supprimer les préfixes /uploads/ pour éviter les doublons
    cleanPath = cleanPath.replace(/^\/+|\/+$/g, ''); // Supprimer les slashes au début et à la fin
    cleanPath = cleanPath.replace(/^uploads\//, ''); // Supprimer le préfixe uploads/ s'il existe
    
    // Pour le stockage dans le state, on garde le chemin relatif sans le préfixe
    // car getImageUrl l'ajoutera automatiquement
    return cleanPath;
  }).filter(Boolean);
};

useEffect(() => {
  if (existingIntervention?.images) {
    console.log('Images avant normalisation:', existingIntervention.images);
    const normalizedImages = normalizeImagePaths(existingIntervention.images);
    console.log('Images après normalisation:', normalizedImages);
    
    // Mettre à jour les images existantes et vider les nouvelles images
    setExistingImages(normalizedImages);
    setImages([]); // Réinitialiser les nouvelles images
  } else {
    setExistingImages([]);
    setImages([]);
  }
}, [existingIntervention]);
  useEffect(() => {
    if (!isEditing || !id) return;

    const loadIntervention = async () => {
      try {
        const interventionFromStore = interventions.find(i => i._id === id);
        
        if (interventionFromStore) {
          console.log('Intervention chargée depuis le store:', interventionFromStore);
          console.log('Images du store:', interventionFromStore.images);
          setExistingIntervention(interventionFromStore);
          
          // Initialiser les images existantes
          if (interventionFromStore.images && interventionFromStore.images.length > 0) {
            console.log('Initialisation des images existantes:', interventionFromStore.images);
            setExistingImages(interventionFromStore.images);
          }
        } else {
          const token = localStorage.getItem('token');
          console.log(`Chargement de l'intervention depuis l'API: ${API_BASE_URL}/interventions/${id}`);
          
          const response = await fetch(`${API_BASE_URL}/interventions/${id}`, {
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
          console.log('Données brutes de l\'intervention:', interventionData);
          
          if (interventionData.images) {
            console.log('Images chargées depuis l\'API:', interventionData.images);
            setExistingImages(interventionData.images);
          }
          
          setExistingIntervention(interventionData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'intervention:', error);
        setSubmitError('Impossible de charger les données de l\'intervention');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadIntervention();
  }, [id, isEditing, interventions]);

  useEffect(() => {
    if (isEditing && !canEditIntervention) {
      setIsReadOnly(true);
    } else if (chantierId) {
      fetchChantierById(chantierId);
    }
  }, [chantierId, isEditing, canEditIntervention, fetchChantierById])

  const onSubmit = async (data) => {
    if (!canEditIntervention) {
      setSubmitError('Vous n\'avez pas les droits pour effectuer cette action');
      return;
    }

    setIsLoading(true);
    setSubmitError('');

    try {
      console.log('Données du formulaire:', data);
      console.log('Images existantes avant normalisation:', existingImages);
      console.log('Nouvelles images avant normalisation:', images);
      
      // Normaliser tous les chemins d'images
      const normalizedExistingImages = normalizeImagePaths(existingImages || []);
      const normalizedNewImages = normalizeImagePaths(images || []);
      // Filtrer les nouvelles images pour éviter les doublons avec les images existantes
      const uniqueNewImages = normalizedNewImages.filter(newImg => 
        !normalizedExistingImages.some(existingImg => 
          existingImg.endsWith(newImg) || newImg.endsWith(existingImg)
        )
      );
      
      // Combiner les images existantes et les nouvelles images
      const allImages = [...normalizedExistingImages, ...uniqueNewImages];
      
      console.log('Toutes les images après normalisation:', allImages);

      // Préparer les données de l'intervention
      const interventionData = {
        titre: data.titre,
        description: data.description,
        date_intervention: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        duree: parseInt(data.duree) || 0,
        statut: data.statut || 'planifiee',
        type: data.type || 'maintenance',
        ...(data.prix !== undefined && { prix: parseFloat(data.prix) }),
        images: allImages
      };

      console.log('Données à envoyer après normalisation:', interventionData);

      if (isEditing && existingIntervention) {
        console.log('Mise à jour de l\'intervention existante:', existingIntervention._id);
        await updateIntervention({
          ...interventionData,
          _id: existingIntervention._id,
          chantier_id: chantierId
        });
      } else {
        console.log('Création d\'une nouvelle intervention');
        await addIntervention({
          ...interventionData,
          chantier_id: chantierId
        });
      }
  
      navigate(`/chantiers/${chantierId}`, {
        state: { success: `Intervention ${isEditing ? 'mise à jour' : 'créée'} avec succès !` },
        replace: false
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSubmitError(error.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (existingIntervention?.images) {
      console.log('Images avant normalisation:', existingIntervention.images);
      const normalizedImages = normalizeImagePaths(existingIntervention.images);
      console.log('Images après normalisation:', normalizedImages);
      setExistingImages(normalizedImages);
    }
  }, [existingIntervention]);
  
  // Fonction pour supprimer une image du serveur
  const deleteImageFromServer = async (imagePath) => {
    try {
      console.log('Tentative de suppression de l\'image:', imagePath);
      
      // Nettoyer le chemin de l'image pour ne garder que le nom du fichier
      let filename = imagePath;
      
      // Si c'est une URL complète, extraire le nom du fichier
      if (imagePath.includes('/')) {
        filename = imagePath.split('/').pop();
        console.log('Nom du fichier extrait:', filename);
      }
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ filePath: filename })
      });
      
      const data = await response.json();
      console.log('Réponse du serveur:', data);
      
      if (data.status === 'success') {
        console.log('Image supprimée du serveur:', filename);
        return true;
      } else {
        console.error('Erreur lors de la suppression du fichier:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      return false;
    }
  };

  const removeImage = async (index, isExisting = false) => {
    const imageToDelete = isExisting ? existingImages[index] : images[index];
    
    console.log('Suppression de l\'image:', imageToDelete);
    
    try {
      // Supprimer l'image du serveur si c'est une nouvelle image
      if (!isExisting) {
        console.log('Suppression du serveur pour une nouvelle image');
        await deleteImageFromServer(imageToDelete);
      } else {
        console.log('Suppression du serveur pour une image existante');
        // Pour les images existantes, on essaie aussi de les supprimer du serveur
        await deleteImageFromServer(imageToDelete);
      }
      
      // Mettre à jour l'état local
      if (isExisting) {
        setExistingImages(prev => {
          const newImages = [...prev];
          newImages.splice(index, 1);
          console.log('Images existantes après suppression:', newImages);
          return newImages;
        });
        
        // Mettre à jour également l'intervention existante si en mode édition
        if (existingIntervention) {
          setExistingIntervention(prev => {
            const updated = {
              ...prev,
              images: prev.images.filter((_, i) => i !== index)
            };
            console.log('Intervention mise à jour après suppression:', updated);
            return updated;
          });
        }
      } else {
        setImages(prev => {
          const newImages = [...prev];
          newImages.splice(index, 1);
          console.log('Nouvelles images après suppression:', newImages);
          return newImages;
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      // Même en cas d'erreur, on met à jour l'interface pour éviter un état incohérent
      if (isExisting) {
        setExistingImages(prev => {
          const newImages = [...prev];
          newImages.splice(index, 1);
          return newImages;
        });
      } else {
        setImages(prev => {
          const newImages = [...prev];
          newImages.splice(index, 1);
          return newImages;
        });
      }
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setSubmitError(null);

    try {
      for (const file of files) {
        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          throw new Error('Seuls les fichiers image sont autorisés');
        }

        // Vérifier la taille du fichier (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('La taille maximale d\'une image est de 10MB');
        }

        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Échec du téléchargement de l\'image');
        }

        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
          // Extraire uniquement le chemin relatif (sans l'URL de base)
          const imagePath = result.data.imageUrl.startsWith('/') 
            ? result.data.imageUrl 
            : `/${result.data.imageUrl}`;
          
          setImages(prev => [...prev, imagePath]);
          
          // Mettre à jour également l'intervention existante si en mode édition
          if (existingIntervention) {
            setExistingIntervention(prev => ({
              ...prev,
              images: [...(prev.images || []), imagePath]
            }));
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement des images:', error);
      setSubmitError(error.message || 'Erreur lors du téléchargement des images');
    } finally {
      setIsUploading(false);
      // Réinitialiser l'input file pour permettre le téléchargement du même fichier
      e.target.value = '';
    }
  };

  if (isReadOnly) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Accès refusé</h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas les autorisations nécessaires pour {isEditing ? 'modifier' : 'créer'} cette intervention.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Retour
            </button>
          </div>
        </div>
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
                readOnly={isReadOnly}
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
                className={`w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  isReadOnly ? 'bg-gray-100' : ''
                }`}
                {...register('date', { required: 'La date est requise' })}
                defaultValue={existingIntervention?.date_intervention 
                  ? new Date(existingIntervention.date_intervention).toISOString().slice(0, 16)
                  : ''
                }
                readOnly={isReadOnly}
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
                className={`w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  isReadOnly ? 'bg-gray-100' : ''
                }`}
                {...register('duree')}
                defaultValue={existingIntervention?.duree || ''}
                readOnly={isReadOnly}
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
                className={`w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  isReadOnly ? 'bg-gray-100' : ''
                }`}
                {...register('prix', {
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: 'Le prix ne peut pas être négatif'
                  }
                })}
                value={watch('prix') || ''} 
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : e.target.value;
                  setValue('prix', value, { shouldValidate: true });
                }}
                readOnly={isReadOnly}
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
                className={`w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  isReadOnly ? 'bg-gray-100' : ''
                }`}
                {...register('statut')}
                defaultValue={existingIntervention?.statut || 'planifiee'}
                readOnly={isReadOnly}
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
              className={`w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                isReadOnly ? 'bg-gray-100' : ''
              }`}
              {...register('description')}
              defaultValue={existingIntervention?.description || ''}
              readOnly={isReadOnly}
            />
          </div>

          {/* Section des images existantes */}
          {existingIntervention?.images?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Images existantes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingIntervention.images.map((image, index) => {
                  if (!image) return null;
                  
                  const imageUrl = getImageUrl(image);
                  console.log(`Rendu de l'image existante ${index}:`, imageUrl);
                  
                  return (
                    <div key={`existing-${index}`} className="relative group">
                      <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden border border-gray-200 hover:border-indigo-300 transition-colors">
                        <img 
                          src={imageUrl}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => handleImageError(e, imageUrl)}
                          loading="lazy"
                        />
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => removeImage(index, true)}
                            className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Supprimer l'image"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Section des nouvelles images */}
          {images.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Nouvelles images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <div className="relative w-full h-32 bg-gray-50 rounded-md overflow-hidden border border-gray-200 hover:border-indigo-300 transition-colors">
                      <img 
                        src={getImageUrl(image)}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => handleImageError(e, getImageUrl(image))}
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer l'image"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Section d'ajout d'images */}
          {!isReadOnly && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {existingIntervention?.images?.length > 0 ? 'Ajouter des images' : 'Images'}
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                        disabled={isUploading}
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF jusqu'à 10MB
                  </p>
                  {isUploading && (
                    <div className="mt-2">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full animate-pulse"></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Téléchargement en cours...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Aperçu des images téléchargées */}
              {images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Nouvelles images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group border border-gray-200 rounded-md p-1">
                        <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                          <img
                            src={getImageUrl(image)}
                            alt={`Nouvelle image ${index + 1}`}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => handleImageError(e, getImageUrl(image))}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          title="Supprimer l'image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bouton de soumission */}
          {!isReadOnly && (
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    {isEditing ? 'Mettre à jour' : 'Créer'} l'intervention
                  </>
                )}
              </button>
            </div>
          )}

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
};

export default InterventionForm;