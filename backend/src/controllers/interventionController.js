const Intervention = require('../models/Intervention');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Chantier = require('../models/Chantier');
const authController = require('../controllers/authController');
// src/controllers/interventionController.js
exports.createIntervention = async (req, res) => {
  try {
    const { titre, description, date_intervention, duree, statut } = req.body;
    const technicien_id = req.user.id;
    const chantier_id = req.params.chantierId || req.body.chantierId;

    // Vérifier que le chantier existe
    const chantier = await Chantier.findById(chantier_id);
    if (!chantier) {
      return res.status(404).json({
        status: 'fail',
        message: 'Aucun chantier trouvé avec cet ID'
      });
    }

    const intervention = new Intervention({
      titre,
      description,
      date_intervention: date_intervention || new Date(),
      duree: duree || 0,
      statut: statut || 'planifiee',
      technicien_id,
      chantier_id
    });

    await intervention.save();

    // Mettre à jour le chantier avec la nouvelle intervention
    await Chantier.findByIdAndUpdate(
      chantier_id,
      { $push: { interventions: intervention._id } },
      { new: true, useFindAndModify: false }
    );

    res.status(201).json({
      status: 'success',
      data: {
        intervention
      }
    });
  } catch (error) {
    console.error('Erreur création intervention:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Erreur lors de la création de l\'intervention'
    });
  }
};

exports.getInterventionsByChantier = async (req, res) => {
  try {
    const interventions = await Intervention.find({ chantier_id: req.params.chantierId })
      .populate('technicien_id', 'nom prenom email')
      .sort({ date_intervention: -1 });

    res.status(200).json({
      status: 'success',
      results: interventions.length,
      data: {
        interventions
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des interventions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des interventions'
    });
  }
};

// Obtenir toutes les interventions d'un technicien
exports.getInterventionsByTechnicien = catchAsync(async (req, res, next) => {
  const interventions = await Intervention.find({ technicien_id: req.params.technicienId });
  
  res.status(200).json({
    status: 'success',
    results: interventions.length,
    data: {
      interventions
    }
  });
});

// Obtenir une intervention par son ID
exports.getIntervention = catchAsync(async (req, res, next) => {
  const intervention = await Intervention.findById(req.params.id);
  
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

// Mettre à jour une intervention
exports.updateIntervention = catchAsync(async (req, res, next) => {
  const updatedIntervention = await Intervention.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!updatedIntervention) {
    return next(new AppError('Aucune intervention trouvée avec cet ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      intervention: updatedIntervention
    }
  });
});

// Supprimer une intervention
exports.deleteIntervention = catchAsync(async (req, res, next) => {
  const intervention = await Intervention.findByIdAndDelete(req.params.id);
  
  if (!intervention) {
    return next(new AppError('Aucune intervention trouvée avec cet ID', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});