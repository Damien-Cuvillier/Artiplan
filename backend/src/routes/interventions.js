import express from 'express';
import mongoose from 'mongoose';
import { protect, restrictTo } from '../middleware/auth.js';
import * as interventionController from '../controllers/interventionController.js';
import { validateIntervention } from '../validators/intervention.validator.js';
import Intervention from '../models/Intervention.js';

const router = express.Router();

// Protéger toutes les routes
router.use(protect);

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
router.get('/', interventionController.getAllInterventions);

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