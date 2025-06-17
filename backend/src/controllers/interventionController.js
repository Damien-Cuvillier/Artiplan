import Intervention from '../models/Intervention.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import Chantier from '../models/Chantier.js';
import { deleteImage } from './uploadController.js';
import { sendEmail, notificationTemplates } from '../services/notificationService.js';
import User from '../models/User.js';

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
  const { titre, description, date_intervention, duree, statut, type, prix, images = [] } = req.body;
  const technicien_id = req.user.id;
  const chantier_id = req.params.chantierId || req.body.chantier_id;

  // Vérifier que le chantier existe
  const chantier = await Chantier.findById(chantier_id);
  if (!chantier) {
    return next(new AppError('Aucun chantier trouvé avec cet ID', 404));
  }

  // Valider et formater les chemins d'images
  const formattedImages = Array.isArray(images) 
    ? images.map(img => {
        if (typeof img !== 'string' || !img.trim()) {
          return null;
        }
        // Si c'est déjà une URL complète, on la garde
        if (img.startsWith('http')) {
          return img;
        }
        // Nettoyer le chemin
        let cleanPath = img.trim();
        
        // Supprimer les slashes au début et à la fin
        cleanPath = cleanPath.replace(/^\/+|\/+$/g, '');
        
        // Si le chemin ne commence pas par uploads/, l'ajouter
        if (!cleanPath.startsWith('uploads/')) {
          cleanPath = `uploads/${cleanPath}`;
        }
        
        // Ajouter le slash au début pour le stockage en base
        const formatted = `/${cleanPath}`;
        return formatted;
      }).filter(Boolean)
    : [];

  // Créer l'intervention
  const intervention = await Intervention.create({
    titre,
    description,
    date_intervention: date_intervention || new Date(),
    duree: duree || 0,
    statut: statut || 'planifiée',
    type,
    prix,
    images: formattedImages,
    technicien_id: technicien_id,  
    chantier_id: chantier_id       
  });

  // Récupérer l'utilisateur pour l'email
  const user = await User.findById(technicien_id);
  
  // Envoyer une notification par email
  if (user && user.email) {
    try {
      await sendEmail(
        user.email,
        'NEW_INTERVENTION',
        {
          dateDebut: intervention.date_intervention,
          chantierNom: chantier.nom || 'Sans nom',
          titre: intervention.titre,
          description: intervention.description,
          duree: intervention.duree,
          prix: intervention.prix,
          type: intervention.type,
          _id: intervention._id
        }
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      // Ne pas échouer la requête si l'envoi d'email échoue
    }
  }

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
  const { images, ...updateData } = req.body;
  
  // Si des images sont fournies, on formate les chemins
  if (Array.isArray(images)) {
    updateData.images = images.map(img => {
      if (typeof img !== 'string' || !img.trim()) {
        return null;
      }
      
      // Si c'est déjà une URL complète, la retourner telle quelle
      if (img.startsWith('http')) {
        return img;
      }
      
      // Nettoyer le chemin
      let cleanPath = img.trim();
      
      // Supprimer les slashes au début et à la fin
      cleanPath = cleanPath.replace(/^\/+|\/+$/g, '');
      
      // Si le chemin ne commence pas par uploads/, l'ajouter
      if (!cleanPath.startsWith('uploads/')) {
        cleanPath = `uploads/${cleanPath}`;
      }
      
      // Ajouter le slash au début pour le stockage en base
      const formatted = `/${cleanPath}`;
      return formatted;
    }).filter(Boolean);
  }

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

/**
 * Obtenir toutes les interventions
 * @route GET /api/interventions
 * @access Privé
 */
export const getAllInterventions = catchAsync(async (req, res) => {
  const interventions = await Intervention.find({})
    .populate('technicien_id', 'nom prenom')
    .populate('chantier_id', 'titre client_nom')
    .sort({ date_intervention: -1 });

  res.status(200).json({
    status: 'success',
    results: interventions.length,
    data: { interventions }
  });
});

// Export par défaut pour la rétrocompatibilité
export default {
  createIntervention,
  getInterventionsByChantier,
  getInterventionsByTechnicien,
  getIntervention,
  updateIntervention,
  deleteIntervention,
  getAllInterventions
};