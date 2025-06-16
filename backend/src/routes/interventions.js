import express from 'express';
import mongoose from 'mongoose';
import { protect, restrictTo } from '../middleware/auth.js';
import * as interventionController from '../controllers/interventionController.js';
import { validateIntervention } from '../validators/intervention.validator.js';
import Intervention from '../models/Intervention.js';
import User from '../models/User.js';
import Chantier from '../models/Chantier.js';

const router = express.Router();

// Protéger toutes les routes
router.use(protect);

// Créer une intervention pour un chantier
router.post('/chantier/:chantierId', 
  restrictTo('admin', 'gestionnaire', 'technicien'),
  validateIntervention,
  interventionController.createIntervention
);

// Récupérer les interventions par chantier
router.route('/chantier/:chantierId')
  .get(interventionController.getInterventionsByChantier)
  .post(
    restrictTo('admin', 'gestionnaire', 'technicien'),
    validateIntervention,
    interventionController.createIntervention
  );

// Récupérer les interventions par technicien
router.route('/technicien/:technicienId')
  .get(interventionController.getInterventionsByTechnicien);

// GET /api/interventions - Récupérer toutes les interventions
router.get('/', async (req, res) => {
  console.log('Tentative de récupération des interventions...');
  
  try {
    // 1. Vérifier la connexion à la base de données
    console.log('État connexion MongoDB:', mongoose.connection.readyState === 1 ? 'Connecté' : 'Non connecté');
    
    // 2. Tester une requête simple
    console.log('Exécution de la requête de base...');
    const count = await Intervention.countDocuments();
    console.log(`Nombre total d'interventions: ${count}`);
    
    // 3. Récupérer les interventions
    const interventions = await Intervention.find({})
      .populate('technicien_id', 'nom prenom')
      .populate('chantier_id', 'titre client_nom')
      .lean();

    console.log(`Nombre d'interventions récupérées: ${interventions.length}`);
    
    return res.status(200).json({
      status: 'success',
      results: interventions.length,
      data: { interventions }
    });

  } catch (error) {
    console.error('ERREUR DÉTAILLÉE:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des interventions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Opérations sur une intervention spécifique
router.route('/:id')
  .get(interventionController.getIntervention)
  .patch(
    restrictTo('admin', 'gestionnaire', 'technicien'),
    validateIntervention,
    interventionController.updateIntervention
  )
  .delete(
    restrictTo('admin', 'gestionnaire'),
    interventionController.deleteIntervention
  );

export default router;