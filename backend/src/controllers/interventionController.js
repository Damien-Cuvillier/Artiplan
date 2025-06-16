import Intervention from '../models/Intervention.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import Chantier from '../models/Chantier.js';
import { deleteImage } from './uploadController.js';

// Fonction utilitaire pour nettoyer les anciennes images
const cleanupOldImages = async (interventionId) => {
  try {
    const oldIntervention = await Intervention.findById(interventionId);
    if (oldIntervention?.images?.length > 0) {
      for (const imgUrl of oldIntervention.images) {
        if (imgUrl?.startsWith?.('/uploads/')) {
          await deleteImage(imgUrl);
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage des anciennes images:', error);
  }
};

/**
 * Créer une nouvelle intervention
 * @route POST /api/interventions
 * @access Privé (Technicien+)
 */
export const createIntervention = catchAsync(async (req, res, next) => {
  console.log('Données reçues dans createIntervention:', JSON.stringify(req.body, null, 2));
  console.log('Images reçues dans req.body.images:', req.body.images);
  
  const { titre, description, date_intervention, duree, statut, type, prix, images = [] } = req.body;
  const technicien_id = req.user.id;
  const chantier_id = req.params.chantierId || req.body.chantier_id;

  console.log('Chantier ID:', chantier_id);
  console.log('Technicien ID:', technicien_id);
  console.log('Images avant formatage:', images);

  // Vérifier que le chantier existe
  const chantier = await Chantier.findById(chantier_id);
  if (!chantier) {
    return next(new AppError('Aucun chantier trouvé avec cet ID', 404));
  }

  // Valider et formater les chemins d'images
  const formattedImages = Array.isArray(images) 
    ? images.map(img => {
        if (typeof img !== 'string') {
          console.log('Image ignorée - pas une chaîne:', img);
          return null;
        }
        // Si c'est déjà une URL complète, on la garde
        if (img.startsWith('http')) {
          console.log('URL complète détectée:', img);
          return img;
        }
        // Si c'est un chemin relatif, on s'assure qu'il commence par /uploads/
        const formatted = img.startsWith('/uploads/') ? img : `/uploads/${img}`;
        console.log('Chemin formaté:', formatted);
        return formatted;
      }).filter(Boolean)
    : [];

  console.log('Images après formatage:', formattedImages);

  const intervention = new Intervention({
    titre,
    description,
    date_intervention: date_intervention || new Date(),
    duree: duree || 0,
    statut: statut || 'planifiee',
    type: type || 'maintenance',
    prix,
    images: formattedImages,
    technicien_id,
    chantier_id
  });

  console.log('Intervention à enregistrer:', JSON.stringify(intervention, null, 2));

  await intervention.save();

  console.log('Intervention enregistrée avec succès, ID:', intervention._id);
  console.log('Images enregistrées:', intervention.images);

  res.status(201).json({
    status: 'success',
    data: {
      intervention
    }
  });
});

/**
 * Obtenir les interventions d'un chantier
 * @route GET /api/chantiers/:chantierId/interventions
 * @access Privé
 */
export const getInterventionsByChantier = catchAsync(async (req, res) => {
  const interventions = await Intervention.find({ chantier_id: req.params.chantierId })
    .populate('technicien_id', 'nom prenom email')
    .sort({ date_intervention: -1 });

  res.status(200).json({
    status: 'success',
    results: interventions.length,
    data: { interventions }
  });
});

/**
 * Obtenir les interventions d'un technicien
 * @route GET /api/techniciens/:technicienId/interventions
 * @access Privé
 */
export const getInterventionsByTechnicien = catchAsync(async (req, res) => {
  const interventions = await Intervention.find({ technicien_id: req.params.technicienId })
    .populate('chantier_id', 'titre client_nom')
    .sort({ date_intervention: -1 });
  
  res.status(200).json({
    status: 'success',
    results: interventions.length,
    data: { interventions }
  });
});

/**
 * Obtenir une intervention par son ID
 * @route GET /api/interventions/:id
 * @access Privé
 */
export const getIntervention = catchAsync(async (req, res, next) => {
  const intervention = await Intervention.findById(req.params.id)
    .populate('technicien_id', 'nom prenom email')
    .populate('chantier_id', 'titre client_nom');
  
  if (!intervention) {
    return next(new AppError('Aucune intervention trouvée avec cet ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: { intervention }
  });
});

/**
 * Mettre à jour une intervention
 * @route PATCH /api/interventions/:id
 * @access Privé (Technicien+)
 */
export const updateIntervention = catchAsync(async (req, res, next) => {
  console.log('Données reçues dans updateIntervention:', JSON.stringify(req.body, null, 2));
  console.log('Images reçues dans req.body.images:', req.body.images);
  
  const { images, ...updateData } = req.body;
  
  // Si des images sont fournies, on formate les chemins
  if (Array.isArray(images)) {
    console.log('Images avant formatage:', images);
    
    updateData.images = images.map(img => {
      if (typeof img !== 'string') {
        console.log('Image ignorée - pas une chaîne:', img);
        return null;
      }
      if (img.startsWith('http')) {
        console.log('URL complète détectée:', img);
        return img;
      }
      const formatted = img.startsWith('/uploads/') ? img : `/uploads/${img}`;
      console.log('Chemin formaté:', formatted);
      return formatted;
    }).filter(Boolean);
    
    console.log('Images après formatage:', updateData.images);
  } else {
    console.log('Aucune image fournie pour la mise à jour');
  }

  console.log('Données de mise à jour:', JSON.stringify(updateData, null, 2));

  const intervention = await Intervention.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );

  if (!intervention) {
    return next(new AppError('Aucune intervention trouvée avec cet ID', 404));
  }

  console.log('Intervention mise à jour avec succès, ID:', intervention._id);
  console.log('Images après mise à jour:', intervention.images);

  res.status(200).json({
    status: 'success',
    data: {
      intervention
    }
  });
});

/**
 * Supprimer une intervention
 * @route DELETE /api/interventions/:id
 * @access Privé (Admin/Gestionnaire)
 */
export const deleteIntervention = catchAsync(async (req, res, next) => {
  const intervention = await Intervention.findByIdAndDelete(req.params.id);
  
  if (!intervention) {
    return next(new AppError('Aucune intervention trouvée avec cet ID', 404));
  }

  // Nettoyer les images associées
  if (intervention.images?.length > 0) {
    for (const imgUrl of intervention.images) {
      if (imgUrl?.startsWith?.('/uploads/')) {
        await deleteImage(imgUrl);
      }
    }
  }

  // Retirer la référence de l'intervention du chantier
  if (intervention.chantier_id) {
    await Chantier.findByIdAndUpdate(
      intervention.chantier_id,
      { $pull: { interventions: intervention._id } },
      { new: true }
    );
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Export par défaut pour la rétrocompatibilité
export default {
  createIntervention,
  getInterventionsByChantier,
  getInterventionsByTechnicien,
  getIntervention,
  updateIntervention,
  deleteIntervention
};